import { NextResponse } from "next/server";

import { HOURLY } from "@/constants/ai";
import { generateText, isGeminiConfigured } from "@/lib/ai/gemini";
import { estimateProject } from "@/lib/ai/pricing-estimator";
import { buildExtractionPrompt } from "@/lib/ai/prompts";
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
import {
  briefDraftSchema,
  briefExtractSchema,
} from "@/lib/validations/ai.schema";
import { getAiSettings } from "@/services/ai-settings.service";
import { recordUsage } from "@/services/ai-usage.service";
import { getPlans } from "@/services/pricing.service";

export const runtime = "nodejs";

function parseJson(text) {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return {};
  }
}

export async function POST(request) {
  if (!isSameOrigin(request))
    return errorResponse("FORBIDDEN", "Invalid request origin.", 403);

  const settings = await getAiSettings();
  if (!settings.enabled || !isGeminiConfigured()) {
    return errorResponse(
      "AI_DISABLED",
      "The assistant is offline right now.",
      503,
    );
  }

  const limited = await rateLimit({
    name: "ai-brief",
    id: getClientId(request),
    limit: 6,
    windowSeconds: HOURLY,
    strict: true,
  });
  if (!limited.ok) return rateLimitResponse(limited);

  const parsed = await parseAndValidate(request, briefExtractSchema, {
    maxBytes: 40_000,
  });
  if (parsed.response) return parsed.response;

  try {
    const plans = await getPlans();
    const planSlugs = plans.map((plan) => plan.slug);

    const transcript = parsed.data.messages
      .map((message) => `${message.role}: ${message.content}`)
      .join("\n");
    const raw = await generateText({
      system: buildExtractionPrompt(planSlugs),
      messages: [{ role: "user", content: `<<<\n${transcript}\n>>>` }],
      temperature: 0,
      maxOutputTokens: 700,
      json: true,
      timeoutMs: 15_000,
    });

    const draft = briefDraftSchema.parse(parseJson(raw));
    if (!planSlugs.includes(draft.planSlug)) draft.planSlug = "";

    return NextResponse.json({
      draft,
      estimate: estimateProject({
        service: draft.service,
        planSlug: draft.planSlug,
        plans,
      }),
    });
  } catch (error) {
    await recordUsage({}, error?.kind ?? "extract");
    return handleRouteError(error, "api/ai/brief");
  }
}
