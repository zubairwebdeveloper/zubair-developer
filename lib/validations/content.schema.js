import { z } from "zod";

import { getValues, serviceCategoryOptions } from "@/constants/options";
import { isAllowedImageUrl } from "@/lib/validations/image-url";

export const CONTENT_STATUSES = ["draft", "published", "archived"];

const status = z.enum(CONTENT_STATUSES);
const text = (min, max) => z.string().trim().min(min).max(max);
const lines = (maxItems, maxLength) =>
  z.array(z.string().trim().min(1).max(maxLength)).max(maxItems);
const order = z.number({ message: "Enter a number." }).int().min(0).max(9999);
const price = z
  .number({ message: "Enter a number." })
  .min(0)
  .max(1_000_000)
  .nullable();
const currency = z.enum(["USD", "PKR", "EUR", "GBP"]);

// Optional image: undefined, null and "" are all accepted and become "".
// A non-empty value must still be an allowed image URL.
const imageUrl = z
  .string()
  .trim()
  .max(600)
  .refine((value) => !value || isAllowedImageUrl(value), {
    message: "Choose an image from the media library.",
  })
  .nullish()
  .transform((value) => value ?? "");

// Optional alt text: same behaviour as imageUrl.
const imageAlt = z
  .string()
  .trim()
  .max(160)
  .nullish()
  .transform((value) => value ?? "");

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine(
    (value) => {
      if (!value) return true;
      try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:";
      } catch {
        return false;
      }
    },
    { message: "Enter a valid http(s) URL." },
  );

export const projectSchema = z.object({
  title: text(2, 120),
  summary: text(10, 300),
  category: text(2, 60),
  coverImage: imageUrl,
  coverAlt: imageAlt,
  technologies: lines(20, 40),
  problem: z.string().trim().max(2000),
  solution: z.string().trim().max(2000),
  outcome: z.string().trim().max(2000),
  liveUrl: optionalUrl,
  repoUrl: optionalUrl,
  featured: z.boolean(),
  status,
  order,
});

export const serviceSchema = z.object({
  title: text(2, 120),
  summary: text(10, 300),
  category: z.enum(getValues(serviceCategoryOptions)),
  icon: z.enum(["web", "saas", "chat", "ai"]),
  problem: text(10, 500),
  description: text(20, 2000),
  deliverables: lines(12, 160),
  engagement: text(2, 80),
  startingPrice: price,
  currency,
  status,
  order,
});

export const planSchema = z.object({
  category: z.enum(["web", "automation"]),
  coverImage: imageUrl,
  coverAlt: imageAlt,
  name: text(2, 40),
  price,
  currency,
  isStartingPrice: z.boolean(),
  billing: z.enum(["one-time", "monthly"]),
  badge: z.string().trim().max(24),
  description: text(5, 200),
  features: lines(15, 120).min(1, "Add at least one feature."),
  excludes: lines(10, 120),
  ctaLabel: text(2, 40),
  status,
  order,
});

export const faqSchema = z.object({
  question: text(5, 200),
  answer: text(10, 2000),
  status,
  order,
});

export const blogSchema = z.object({
  title: text(3, 140),
  excerpt: text(10, 300),
  content: text(50, 20000),
  tags: lines(8, 30),
  coverImage: imageUrl,
  coverAlt: imageAlt,
  status,
});

export const testimonialSchema = z.object({
  authorName: text(2, 80),
  authorRole: z.string().trim().max(80),
  company: z.string().trim().max(80),
  quote: text(20, 600),
  status,
  order,
});

export const skillSchema = z.object({
  name: text(1, 50),
  category: text(2, 40),
  status,
  order,
});

export const experienceSchema = z.object({
  role: text(2, 100),
  company: text(2, 100),
  period: text(2, 60),
  description: z.string().trim().max(1000),
  status,
  order,
});

export const aiKnowledgeSchema = z.object({
  title: text(3, 120),
  content: text(20, 2000),
  status,
  order,
});
