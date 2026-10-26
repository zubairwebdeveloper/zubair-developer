import { NextResponse } from "next/server";

import { HOURLY } from "@/constants/ai";
import { estimateProject } from "@/lib/ai/pricing-estimator";
import { buildLeadSummary } from "@/lib/ai/summary";
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
import { handleRouteError } from "@/lib/security/route-errors";
import { aiLeadSchema } from "@/lib/validations/ai.schema";
import { recordUsage } from "@/services/ai-usage.service";
import { createInquiry } from "@/services/inquiries.service";
import { getPlans } from "@/services/pricing.service";
import { after } from "next/server";

import { notifyNewInquiry } from "@/lib/notifications/email-notifier";
export const runtime = "nodejs";

export async function POST(request) {
  if (!isSameOrigin(request))
    return errorResponse("FORBIDDEN", "Invalid request origin.", 403);

  const limited = await rateLimit({
    name: "ai-lead",
    id: getClientId(request),
    limit: 3,
    windowSeconds: HOURLY,
    strict: true,
  });
  if (!limited.ok) return rateLimitResponse(limited);

  const parsed = await parseAndValidate(request, aiLeadSchema, {
    maxBytes: 40_000,
  });
  if (parsed.response) return parsed.response;

  const { companyUrl, shareChatSummary, transcript, ...brief } = parsed.data;
  if (companyUrl) return NextResponse.json({ ok: true }); // honeypot

  try {
    const plans = await getPlans();
    if (!plans.some((plan) => plan.slug === brief.planSlug))
      brief.planSlug = "";

    const sharedTranscript = shareChatSummary ? (transcript ?? []) : [];
    const aiEstimate = estimateProject({
      service: brief.service,
      planSlug: brief.planSlug,
      plans,
    });
    const aiSummary = await buildLeadSummary(brief, sharedTranscript);

    const inquiry = await createInquiry({
      type: "project_brief",
      source: "website_ai",
      ...brief,
      aiSummary,
      aiEstimate,
      summaryIncludesChat: sharedTranscript.length > 0,
    });
    after(() =>
      notifyNewInquiry({
        id: inquiry.id,
        reference: inquiry.reference,
        type: "project_brief",
        name: brief.name,
        email: brief.email,
        service: brief.service,
      }),
    );
    await recordUsage({ leads: 1 });

    return NextResponse.json(
      { ok: true, id: inquiry.id, reference: inquiry.reference },
      { status: 201 },
    );
  } catch (error) {
    return handleRouteError(error, "api/ai/lead");
  }
}
