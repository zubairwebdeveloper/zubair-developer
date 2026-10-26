import {
  getAuth,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "firebase/auth";

import { app } from "./client";

const auth = getAuth(app);

export async function sendResetLink(email) {
  const normalizedEmail = email.trim();

  return sendPasswordResetEmail(auth, normalizedEmail, {
    url: `${window.location.origin}/login`,
    handleCodeInApp: false,
  });
}

export async function checkResetCode(code) {
  return verifyPasswordResetCode(auth, code);
}

export async function finishPasswordReset(code, password) {
  return confirmPasswordReset(auth, code, password);
}
