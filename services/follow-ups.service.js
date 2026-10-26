import "server-only";

import { Timestamp } from "firebase-admin/firestore";

import { COLLECTIONS } from "@/constants/collections";
import { CLOSED_LEAD_STATUSES } from "@/constants/lead-status";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  buildNotification,
  NOTIFICATION_TYPES,
} from "@/lib/notifications/notification-service";
import { notifyFollowUpsDue } from "@/lib/notifications/email-notifier";
import { logActivity } from "@/services/activity.service";

const BATCH_SIZE = 50;

/**
 * Due leads ke liye reminder banata hai.
 * Idempotent: har lead ka reminder ek transaction ma (notification + followUpReminded=true) hota hai,
 * aur transaction ke andar dobara check hota hai ke date wahi hai aur flag abhi false hai.
 * Is liye cron do dafa chale ya follow-up date beech ma badal jaye to galat/duplicate reminder nahi banta.
 */
export async function processFollowUps() {
  const db = getAdminDb();

  const snapshot = await db
    .collection(COLLECTIONS.leads)
    .where("followUpReminded", "==", false)
    .where("followUpAt", "<=", Timestamp.now())
    .orderBy("followUpAt", "asc")
    .limit(BATCH_SIZE)
    .get();

  const results = await Promise.allSettled(
    snapshot.docs.map((doc) => {
      const queriedMillis = doc.data().followUpAt.toMillis();

      return db.runTransaction(async (tx) => {
        const fresh = await tx.get(doc.ref);
        const lead = fresh.data();

        if (
          !lead ||
          lead.followUpReminded !== false ||
          lead.followUpAt?.toMillis() !== queriedMillis
        ) {
          return null;
        }

        // Band leads ko reminder nahi, bas flag hata do taake query ma dobara na aayen.
        if (CLOSED_LEAD_STATUSES.includes(lead.status)) {
          tx.update(doc.ref, { followUpReminded: true });
          return null;
        }

        const notification = buildNotification({
          type: NOTIFICATION_TYPES.FOLLOW_UP_DUE,
          entityId: `${doc.id}_${queriedMillis}`,
          title: "Follow-up due",
          body: `${lead.name} · ${lead.reference}`,
          link: `/admin/leads/${doc.id}`,
        });

        tx.set(
          db.collection(COLLECTIONS.notifications).doc(notification.id),
          notification.data,
        );
        tx.update(doc.ref, { followUpReminded: true });

        return {
          id: doc.id,
          name: lead.name,
          reference: lead.reference,
          dueAt: queriedMillis,
        };
      });
    }),
  );

  const failed = results.filter((result) => result.status === "rejected");
  failed.forEach((result) =>
    console.error("[follow-ups] lead failed:", result.reason),
  );

  const notified = results
    .filter((result) => result.status === "fulfilled" && result.value)
    .map((result) => result.value);

  await notifyFollowUpsDue(notified);

  await logActivity({
    action: "cron.follow_ups",
    entityType: "lead",
    meta: {
      checked: snapshot.size,
      notified: notified.length,
      failed: failed.length,
    },
  });

  return {
    checked: snapshot.size,
    notified: notified.length,
    failed: failed.length,
  };
}
