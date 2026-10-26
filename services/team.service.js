import "server-only";

import { COLLECTIONS } from "@/constants/collections";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { serializeDoc, serverTimestamp } from "@/lib/firebase/firestore";
import { ConflictError, NotFoundError } from "@/lib/utils/errors";
import { logActivity } from "@/services/activity.service";

export async function listTeam() {
  const snapshot = await getAdminDb()
    .collection(COLLECTIONS.adminUsers)
    .orderBy("createdAt", "desc")
    .limit(100)
    .get();

  return snapshot.docs.map(serializeDoc);
}

/**
 * Agar Firebase Auth ma user nahi hai to bana deta hai (bina password ke).
 * Naya member login page ke "Forgot password?" se apna password khud set karta hai.
 */
export async function addTeamMember({ email, name, role }, admin) {
  const auth = getAdminAuth();
  let user;
  let created = false;

  try {
    user = await auth.getUserByEmail(email);
  } catch (error) {
    if (error?.code !== "auth/user-not-found") throw error;
    user = await auth.createUser({
      email,
      displayName: name || undefined,
      emailVerified: false,
    });
    created = true;
  }

  try {
    // create() fail hota hai agar document pehle se ho: race-safe duplicate check.
    await getAdminDb()
      .collection(COLLECTIONS.adminUsers)
      .doc(user.uid)
      .create({
        email: user.email,
        displayName: name || user.displayName || null,
        role,
        status: "active",
        createdBy: admin.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
  } catch (error) {
    if (error?.code === 6 || error?.code === "already-exists") {
      throw new ConflictError("This person is already on the team.");
    }
    throw error;
  }

  await logActivity({
    action: "team.member_added",
    entityType: "team",
    entityId: user.uid,
    admin,
    meta: { role },
  });

  return { uid: user.uid, created };
}

export async function updateTeamMember(uid, patch, admin) {
  // Lockout se bachao: apna role ya status khud nahi badal sakte.
  if (uid === admin.uid) {
    throw new ConflictError("You cannot change your own role or status.");
  }

  const ref = getAdminDb().collection(COLLECTIONS.adminUsers).doc(uid);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new NotFoundError("Team member not found.");

  await ref.update({
    ...patch,
    updatedAt: serverTimestamp(),
    updatedBy: admin.uid,
  });

  // Disable hone par uske tamam sessions foran khatam.
  if (patch.status === "disabled") {
    await getAdminAuth().revokeRefreshTokens(uid);
  }

  await logActivity({
    action: "team.member_updated",
    entityType: "team",
    entityId: uid,
    admin,
    meta: patch,
  });
}
