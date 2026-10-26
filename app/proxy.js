import { NextResponse } from "next/server";

import { SESSION_COOKIE, USER_SESSION_COOKIE } from "@/constants/auth";

export function proxy(request) {
  const { pathname, search } = request.nextUrl;

  const isAdmin = pathname.startsWith("/admin");
  const isAccount = pathname.startsWith("/account");

  if (isAdmin && pathname.startsWith("/login"))
    return NextResponse.next();

  const cookie = isAdmin
    ? SESSION_COOKIE
    : isAccount
      ? USER_SESSION_COOKIE
      : null;

  if (cookie && !request.cookies.has(cookie)) {
    const url = request.nextUrl.clone();
    url.pathname = isAdmin ? "/admin/login" : "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/account/:path*"] };
