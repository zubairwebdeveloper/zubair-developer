import { NextResponse } from "next/server";

import {
  USER_SESSION_REMEMBER_SECONDS,
  USER_SESSION_SHORT_SECONDS,
} from "@/constants/auth";
import { COLLECTIONS } from "@/constants/collections";
import { clearUserCookies, setUserCookies } from "@/lib/auth/user-cookies";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { serverTimestamp } from "@/lib/firebase/firestore";
import {
  getClientId,
  rateLimit,
  rateLimitResponse,
} from "@/lib/security/rate-limit";
import {
  errorResponse,
  isSameOrigin,
  parseAndValidate,
} from "@/lib/security/request-validation";
import { NotConfiguredError } from "@/lib/utils/errors";
import { userSessionSchema } from "@/lib/validations/user-auth.schema";

export const runtime = "nodejs";

const RECENT_SIGN_IN_SECONDS = 5 * 60;

export async function POST(request) {
  if (!isSameOrigin(request))
    return errorResponse("FORBIDDEN", "Invalid request origin.", 403);

  const limited = await rateLimit({
    name: "user-session",
    id: getClientId(request),
    limit: 20,
    windowSeconds: 600,
  });
  if (!limited.ok) return rateLimitResponse(limited);

  const parsed = await parseAndValidate(request, userSessionSchema);
  if (parsed.response) return parsed.response;
  const { idToken, remember = true, acceptedTerms = false } = parsed.data;

  try {
    const auth = getAdminAuth();
    const decoded = await auth.verifyIdToken(idToken, true);

    // Sirf taaza login se session banta hai.
    if (Date.now() / 1000 - decoded.auth_time > RECENT_SIGN_IN_SECONDS) {
      return errorResponse("STALE_TOKEN", "Please sign in again.", 401);
    }

    const seconds = remember
      ? USER_SESSION_REMEMBER_SECONDS
      : USER_SESSION_SHORT_SECONDS;
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: seconds * 1000,
    });

    // Hamare records ke liye (authorization yahan se kabhi nahi hoti).
    const ref = getAdminDb().collection(COLLECTIONS.users).doc(decoded.uid);
    const existing = await ref.get();
    await ref.set(
      {
        email: decoded.email ?? null,
        displayName: decoded.name ?? null,
        provider: decoded.firebase?.sign_in_provider ?? "password",
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...(existing.exists ? {} : { createdAt: serverTimestamp() }),
        ...(acceptedTerms && !existing.data()?.termsAcceptedAt
          ? { termsAcceptedAt: serverTimestamp() }
          : {}),
      },
      { merge: true },
    );

    const response = NextResponse.json({ ok: true });
    setUserCookies(response, sessionCookie, seconds);
    return response;
  } catch (error) {
    if (error instanceof NotConfiguredError) {
      return errorResponse(
        "NOT_CONFIGURED",
        "Sign-in is not configured yet.",
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
    console.error("[api/auth/session] failed:", error);
    return errorResponse(
      "SERVER_ERROR",
      "Could not sign you in. Please try again.",
      500,
    );
  }
}

/** Sirf is device se logout. Dusre devices ke liye /api/auth/revoke hai. */
export async function DELETE(request) {
  if (!isSameOrigin(request))
    return errorResponse("FORBIDDEN", "Invalid request origin.", 403);

  const response = NextResponse.json({ ok: true });
  clearUserCookies(response);
  return response;
}
