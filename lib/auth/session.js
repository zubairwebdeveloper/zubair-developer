import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

import { SESSION_COOKIE } from "@/constants/auth";
import { COLLECTIONS } from "@/constants/collections";
import { isValidRole } from "@/lib/auth/permissions";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { NotConfiguredError } from "@/lib/utils/errors";

/**
 * Role ka trusted source: Firestore `adminUsers/{uid}`.
 * Sirf active aur valid-role wale users ko admin maana jata hai.
 */
export async function getAdminRecord(uid) {
  const snapshot = await getAdminDb()
    .collection(COLLECTIONS.adminUsers)
    .doc(uid)
    .get();
  if (!snapshot.exists) return null;

  const data = snapshot.data();
  if (data.status !== "active" || !isValidRole(data.role)) return null;

  return {
    uid,
    email: data.email ?? null,
    name: data.displayName ?? null,
    role: data.role,
  };
}

/** Current admin (ya null). Ek request ma sirf ek baar chalta hai (React cache). */
export const getCurrentAdmin = cache(async () => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionCookie) return null;

  try {
    // checkRevoked = true: logout/revoke ke baad purani cookie kaam nahi karti.
    const decoded = await getAdminAuth().verifySessionCookie(
      sessionCookie,
      true,
    );
    return await getAdminRecord(decoded.uid);
  } catch (error) {
    const isExpectedAuthFailure =
      error instanceof NotConfiguredError ||
      String(error?.code).startsWith("auth/");
    if (!isExpectedAuthFailure)
      console.error("[auth] session check failed:", error);
    return null; // Fail closed.
  }
});
