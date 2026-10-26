import "server-only";

import { FieldValue, Timestamp } from "firebase-admin/firestore";

export const serverTimestamp = () => FieldValue.serverTimestamp();

/** Firestore Timestamp ko ISO string banata hai, taake Client Components ko plain data mile. */
export function serializeValue(value) {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(serializeValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, inner]) => [key, serializeValue(inner)]),
    );
  }
  return value;
}

export function serializeDoc(snapshot) {
  if (!snapshot.exists) return null;
  return { id: snapshot.id, ...serializeValue(snapshot.data()) };
}
