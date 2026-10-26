import { USER_HINT_COOKIE, USER_SESSION_COOKIE } from "@/constants/auth";

const base = {
  sameSite: "lax",
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

export function setUserCookies(response, sessionCookie, maxAge) {
  response.cookies.set(USER_SESSION_COOKIE, sessionCookie, {
    ...base,
    httpOnly: true,
    maxAge,
  });
  // Hint ma koi data nahi, sirf "1". Isay JS parh sakta hai, is liye isse authorization nahi hoti.
  response.cookies.set(USER_HINT_COOKIE, "1", {
    ...base,
    httpOnly: false,
    maxAge,
  });
}

export function clearUserCookies(response) {
  response.cookies.set(USER_SESSION_COOKIE, "", {
    ...base,
    httpOnly: true,
    maxAge: 0,
  });
  response.cookies.set(USER_HINT_COOKIE, "", {
    ...base,
    httpOnly: false,
    maxAge: 0,
  });
}
