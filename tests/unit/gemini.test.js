import { beforeEach, describe, expect, it, vi } from "vitest";

const { generate, stream } = vi.hoisted(() => ({
  generate: vi.fn(),
  stream: vi.fn(),
}));

vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = { generateContent: generate, generateContentStream: stream };
  },
}));

import { generateText, streamText } from "@/lib/ai/gemini";
import { AiProviderError, NotConfiguredError } from "@/lib/utils/errors";

async function* chunks(...texts) {
  for (const text of texts) yield { text };
}

async function readAll(readable) {
  const reader = readable.getReader();
  const decoder = new TextDecoder();
  let output = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    output += decoder.decode(value);
  }
  return output;
}

const messages = [{ role: "user", content: "Hi" }];

beforeEach(() => {
  delete globalThis.__zdGenAI;
  vi.stubEnv("GEMINI_API_KEY", "test-key");
  vi.stubEnv("GEMINI_MODEL", "test-model");
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("generateText", () => {
  it("throws NotConfiguredError without credentials", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    await expect(
      generateText({ system: "s", messages }),
    ).rejects.toBeInstanceOf(NotConfiguredError);
  });

  it("returns trimmed text and sends system prompt and model", async () => {
    generate.mockResolvedValue({ text: "  Hello  " });
    await expect(generateText({ system: "SYS", messages })).resolves.toBe(
      "Hello",
    );

    const call = generate.mock.calls[0][0];
    expect(call.model).toBe("test-model");
    expect(call.config.systemInstruction).toBe("SYS");
    expect(call.contents[0]).toEqual({ role: "user", parts: [{ text: "Hi" }] });
  });

  it("requests JSON output when asked", async () => {
    generate.mockResolvedValue({ text: "{}" });
    await generateText({ system: "s", messages, json: true });
    expect(generate.mock.calls[0][0].config.responseMimeType).toBe(
      "application/json",
    );
  });

  it("retries once on transient server errors", async () => {
    generate
      .mockRejectedValueOnce({ status: 503 })
      .mockResolvedValueOnce({ text: "ok" });
    await expect(generateText({ system: "s", messages })).resolves.toBe("ok");
    expect(generate).toHaveBeenCalledTimes(2);
  });

  it("does not retry quota or auth errors", async () => {
    generate.mockRejectedValue({ status: 429 });
    await expect(generateText({ system: "s", messages })).rejects.toMatchObject(
      { kind: "quota" },
    );
    expect(generate).toHaveBeenCalledTimes(1);

    generate.mockClear();
    generate.mockRejectedValue({ status: 401 });
    await expect(generateText({ system: "s", messages })).rejects.toMatchObject(
      { kind: "auth" },
    );
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it("treats an empty response as an error", async () => {
    generate.mockResolvedValue({ text: "   " });
    await expect(generateText({ system: "s", messages })).rejects.toMatchObject(
      { kind: "empty" },
    );
  });
});

describe("streamText", () => {
  it("streams chunks and reports the full reply", async () => {
    stream.mockResolvedValue(chunks("Hel", "lo"));
    const onFinish = vi.fn();

    const readable = await streamText({ system: "s", messages, onFinish });
    expect(await readAll(readable)).toBe("Hello");
    expect(onFinish).toHaveBeenCalledWith("Hello");
  });

  it("fails before streaming starts when the provider rejects", async () => {
    stream.mockRejectedValue({ status: 429 });
    await expect(streamText({ system: "s", messages })).rejects.toMatchObject({
      kind: "quota",
    });
  });

  it("errors the stream and calls onError when it breaks midway", async () => {
    stream.mockResolvedValue(
      (async function* () {
        yield { text: "Hi" };
        throw { status: 500 };
      })(),
    );
    const onError = vi.fn();

    const readable = await streamText({ system: "s", messages, onError });
    await expect(readAll(readable)).rejects.toBeInstanceOf(AiProviderError);
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "provider" }),
    );
  });
});
