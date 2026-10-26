import { USER_HINT_COOKIE } from "@/constants/auth";

const listeners = new Set();

export const subscribeHint = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

export const readHint = () =>
  typeof document !== "undefined" &&
  document.cookie
    .split("; ")
    .some((cookie) => cookie.startsWith(`${USER_HINT_COOKIE}=`));

/** Login ya logout ke baad header ko batata hai ke dobara parhe. */
export const notifyHint = () => listeners.forEach((listener) => listener());
