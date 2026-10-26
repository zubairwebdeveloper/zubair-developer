import "server-only";

import { generateText, isGeminiConfigured } from "@/lib/ai/gemini";
import { SUMMARY_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import {
  budgetOptions,
  labelFor,
  serviceCategoryOptions,
  timelineOptions,
} from "@/constants/options";

function fallbackSummary(brief) {
  return `${brief.businessType} business needs: ${labelFor(serviceCategoryOptions, brief.service)}. Budget: ${labelFor(
    budgetOptions,
    brief.budget,
  )}. Timeline: ${labelFor(timelineOptions, brief.timeline)}. ${brief.description}`.slice(
    0,
    600,
  );
}

/** Gemini fail ho to deterministic summary. Name/email model ko nahi bheje jate. */
export async function buildLeadSummary(brief, transcript = []) {
  if (!isGeminiConfigured()) return fallbackSummary(brief);

  const details = [
    `Business type: ${brief.businessType}`,
    `Service: ${labelFor(serviceCategoryOptions, brief.service)}`,
    `Budget: ${labelFor(budgetOptions, brief.budget)}`,
    `Timeline: ${labelFor(timelineOptions, brief.timeline)}`,
    `Description: ${brief.description}`,
    brief.features ? `Features: ${brief.features}` : "",
    transcript.length
      ? `Chat excerpt:\n${transcript.map((message) => `${message.role}: ${message.content}`).join("\n")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const text = await generateText({
      system: SUMMARY_SYSTEM_PROMPT,
      messages: [{ role: "user", content: `<<<\n${details}\n>>>` }],
      maxOutputTokens: 200,
      timeoutMs: 8000,
    });
    return text.slice(0, 600);
  } catch (error) {
    console.error("[ai] summary failed, using fallback:", error?.kind ?? error);
    return fallbackSummary(brief);
  }
}
