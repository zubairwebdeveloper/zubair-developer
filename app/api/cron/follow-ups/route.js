import { createHash, timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { errorResponse } from "@/lib/security/request-validation";
import { retryFailedEmails } from "@/services/email.service";
import { processFollowUps } from "@/services/follow-ups.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const digest = (value) => createHash("sha256").update(value).digest();

function isAuthorized(request, secret) {
  const header = request.headers.get("authorization") ?? "";
  return timingSafeEqual(digest(header), digest(`Bearer ${secret}`));
}

export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret)
    return errorResponse("NOT_CONFIGURED", "CRON_SECRET is not set.", 503);
  if (!isAuthorized(request, secret))
    return errorResponse("UNAUTHENTICATED", "Unauthorized.", 401);

  const summary = {};

  try {
    summary.followUps = await processFollowUps();
  } catch (error) {
    console.error("[cron] follow-ups failed:", error);
    summary.followUps = { error: true };
  }

  try {
    summary.emailRetries = await retryFailedEmails();
  } catch (error) {
    console.error("[cron] email retries failed:", error);
    summary.emailRetries = { error: true };
  }

  const hasError = Object.values(summary).some((part) => part.error);
  return NextResponse.json(
    { ok: !hasError, ...summary },
    { status: hasError ? 500 : 200 },
  );
}
