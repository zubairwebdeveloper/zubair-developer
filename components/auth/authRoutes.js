// Auth pages ki ordering: index barhna = "forward", kam hona = "back".
// Apne project ke real routes ke mutabiq yahan edit karein.
export const AUTH_ROUTES = [
  { href: "/login", label: "Sign in", title: "Sign in" },
  { href: "/register", label: "Create account", title: "Create account" },
  {
    href: "/forgot-password",
    label: "Reset password",
    title: "Reset password",
  },
];

// Jin routes ke tabs top par dikhane hain
export const AUTH_TAB_HREFS = ["/login", "/register"];

// true  => forward par naya page LEFT se RIGHT ki taraf aata hai
// false => forward par RIGHT se LEFT (standard "next" feel)
export const FORWARD_SLIDES_LEFT_TO_RIGHT = true;

export function getRouteIndex(pathname = "") {
  const index = AUTH_ROUTES.findIndex(
    ({ href }) => pathname === href || pathname.startsWith(`${href}/`),
  );
  return index === -1 ? 0 : index;
}

export function getRouteTitle(pathname = "") {
  return AUTH_ROUTES[getRouteIndex(pathname)].title;
}
