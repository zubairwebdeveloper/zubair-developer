import { NextResponse } from "next/server";

import { clearUserCookies } from "@/lib/auth/user-cookies";
import { guardUserRequest } from "@/lib/auth/require-user";
import { getAdminAuth } from "@/lib/firebase/admin";
import { handleRouteError } from "@/lib/security/route-errors";

export async function POST(request) {
  const guard = await guardUserRequest(request);
  if (guard.response) return guard.response;

  try {
    await getAdminAuth().revokeRefreshTokens(guard.user.uid);
    const response = NextResponse.json({ ok: true });
    clearUserCookies(response);
    return response;
  } catch (error) {
    return handleRouteError(error, "api/auth/revoke");
  }
}
