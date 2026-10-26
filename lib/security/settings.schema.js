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
