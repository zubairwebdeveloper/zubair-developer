import "server-only";

import { COLLECTIONS } from "@/constants/collections";
import { getAdminDb } from "@/lib/firebase/admin";
import { serializeDoc } from "@/lib/firebase/firestore";

const BATCH_LIMIT = 400;

export async function listNotifications({
  unreadOnly = false,
  limit = 50,
} = {}) {
  let query = getAdminDb().collection(COLLECTIONS.notifications);
  if (unreadOnly) query = query.where("read", "==", false);

  const snapshot = await query.orderBy("createdAt", "desc").limit(limit).get();
  return snapshot.docs.map(serializeDoc);
}

export async function markNotificationsRead(ids) {
  const db = getAdminDb();
  const batch = db.batch();

  ids.forEach((id) => {
    batch.update(db.collection(COLLECTIONS.notifications).doc(id), {
      read: true,
    });
  });

  await batch.commit();
}

export async function markAllNotificationsRead() {
  const db = getAdminDb();
  const snapshot = await db
    .collection(COLLECTIONS.notifications)
    .where("read", "==", false)
    .limit(BATCH_LIMIT)
    .get();

  if (snapshot.empty) return 0;

  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.update(doc.ref, { read: true }));
  await batch.commit();

  return snapshot.size;
}
