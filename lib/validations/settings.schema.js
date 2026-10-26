import { z } from "zod";

const safeHref = z
  .string()
  .trim()
  .max(300)
  .refine(
    (value) =>
      value === "" ||
      (value.startsWith("/") && !value.startsWith("//")) ||
      /^https:\/\//i.test(value),
    { message: "Use a path like /pricing or an https:// URL." },
  );

export const announcementSchema = z
  .object({
    enabled: z.boolean(),
    message: z.string().trim().max(200),
    href: safeHref,
    linkLabel: z.string().trim().max(40),
    startsAt: z.string().datetime().nullable(),
    endsAt: z.string().datetime().nullable(),
  })
  .refine((data) => !data.enabled || data.message.length >= 3, {
    message: "Add a message before enabling the announcement.",
    path: ["message"],
  })
  .refine(
    (data) =>
      !data.startsAt ||
      !data.endsAt ||
      Date.parse(data.endsAt) > Date.parse(data.startsAt),
    { message: "End time must be after the start time.", path: ["endsAt"] },
  );

const httpsUrl = z
  .string()
  .trim()
  .max(200)
  .refine((value) => value === "" || /^https:\/\//i.test(value), {
    message: "Use an https:// URL.",
  });

export const profileSchema = z.object({
  headline: z.string().trim().max(120),
  bio: z.string().trim().max(2000),
  github: httpsUrl,
  linkedin: httpsUrl,
  instagram: httpsUrl,
  facebook: httpsUrl,
});

export const notificationPrefsSchema = z.object({
  emailEnabled: z.boolean(),
  onNewInquiry: z.boolean(),
  onFollowUpDue: z.boolean(),
  recipients: z
    .array(
      z
        .string()
        .trim()
        .toLowerCase()
        .email("Enter valid email addresses, one per line.")
        .max(120),
    )
    .max(5, "Up to 5 recipients."),
  autoReplyEnabled: z.boolean(),
  autoReplyMessage: z
    .string()
    .trim()
    .min(10, "Write at least 10 characters.")
    .max(500, "Keep it under 500 characters."),
});
