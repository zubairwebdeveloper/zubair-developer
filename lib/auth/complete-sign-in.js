import { notifyHint } from "@/lib/auth/auth-hint";
import { postJson } from "@/lib/utils/submit-form";

/** ID token server ko deta hai (HttpOnly cookie banti hai) aur header ko update karta hai. */
export async function createUserSession({
  idToken,
  remember = true,
  acceptedTerms = false,
}) {
  await postJson("/api/auth/session", { idToken, remember, acceptedTerms });
  notifyHint();
}
