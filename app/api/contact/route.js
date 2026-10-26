import { NextResponse } from "next/server";

import {
  parseAndValidate,
  errorResponse,
} from "@/lib/security/request-validation";
import { NotConfiguredError } from "@/lib/utils/errors";
import { contactSchema } from "@/lib/validations/contact.schema";
import { createInquiry } from "@/services/inquiries.service";
import {
  getClientId,
  rateLimit,
  rateLimitResponse,
} from "@/lib/security/rate-limit";
import { isSameOrigin } from "@/lib/security/request-validation";
import { after } from "next/server";

import { notifyNewInquiry } from "@/lib/notifications/email-notifier";
export async function POST(request) {
  if (!isSameOrigin(request))
    return errorResponse("FORBIDDEN", "Invalid request origin.", 403);

  const limited = await rateLimit({
    name: "form",
    id: getClientId(request),
    limit: 5,
    windowSeconds: 3600,
  });
  if (!limited.ok) return rateLimitResponse(limited);
  const parsed = await parseAndValidate(request, contactSchema);
  if (parsed.response) return parsed.response;

  const { companyUrl, ...data } = parsed.data;

  // Honeypot bhara hua = bot. Kuch save nahi karte, generic response dete hain.
  if (companyUrl) return NextResponse.json({ ok: true });

  try {
    const inquiry = await createInquiry({
      type: "contact",
      source: "website_contact",
      ...data,
    });

    after(() =>
      notifyNewInquiry({
        id: inquiry.id,
        reference: inquiry.reference,
        type: "contact",
        name: data.name,
        email: data.email,
        service: data.service,
      }),
    );

    return NextResponse.json(
      { ok: true, id: inquiry.id, reference: inquiry.reference },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof NotConfiguredError) {
      return errorResponse(
        "NOT_CONFIGURED",
        "Our enquiry system is not connected yet. Please contact us by email instead.",
        503,
      );
    }
    console.error("[api/contact] failed:", error);
    return errorResponse(
      "SERVER_ERROR",
      "We could not send your message. Please try again.",
      500,
    );
  }
}
