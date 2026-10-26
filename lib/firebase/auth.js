import {
  inMemoryPersistence,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { getClientAuth } from "@/lib/firebase/client";

export async function signInForSession(email, password) {
  const auth = getClientAuth();
  await setPersistence(auth, inMemoryPersistence);
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await credential.user.getIdToken();
  await signOut(auth);
  return idToken;
}

export async function sendAdminPasswordReset(email) {
  await sendPasswordResetEmail(getClientAuth(), email);
}

const messages = {
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/too-many-requests":
    "Too many attempts. Please wait a few minutes and try again.",
  "auth/network-request-failed": "Network error. Please check your connection.",
  "auth/invalid-api-key": "Firebase is not configured correctly.",
};

export function getAuthErrorMessage(error) {
  if (error?.code && messages[error.code]) return messages[error.code];
  // Server (postJson) ke errors plain Error hote hain, un ka message user-safe hai.
  if (error instanceof Error && !error.code) return error.message;
  return "Could not sign in. Please try again.";
}
