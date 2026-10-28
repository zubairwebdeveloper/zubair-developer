/**
 * Whether a nav href matches the current pathname (exact for "/", prefix otherwise).
 * @param {string | null | undefined} pathname
 * @param {string | null | undefined} href
 */
export function isActivePath(pathname, href) {
  if (!pathname || !href) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
