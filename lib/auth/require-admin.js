import "server-only";

import { notFound, redirect } from "next/navigation";

import { hasPermission } from "@/lib/auth/permissions";
import { getCurrentAdmin } from "@/lib/auth/session";
import { errorResponse } from "@/lib/security/request-validation";

/** Admin pages / layouts ke liye. */
export async function requirePageAdmin(permission) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  if (permission && !hasPermission(admin.role, permission)) notFound();
  return admin;
}

/**
 * Admin API routes aur mutations ke liye. Har privileged request ma ye zaroori hai,
 * kyunke Admin SDK Firestore rules bypass karta hai.
 * @returns {Promise<{ admin: object } | { response: Response }>}
 */
export async function requireApiAdmin(permission) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return {
      response: errorResponse("UNAUTHENTICATED", "Please sign in.", 401),
    };
  }
  if (permission && !hasPermission(admin.role, permission)) {
    return {
      response: errorResponse(
        "FORBIDDEN",
        "You do not have permission to do this.",
        403,
      ),
    };
  }
  return { admin };
}
