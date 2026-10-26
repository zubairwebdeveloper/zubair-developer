export const SESSION_COOKIE = "zd_session"; // admin
export const SESSION_MAX_AGE_SECONDS = 5 * 24 * 60 * 60;

export const USER_SESSION_COOKIE = "zd_user_session"; // public users
export const USER_HINT_COOKIE = "zd_signed_in"; // sirf UI hint, authorization nahi
export const USER_SESSION_REMEMBER_SECONDS = 14 * 24 * 60 * 60; // Firebase ki max hadd
export const USER_SESSION_SHORT_SECONDS = 24 * 60 * 60;
