import { aiSettingsSchema } from "@/lib/validations/ai.schema";

/** @returns {object | null} null = saved version ab valid nahi (schema badal chuka). */
export function prepareRestore(stored, currentEnabled) {
  const parsed = aiSettingsSchema.safeParse(stored);
  if (!parsed.success) return null;
  return { ...parsed.data, enabled: currentEnabled };
}
