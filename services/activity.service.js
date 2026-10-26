import "server-only";

import { COLLECTIONS } from "@/constants/collections";
import { getAdminDb } from "@/lib/firebase/admin";
import { serverTimestamp } from "@/lib/firebase/firestore";

/** Audit event. Koi personal data nahi: sirf action, entity aur actor. */
export async function logActivity({
  action,
  entityType,
  entityId = null,
  admin = null,
  meta = null,
}) {
  try {
    await getAdminDb()
      .collection(COLLECTIONS.activityLogs)
      .add({
        action,
        entityType,
        entityId,
        actor: admin
          ? { type: "admin", uid: admin.uid, role: admin.role }
          : { type: "system" },
        meta,
        createdAt: serverTimestamp(),
      });
  } catch (error) {
    // Audit fail hone se asli kaam nahi rukna chahiye, lekin failure log zaroor hota hai.
    console.error("[activity] failed to write log:", error);
  }
}
