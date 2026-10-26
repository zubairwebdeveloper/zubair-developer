import { z } from "zod";

import { ROLES } from "@/lib/auth/permissions";
import { CONTENT_STATUSES } from "@/lib/validations/content.schema";

const docId = z.string().regex(/^[A-Za-z0-9_-]{1,100}$/);

export const bulkStatusSchema = z.object({
  ids: z.array(docId).min(1).max(50),
  status: z.enum(CONTENT_STATUSES),
});

export const mediaAltSchema = z.object({
  alt: z.string().trim().max(160),
});

export const teamInviteSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address.")
    .max(120),
  name: z.string().trim().max(80),
  role: z.enum(Object.values(ROLES)),
});

export const teamUpdateSchema = z.object({
  role: z.enum(Object.values(ROLES)).optional(),
  status: z.enum(["active", "disabled"]).optional(),
});
