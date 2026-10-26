import { NotFoundError, TransitionError } from "@/lib/utils/errors";

/**
 * Har id par task chalata hai aur nateeja gin'ta hai. Ek id fail ho to baqi chalte rehte hain.
 * Sequential hai (max 50 ids), taake Firestore transactions par dabao na pade.
 */
export async function runBulk(ids, task) {
  const summary = { updated: 0, skipped: 0, missing: 0, failed: 0 };

  for (const id of new Set(ids)) {
    try {
      await task(id);
      summary.updated += 1;
    } catch (error) {
      if (error instanceof TransitionError) summary.skipped += 1;
      else if (error instanceof NotFoundError) summary.missing += 1;
      else {
        summary.failed += 1;
        console.error(`[bulk] ${id} failed:`, error);
      }
    }
  }

  return summary;
}
