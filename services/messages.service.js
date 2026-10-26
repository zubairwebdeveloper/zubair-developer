import "server-only";

import { COLLECTIONS } from "@/constants/collections";
import { getAdminDb } from "@/lib/firebase/admin";
import { serializeDoc, serverTimestamp } from "@/lib/firebase/firestore";
import { NotFoundError } from "@/lib/utils/errors";
import { logActivity } from "@/services/activity.service";

export async function listMessages({ limit = 50 } = {}) {
  const snapshot = await getAdminDb()
    .collection(COLLECTIONS.inquiries)
    .where("type", "==", "contact")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs
    .map(serializeDoc)
    .filter((message) => message.status !== "archived");
}

export async function setMessageStatus(id, status, admin) {
  const ref = getAdminDb().collection(COLLECTIONS.inquiries).doc(id);
  const snapshot = await ref.get();

  if (!snapshot.exists || snapshot.data().type !== "contact") {
    throw new NotFoundError("Message not found.");
  }

  await ref.update({ status, updatedAt: serverTimestamp() });
  await logActivity({
    action: `message.${status}`,
    entityType: "inquiry",
    entityId: id,
    admin,
  });
}
