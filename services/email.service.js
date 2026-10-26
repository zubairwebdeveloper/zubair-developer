import "server-only";

import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { COLLECTIONS } from "@/constants/collections";
import {
  EmailSendError,
  isEmailConfigured,
  sendWithProvider,
} from "@/lib/email/provider";
import { getAdminDb } from "@/lib/firebase/admin";
import { serializeDoc, serverTimestamp } from "@/lib/firebase/firestore";

const MAX_ATTEMPTS = 5;
const LOCK_MS = 2 * 60 * 1000;
const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

const eventsRef = () => getAdminDb().collection(COLLECTIONS.emailEvents);

/**
 * @returns {Promise<{ status: "sent" | "failed" | "dead" | "skipped" | "not_configured" | "no_recipients", kind?: string }>}
 * `key` idempotency key hai: same key par email sirf ek dafa jati hai.
 */
export async function deliverEmail({ key, to, subject, text, html }) {
  if (!isEmailConfigured()) return { status: "not_configured" };
  if (!to?.length) return { status: "no_recipients" };

  const ref = eventsRef().doc(key);

  const attempt = await getAdminDb().runTransaction(async (tx) => {
    const snapshot = await tx.get(ref);
    const data = snapshot.exists ? snapshot.data() : null;

    if (data?.status === "sent" || data?.status === "dead") return 0;
    if (data?.status === "sending" && data.lockUntil?.toMillis() > Date.now())
      return 0;
    if ((data?.attempts ?? 0) >= MAX_ATTEMPTS) return 0;

    const attempts = (data?.attempts ?? 0) + 1;
    tx.set(
      ref,
      {
        ...(data
          ? {}
          : {
              createdAt: serverTimestamp(),
              expiresAt: Timestamp.fromMillis(Date.now() + RETENTION_MS),
            }),
        status: "sending",
        attempts,
        lockUntil: Timestamp.fromMillis(Date.now() + LOCK_MS),
        // Retry ke liye payload chahiye. Success ya dead hone par delete ho jata hai.
        payload: { to, subject, text, html },
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    return attempts;
  });

  if (attempt === 0) return { status: "skipped" };

  try {
    await sendWithProvider({ to, subject, text, html, idempotencyKey: key });
    await ref.update({
      status: "sent",
      sentAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      payload: FieldValue.delete(),
      lockUntil: FieldValue.delete(),
      lastError: FieldValue.delete(),
    });
    return { status: "sent" };
  } catch (error) {
    const kind = error instanceof EmailSendError ? error.kind : "unknown";
    const dead = attempt >= MAX_ATTEMPTS;
    console.error(
      `[email] "${key}" failed (attempt ${attempt}, ${kind}):`,
      error,
    );

    await ref
      .update({
        status: dead ? "dead" : "failed",
        lastError: { kind, at: Timestamp.now() },
        updatedAt: serverTimestamp(),
        lockUntil: FieldValue.delete(),
        ...(dead ? { payload: FieldValue.delete() } : {}),
      })
      .catch((updateError) =>
        console.error("[email] could not record failure:", updateError),
      );

    return { status: dead ? "dead" : "failed", kind };
  }
}

/** Cron ke saath chalta hai: failed ya atki hui ("sending", lock expire) emails dobara try. */
export async function retryFailedEmails(limit = 20) {
  const snapshot = await eventsRef()
    .where("status", "in", ["failed", "sending"])
    .limit(limit)
    .get();
  const counts = { sent: 0, failed: 0, skipped: 0 };

  for (const doc of snapshot.docs) {
    const payload = doc.data().payload;
    if (!payload) continue;

    const result = await deliverEmail({ key: doc.id, ...payload });
    if (result.status === "sent") counts.sent += 1;
    else if (result.status === "skipped") counts.skipped += 1;
    else counts.failed += 1;
  }

  return counts;
}

export async function listEmailEvents(limit = 10) {
  const snapshot = await eventsRef()
    .orderBy("updatedAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map(serializeDoc).map((event) => ({
    id: event.id,
    template: String(event.id).split("_")[0],
    status: event.status,
    attempts: event.attempts ?? 0,
    errorKind: event.lastError?.kind ?? null,
    updatedAt: event.updatedAt,
  }));
}
