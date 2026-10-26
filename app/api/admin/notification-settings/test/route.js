import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { TEN_MINUTES } from "@/constants/ai";
import { isEmailConfigured } from "@/lib/email/provider";
import { testEmail } from "@/lib/email/templates";
import { guardAdminRequest } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { errorResponse } from "@/lib/security/request-validation";
import { handleRouteError } from "@/lib/security/route-errors";
import { deliverEmail } from "@/services/email.service";
import {
  getNotificationPrefs,
  resolveRecipients,
} from "@/services/notification-settings.service";

export const runtime = "nodejs";

export async function POST(request) {
  const guard = await guardAdminRequest(request, PERMISSIONS.SETTINGS_MANAGE);
  if (guard.response) return guard.response;

  if (!isEmailConfigured()) {
    return errorResponse(
      "NOT_CONFIGURED",
      "Set EMAIL_PROVIDER_API_KEY and EMAIL_FROM first.",
      503,
    );
  }

  const limited = await rateLimit({
    name: "email-test",
    id: guard.admin.uid,
    limit: 5,
    windowSeconds: TEN_MINUTES,
  });
  if (!limited.ok) return rateLimitResponse(limited);

  try {
    const recipients = resolveRecipients(await getNotificationPrefs());
    if (recipients.length === 0) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Add at least one recipient and save first.",
        422,
      );
    }

    const result = await deliverEmail({
      key: `test_${randomUUID()}`,
      to: recipients,
      ...testEmail(),
    });

    if (result.status !== "sent") {
      return errorResponse(
        "EMAIL_FAILED",
        `The email provider did not accept the message (${result.kind ?? result.status}). Check your API key and verified sender domain.`,
        502,
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error, "admin/notification-settings:test");
  }
}
