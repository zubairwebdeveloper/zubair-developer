import {
  GoogleAuthProvider,
  applyActionCode,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  inMemoryPersistence,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile,
  verifyPasswordResetCode,
} from "firebase/auth";

import { getClientAuth } from "@/lib/firebase/client";

async function prepare() {
  const auth = getClientAuth();
  await setPersistence(auth, inMemoryPersistence);
  return auth;
}

export async function emailSignInToken(email, password) {
  const auth = await prepare();
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await user.getIdToken();
  await signOut(auth);
  return idToken;
}

export async function googleSignInToken() {
  const auth = await prepare();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const { user } = await signInWithPopup(auth, provider);
  const idToken = await user.getIdToken();
  await signOut(auth);
  return idToken;
}

export async function registerForSession({ name, email, password }) {
  const auth = await prepare();
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName: name });

  let verificationSent = false;
  try {
    await sendEmailVerification(user);
    verificationSent = true;
  } catch {
    // Verification email fail ho to account phir bhi ban chuka hai. Account page se dobara bhej sakte hain.
  }

  // true = taaza token, taake displayName us ma aaye.
  const idToken = await user.getIdToken(true);
  await signOut(auth);
  return { idToken, verificationSent };
}

export const sendResetLink = async (email) =>
  sendPasswordResetEmail(getClientAuth(), email);

/** Password badalne par Firebase purane tokens revoke karta hai, is liye naya token wapas dete hain. */
export async function changePasswordForSession(
  email,
  currentPassword,
  newPassword,
) {
  const auth = await prepare();
  const { user } = await signInWithEmailAndPassword(
    auth,
    email,
    currentPassword,
  );
  await updatePassword(user, newPassword);
  const idToken = await user.getIdToken(true);
  await signOut(auth);
  return idToken;
}

export const checkResetCode = (code) =>
  verifyPasswordResetCode(getClientAuth(), code);
export const finishPasswordReset = (code, password) =>
  confirmPasswordReset(getClientAuth(), code, password);
export const confirmEmailCode = (code) =>
  applyActionCode(getClientAuth(), code);

const messages = {
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/user-not-found": "Incorrect email or password.",
  "auth/email-already-in-use":
    "An account with this email already exists. Try signing in instead.",
  "auth/weak-password": "Please choose a stronger password.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/too-many-requests":
    "Too many attempts. Please wait a few minutes and try again.",
  "auth/network-request-failed": "Network error. Please check your connection.",
  "auth/popup-blocked":
    "Your browser blocked the sign-in popup. Allow popups and try again.",
  "auth/account-exists-with-different-credential":
    "This email is registered with another sign-in method. Use your email and password instead.",
  "auth/expired-action-code":
    "This link has expired. Please request a new one.",
  "auth/invalid-action-code": "This link is invalid or has already been used.",
  "auth/operation-not-allowed": "This sign-in method is not enabled yet.",
  "auth/unauthorized-domain":
    "This domain is not authorized for sign-in. Add it in Firebase Authentication settings.",
  "auth/invalid-api-key": "Firebase is not configured correctly.",
};

/** User ne popup khud band kiya: error nahi, sirf cancel. */
export const isCancelled = (error) =>
  ["auth/popup-closed-by-user", "auth/cancelled-popup-request"].includes(
    error?.code,
  );

export function getUserAuthErrorMessage(error) {
  if (error?.code && messages[error.code]) return messages[error.code];
  // Hamari API (postJson) ke errors plain Error hote hain aur user-safe hain.
  if (error instanceof Error && !error.code) return error.message;
  return "Something went wrong. Please try again.";
}
