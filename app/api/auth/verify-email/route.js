import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site";
import { guardUserRequest } from "@/lib/auth/require-user";
import { isEmailConfigured } from "@/lib/email/provider";
import { verifyAddressEmail } from "@/lib/email/templates";
import { getAdminAuth } from "@/lib/firebase/admin";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { errorResponse } from "@/lib/security/request-validation";
import { handleRouteError } from "@/lib/security/route-errors";
import { deliverEmail } from "@/services/email.service";

export const runtime = "nodejs";

export async function POST(request) {
  const guard = await guardUserRequest(request);
  if (guard.response) return guard.response;
  const { user } = guard;

  if (user.emailVerified)
    return NextResponse.json({ ok: true, alreadyVerified: true });

  if (!isEmailConfigured()) {
    return errorResponse(
      "NOT_CONFIGURED",
      "Email delivery is not set up on this site. Please use the verification link sent when you registered.",
      503,
    );
  }

  const limited = await rateLimit({
    name: "verify-email",
    id: user.uid,
    limit: 3,
    windowSeconds: 3600,
  });
  if (!limited.ok) return rateLimitResponse(limited);

  try {
    const link = await getAdminAuth().generateEmailVerificationLink(
      user.email,
      {
        url: `${siteConfig.url}/account`,
      },
    );

    const result = await deliverEmail({
      // 10 minute ki window: tez click karne par ek hi email jaati hai.
      key: `verify_${user.uid}_${Math.floor(Date.now() / 600_000)}`,
      to: [user.email],
      ...verifyAddressEmail({ link }),
    });

    if (result.status === "failed" || result.status === "dead") {
      return errorResponse(
        "EMAIL_FAILED",
        "The email could not be sent. Please try again later.",
        502,
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error, "api/auth/verify-email");
  }
}
