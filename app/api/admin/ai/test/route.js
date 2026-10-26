import { NextResponse } from "next/server";

import { TEN_MINUTES } from "@/constants/ai";
import { generateText, isGeminiConfigured } from "@/lib/ai/gemini";
import { retrieveContext } from "@/lib/ai/knowledge";
import { buildSystemPrompt } from "@/lib/ai/prompts";
import { guardAdminRequest } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import {
  errorResponse,
  parseAndValidate,
} from "@/lib/security/request-validation";
import { handleRouteError } from "@/lib/security/route-errors";
import { aiTestSchema } from "@/lib/validations/ai.schema";
import { getAiSettingsFresh } from "@/services/ai-settings.service";

export const runtime = "nodejs";

export async function POST(request) {
  const guard = await guardAdminRequest(request, PERMISSIONS.AI_MANAGE);
  if (guard.response) return guard.response;

  if (!isGeminiConfigured()) {
    return errorResponse(
      "NOT_CONFIGURED",
      "Set GEMINI_API_KEY and GEMINI_MODEL first.",
      503,
    );
  }

  const limited = await rateLimit({
    name: "ai-test",
    id: guard.admin.uid,
    limit: 20,
    windowSeconds: TEN_MINUTES,
  });
  if (!limited.ok) return rateLimitResponse(limited);

  const parsed = await parseAndValidate(request, aiTestSchema);
  if (parsed.response) return parsed.response;

  try {
    const settings = await getAiSettingsFresh();
    const context = await retrieveContext(parsed.data.message);
    const reply = await generateText({
      system: buildSystemPrompt({ settings, contextText: context.text }),
      messages: [{ role: "user", content: parsed.data.message }],
      maxOutputTokens: 700,
    });

    return NextResponse.json({ reply, sources: context.titles });
  } catch (error) {
    return handleRouteError(error, "admin/ai:test");
  }
}
