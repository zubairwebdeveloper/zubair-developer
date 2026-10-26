const BLOCKED = ["/login", "/register", "/forgot-password", "/auth"];

export function safeRedirect(value, fallback = "/account") {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\"))
    return fallback;
  if (
    BLOCKED.some(
      (path) =>
        value === path ||
        value.startsWith(`${path}/`) ||
        value.startsWith(`${path}?`),
    )
  ) {
    return fallback;
  }
  return value;
}
