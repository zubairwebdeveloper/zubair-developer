import { z } from "zod";

import {
  budgetOptions,
  contactMethodOptions,
  getValues,
  serviceCategoryOptions,
  timelineOptions,
} from "@/constants/options";
import { projectBriefSchema } from "@/lib/validations/inquiry.schema";

const MAX_USER_CHARS = 1000;

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  // Assistant ke jawab lambe ho sakte hain, user ka message 1000 chars tak.
  content: z.string().trim().min(1).max(3000),
});

export const chatRequestSchema = z.object({
  sessionId: z.string().regex(/^[A-Za-z0-9-]{8,64}$/),
  messages: z
    .array(chatMessageSchema)
    .min(1)
    .max(10)
    .refine((messages) => messages.at(-1).role === "user", {
      message: "The last message must come from the visitor.",
    })
    .refine((messages) => messages.at(-1).content.length <= MAX_USER_CHARS, {
      message: `Messages can be up to ${MAX_USER_CHARS} characters.`,
    }),
});

export const briefExtractSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(10),
});

/** Gemini ka JSON output untrusted hai: har field alag validate hota hai, ghalat value "" ban jati hai. */
const pick = (options) => z.enum(getValues(options)).catch("");
const short = (max) => z.string().trim().max(max).catch("");

export const briefDraftSchema = z.object({
  businessType: short(120),
  service: pick(serviceCategoryOptions),
  planSlug: short(60),
  description: short(3000),
  features: short(1500),
  budget: pick(budgetOptions),
  timeline: pick(timelineOptions),
  existingWebsite: z
    .string()
    .trim()
    .max(300)
    .refine((value) => value === "" || /^https?:\/\//i.test(value))
    .catch(""),
  contactMethod: pick(contactMethodOptions),
});

export const aiLeadSchema = projectBriefSchema.extend({
  shareChatSummary: z.boolean(),
  transcript: z.array(chatMessageSchema).max(10).optional(),
});

export const aiTestSchema = z.object({
  message: z.string().trim().min(1).max(MAX_USER_CHARS),
});

const text = (min, max) => z.string().trim().min(min).max(max);
const lines = (maxItems, maxLength) =>
  z.array(z.string().trim().min(1).max(maxLength)).max(maxItems);
const whole = (min, max) =>
  z.number({ message: "Enter a number." }).int().min(min).max(max);

export const aiSettingsSchema = z.object({
  enabled: z.boolean(),
  name: text(2, 40),
  welcomeMessage: text(10, 300),
  tone: text(3, 200),
  languages: lines(6, 40).min(1, "Add at least one language."),
  suggestedPrompts: lines(6, 80),
  qualificationQuestions: lines(10, 200),
  pricingGuidance: z.string().trim().max(1000),
  handoffMessage: text(10, 300),
  extraInstructions: z.string().trim().max(1500),
  perIpPer10Min: whole(1, 100),
  perSessionPerHour: whole(1, 200),
  dailyMessages: whole(10, 10000),
  storeConversations: z.boolean(),
  retentionDays: whole(1, 365),
});
export const aiRestoreSchema = z.object({
  version: z.number().int().min(1).max(100000),
});