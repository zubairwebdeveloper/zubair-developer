import { NextResponse } from "next/server";

import { HOURLY, TEN_MINUTES } from "@/constants/ai";
import { isGeminiConfigured, streamText } from "@/lib/ai/gemini";
import { retrieveContext } from "@/lib/ai/knowledge";
import { buildSystemPrompt } from "@/lib/ai/prompts";
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
import { chatRequestSchema } from "@/lib/validations/ai.schema";
import { saveExchange } from "@/services/ai-conversations.service";
import { getAiSettings } from "@/services/ai-settings.service";
import { getTodayMessageCount, recordUsage } from "@/services/ai-usage.service";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request) {
  if (!isSameOrigin(request))
    return errorResponse("FORBIDDEN", "Invalid request origin.", 403);

  const settings = await getAiSettings();
  if (!settings.enabled || !isGeminiConfigured()) {
    return errorResponse(
      "AI_DISABLED",
      "The assistant is offline right now. Please use the contact form.",
      503,
    );
  }

  // Sasti checks pehle: IP limit body parse karne se pehle.
  const ipLimit = await rateLimit({
    name: "ai-ip",
    id: getClientId(request),
    limit: settings.perIpPer10Min,
    windowSeconds: TEN_MINUTES,
    strict: true,
  });
  if (!ipLimit.ok) {
    if (!ipLimit.unavailable) await recordUsage({ rateLimited: 1 });
    return rateLimitResponse(ipLimit);
  }

  const parsed = await parseAndValidate(request, chatRequestSchema, {
    maxBytes: 40_000,
  });
  if (parsed.response) return parsed.response;
  const { messages, sessionId } = parsed.data;

  const sessionLimit = await rateLimit({
    name: "ai-session",
    id: sessionId,
    limit: settings.perSessionPerHour,
    windowSeconds: HOURLY,
    strict: true,
  });
  if (!sessionLimit.ok) {
    if (!sessionLimit.unavailable) await recordUsage({ rateLimited: 1 });
    return rateLimitResponse(sessionLimit);
  }

  if ((await getTodayMessageCount()) >= settings.dailyMessages) {
    return errorResponse(
      "DAILY_LIMIT",
      "The assistant has reached its daily limit. Please use the contact form.",
      503,
    );
  }

  // History client se aati hai (untrusted): shuru ke assistant messages hata dete hain.
  const history = messages.slice(-10);
  while (history[0]?.role === "assistant") history.shift();
  const question = history.at(-1).content;

  try {
    const context = await retrieveContext(question);
    const stream = await streamText({
      system: buildSystemPrompt({ settings, contextText: context.text }),
      messages: history,
      onFinish: async (reply) => {
        await recordUsage({ messages: 1 });
        if (settings.storeConversations) {
          await saveExchange({
            sessionId,
            userText: question,
            assistantText: reply,
            retentionDays: settings.retentionDays,
          });
        }
      },
      onError: (error) => recordUsage({}, error.kind),
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    await recordUsage({}, error?.kind ?? "setup");
    return handleRouteError(error, "api/ai/chat");
  }
}
