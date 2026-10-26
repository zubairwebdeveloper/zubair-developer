import { z } from "zod";

import {
  budgetOptions,
  contactMethodOptions,
  getValues,
  serviceCategoryOptions,
  timelineOptions,
} from "@/constants/options";

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((value) => value === "" || /^https?:\/\//i.test(value), {
    message: "Please enter a valid URL starting with http:// or https://",
  });

export const projectBriefSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(80),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(120),
  businessType: z
    .string()
    .trim()
    .min(2, "Tell us what kind of business this is.")
    .max(120),
  service: z.enum(getValues(serviceCategoryOptions), {
    message: "Please choose a service.",
  }),
  planSlug: z.string().trim().max(60).optional().or(z.literal("")),
  description: z
    .string()
    .trim()
    .min(30, "Please describe your project (at least 30 characters).")
    .max(3000),
  features: z.string().trim().max(1500).optional().or(z.literal("")),
  budget: z.enum(getValues(budgetOptions), {
    message: "Please choose a budget range.",
  }),
  timeline: z.enum(getValues(timelineOptions), {
    message: "Please choose a timeline.",
  }),
  existingWebsite: optionalUrl,
  contactMethod: z.enum(getValues(contactMethodOptions), {
    message: "Please choose a contact method.",
  }),
  referenceLinks: z.string().trim().max(1000).optional().or(z.literal("")),
  consent: z.boolean().refine((value) => value === true, {
    message: "Please agree to share your details so we can respond.",
  }),
  companyUrl: z.string().max(200).optional(),
  submissionId: z
    .string()
    .regex(/^[A-Za-z0-9-]{16,64}$/)
    .optional(),
});
