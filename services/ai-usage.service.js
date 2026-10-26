import "server-only";

import { FieldPath, FieldValue, Timestamp } from "firebase-admin/firestore";

import { COLLECTIONS } from "@/constants/collections";
import { getAdminDb } from "@/lib/firebase/admin";
import { serializeDoc } from "@/lib/firebase/firestore";

const todayKey = () => new Date().toISOString().slice(0, 10); // UTC din
const usageDoc = (key) => getAdminDb().collection(COLLECTIONS.aiUsage).doc(key);

/** Usage tracking kabhi asli kaam ko nahi rokti: fail ho to sirf log. */
export async function recordUsage(delta = {}, errorKind = null) {
  try {
    const update = Object.fromEntries(
      Object.entries(delta).map(([key, value]) => [
        key,
        FieldValue.increment(value),
      ]),
    );
    if (errorKind) {
      update.errors = FieldValue.increment(1);
      update.lastError = { kind: errorKind, at: Timestamp.now() };
    }
    await usageDoc(todayKey()).set(update, { merge: true });
  } catch (error) {
    console.error("[ai-usage] failed to record:", error);
  }
}

export async function getTodayMessageCount() {
  try {
    const snapshot = await usageDoc(todayKey()).get();
    return snapshot.exists ? (snapshot.data().messages ?? 0) : 0;
  } catch (error) {
    console.error("[ai-usage] failed to read today's count:", error);
    return 0;
  }
}

export async function listUsage(days = 14) {
  const snapshot = await getAdminDb()
    .collection(COLLECTIONS.aiUsage)
    .orderBy(FieldPath.documentId(), "desc")
    .limit(days)
    .get();

  return snapshot.docs.map(serializeDoc);
}
