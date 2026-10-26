import { NextResponse } from "next/server";

import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/constants/auth";
import { COLLECTIONS } from "@/constants/collections";
import { getAdminRecord } from "@/lib/auth/session";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { serverTimestamp } from "@/lib/firebase/firestore";
import {
  errorResponse,
  isSameOrigin,
  parseAndValidate,
} from "@/lib/security/request-validation";
import { NotConfiguredError } from "@/lib/utils/errors";
import { sessionRequestSchema } from "@/lib/validations/auth.schema";

const RECENT_SIGN_IN_SECONDS = 5 * 60;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

export async function POST(request) {
  if (!isSameOrigin(request)) {
    return errorResponse("FORBIDDEN", "Invalid request origin.", 403);
  }

  const parsed = await parseAndValidate(request, sessionRequestSchema);
  if (parsed.response) return parsed.response;

  try {
    const auth = getAdminAuth();
    const decoded = await auth.verifyIdToken(parsed.data.idToken, true);

    // Sirf taaza login se session banta hai.
    if (Date.now() / 1000 - decoded.auth_time > RECENT_SIGN_IN_SECONDS) {
      return errorResponse("STALE_TOKEN", "Please sign in again.", 401);
    }

    const admin = await getAdminRecord(decoded.uid);
    if (!admin) {
      return errorResponse(
        "FORBIDDEN",
        "This account does not have admin access.",
        403,
      );
    }

    const sessionCookie = await auth.createSessionCookie(parsed.data.idToken, {
      expiresIn: SESSION_MAX_AGE_SECONDS * 1000,
    });

    await getAdminDb()
      .collection(COLLECTIONS.adminUsers)
      .doc(admin.uid)
      .update({ lastLoginAt: serverTimestamp() });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, sessionCookie, {
      ...cookieOptions,
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return response;
  } catch (error) {
    if (error instanceof NotConfiguredError) {
      return errorResponse(
        "NOT_CONFIGURED",
        "Authentication is not configured.",
        503,
      );
    }
    if (String(error?.code).startsWith("auth/")) {
      return errorResponse(
        "INVALID_TOKEN",
        "Could not verify your sign-in. Please try again.",
        401,
      );
    }
    console.error("[api/admin/session] POST failed:", error);
    return errorResponse(
      "SERVER_ERROR",
      "Could not sign you in. Please try again.",
      500,
    );
  }
}

export async function DELETE(request) {
  if (!isSameOrigin(request)) {
    return errorResponse("FORBIDDEN", "Invalid request origin.", 403);
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;

  if (sessionCookie) {
    try {
      const auth = getAdminAuth();
      const decoded = await auth.verifySessionCookie(sessionCookie);
      await auth.revokeRefreshTokens(decoded.sub);
    } catch (error) {
      const isExpected =
        error instanceof NotConfiguredError ||
        String(error?.code).startsWith("auth/");
      if (!isExpected)
        console.error("[api/admin/session] revoke failed:", error);
    }
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  return response;
}
