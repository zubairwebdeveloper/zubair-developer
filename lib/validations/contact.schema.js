import { z } from "zod";

import { getValues, serviceCategoryOptions } from "@/constants/options";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(80),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(120),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  subject: z.string().trim().min(3, "Please add a short subject.").max(120),
  service: z.enum(getValues(serviceCategoryOptions), {
    message: "Please choose a category.",
  }),
  message: z
    .string()
    .trim()
    .min(20, "Please write at least 20 characters.")
    .max(2000, "Message is too long (max 2000 characters)."),
  consent: z.boolean().refine((value) => value === true, {
    message: "Please agree so we can contact you about this enquiry.",
  }),
  // Honeypot: insaan ko nazar nahi aata, bots bhar dete hain.
  companyUrl: z.string().max(200).optional(),
  submissionId: z
    .string()
    .regex(/^[A-Za-z0-9-]{16,64}$/)
    .optional(),
});
