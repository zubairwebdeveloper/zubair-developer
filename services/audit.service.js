import "server-only";

import { COLLECTIONS } from "@/constants/collections";
import { getAdminDb } from "@/lib/firebase/admin";
import { serializeDoc } from "@/lib/firebase/firestore";

export const AUDIT_PAGE_SIZE = 50;

export async function listActivity({
  after = null,
  limit = AUDIT_PAGE_SIZE,
} = {}) {
  const db = getAdminDb();
  let query = db
    .collection(COLLECTIONS.activityLogs)
    .orderBy("createdAt", "desc");

  if (after) {
    const cursor = await db
      .collection(COLLECTIONS.activityLogs)
      .doc(after)
      .get();
    if (cursor.exists) query = query.startAfter(cursor);
  }

  const snapshot = await query.limit(limit + 1).get();
  const logs = snapshot.docs.slice(0, limit).map(serializeDoc);

  return {
    logs,
    nextCursor: snapshot.docs.length > limit ? logs.at(-1).id : null,
  };
}
