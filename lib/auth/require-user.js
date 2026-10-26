import "server-only";

import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/user-session";
import { errorResponse, isSameOrigin } from "@/lib/security/request-validation";

export async function requirePageUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  return user;
}

/** Mutating user API routes ki pehli line: same-origin (CSRF) + session. */
export async function guardUserRequest(request) {
  if (!isSameOrigin(request)) {
    return {
      response: errorResponse("FORBIDDEN", "Invalid request origin.", 403),
    };
  }

  const user = await getCurrentUser();
  if (!user)
    return {
      response: errorResponse("UNAUTHENTICATED", "Please sign in.", 401),
    };

  return { user };
}
