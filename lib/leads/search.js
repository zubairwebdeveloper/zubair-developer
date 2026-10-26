const REFERENCE = /^zd-[0-9a-f]{8}$/i;
const MIN_LENGTH = 3;

/**
 * Search term ko Firestore query ke liye tayyar karta hai.
 * Reference exact match hota hai, baqi sab email ke prefix par.
 * @returns {{ field: string, op: "eq" | "prefix", value: string } | null}
 */
export function parseLeadSearch(input) {
  const term = String(input ?? "")
    .trim()
    .toLowerCase()
    .slice(0, 100);
  if (term.length < MIN_LENGTH) return null;

  if (REFERENCE.test(term))
    return { field: "reference", op: "eq", value: term.toUpperCase() };
  return { field: "emailLower", op: "prefix", value: term };
}
