import { DISPLAY_TIME_ZONE } from "@/constants/display";

export function formatDate(iso) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeZone: DISPLAY_TIME_ZONE,
  }).format(new Date(iso));
}

export function formatDateTime(iso) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: DISPLAY_TIME_ZONE,
  }).format(new Date(iso));
}

/** ISO string ko `datetime-local` input ki value banata hai (browser ka local time). */
export function toLocalInput(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

/** `datetime-local` value ko ISO string banata hai (ya null). */
export function fromLocalInput(value) {
  return value ? new Date(value).toISOString() : null;
}
