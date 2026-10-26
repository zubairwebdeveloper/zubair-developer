import { z } from "zod";

import { LEAD_PRIORITIES, LEAD_STATUS } from "@/constants/lead-status";

export const leadUpdateSchema = z.object({
  status: z.enum(Object.values(LEAD_STATUS)).optional(),
  priority: z.enum(LEAD_PRIORITIES).optional(),
  followUpAt: z.string().datetime().nullable().optional(),
});

export const leadNoteSchema = z.object({
  text: z.string().trim().min(1, "Write a note first.").max(2000),
});

export const messageStatusSchema = z.object({
  status: z.enum(["new", "handled", "archived"]),
});

export const notificationsUpdateSchema = z.union([
  z.object({ all: z.literal(true) }),
  z.object({ ids: z.array(z.string().min(1).max(120)).min(1).max(50) }),
]);
