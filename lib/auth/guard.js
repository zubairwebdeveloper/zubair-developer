import "server-only";

import { requireApiAdmin } from "@/lib/auth/require-admin";
import { errorResponse, isSameOrigin } from "@/lib/security/request-validation";

/**
 * Har admin API route ki pehli line. Mutating requests ke liye same-origin (CSRF),
 * phir session aur permission check.
 * @returns {Promise<{ admin: object } | { response: Response }>}
 */
export async function guardAdminRequest(request, permission) {
  const isReadOnly = request.method === "GET" || request.method === "HEAD";

  if (!isReadOnly && !isSameOrigin(request)) {
    return {
      response: errorResponse("FORBIDDEN", "Invalid request origin.", 403),
    };
  }

  return requireApiAdmin(permission);
}
