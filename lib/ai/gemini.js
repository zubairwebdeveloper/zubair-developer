import "server-only";

import { GoogleGenAI } from "@google/genai";

import { AiProviderError, NotConfiguredError } from "@/lib/utils/errors";

export const isGeminiConfigured = () =>
  Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_MODEL);

function getClient() {
  if (!isGeminiConfigured())
    throw new NotConfiguredError("Gemini is not configured.");
  globalThis.__zdGenAI ??= new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  return globalThis.__zdGenAI;
}

function toProviderError(error) {
  if (error instanceof NotConfiguredError || error instanceof AiProviderError)
    return error;

  const status = Number(error?.status ?? error?.code);
  if (error?.name === "AbortError" || error?.name === "TimeoutError")
    return new AiProviderError("timeout");
  if (status === 429) return new AiProviderError("quota");
  if (status === 401 || status === 403) return new AiProviderError("auth");
  if (status >= 500) return new AiProviderError("provider");
  return new AiProviderError("unknown");
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Sirf transient errors (timeout, 5xx) par ek dafa dobara try. Quota/auth par retry nahi. */
async function withRetry(task) {
  try {
    return await task();
  } catch (firstError) {
    const error = toProviderError(firstError);
    if (!error.retryable) throw error;

    await sleep(400);
    try {
      return await task();
    } catch (secondError) {
      throw toProviderError(secondError);
    }
  }
}

const toContents = (messages) =>
  messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));

function buildConfig({
  system,
  temperature,
  maxOutputTokens,
  json,
  timeoutMs,
}) {
  return {
    systemInstruction: system,
    temperature,
    maxOutputTokens,
    abortSignal: AbortSignal.timeout(timeoutMs),
    ...(json ? { responseMimeType: "application/json" } : {}),
  };
}

export async function generateText({
  system,
  messages,
  temperature = 0.4,
  maxOutputTokens = 600,
  json = false,
  timeoutMs = 20_000,
}) {
  const client = getClient();

  const response = await withRetry(() =>
    client.models.generateContent({
      model: process.env.GEMINI_MODEL,
      contents: toContents(messages),
      config: buildConfig({
        system,
        temperature,
        maxOutputTokens,
        json,
        timeoutMs,
      }),
    }),
  );

  const text = response.text?.trim();
  if (!text)
    throw new AiProviderError("empty", "The AI returned an empty response.");
  return text;
}

/**
 * Streaming jawab. Pehla chunk response bhejne se PEHLE manga jata hai, taake shuru ke errors
 * (galat key, quota) proper JSON error ban sakein, aadha-adhura stream nahi.
 * @returns {Promise<ReadableStream<Uint8Array>>}
 */
export async function streamText({
  system,
  messages,
  temperature = 0.4,
  maxOutputTokens = 700,
  timeoutMs = 30_000,
  onFinish,
  onError,
}) {
  const client = getClient();

  const { iterator, first } = await withRetry(async () => {
    const stream = await client.models.generateContentStream({
      model: process.env.GEMINI_MODEL,
      contents: toContents(messages),
      config: buildConfig({
        system,
        temperature,
        maxOutputTokens,
        json: false,
        timeoutMs,
      }),
    });
    const iterator = stream[Symbol.asyncIterator]();
    return { iterator, first: await iterator.next() };
  });

  const encoder = new TextEncoder();
  let full = "";

  return new ReadableStream({
    async start(controller) {
      try {
        let step = first;
        while (!step.done) {
          const text = step.value?.text;
          if (text) {
            full += text;
            controller.enqueue(encoder.encode(text));
          }
          step = await iterator.next();
        }

        if (!full.trim())
          throw new AiProviderError(
            "empty",
            "The AI returned an empty response.",
          );
      } catch (error) {
        const providerError = toProviderError(error);
        await Promise.resolve(onError?.(providerError)).catch(() => {});
        controller.error(providerError);
        return;
      }

      // Bookkeeping fail ho to jawab already user tak pahunch chuka hai, isliye sirf log.
      try {
        await onFinish?.(full);
      } catch (error) {
        console.error("[ai] onFinish failed:", error);
      }
      controller.close();
    },
  });
}
