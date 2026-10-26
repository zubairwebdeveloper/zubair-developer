"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createUserSession } from "@/lib/auth/complete-sign-in";
import {
  getUserAuthErrorMessage,
  googleSignInToken,
  isCancelled,
} from "@/lib/firebase/user-auth";

/**
 * GoogleButton
 *
 * @param {string}   [next]     Where to go after signing in. Defaults to the home page.
 * @param {Function} [onError]  Receives an error message, or "" when a new attempt starts.
 */
export function GoogleButton({
  next = "/",
  onError,
  disabled,
  label = "Continue with Google",
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    onError?.("");
    try {
      const idToken = await googleSignInToken();
      await createUserSession({ idToken, remember: true });
      router.replace(next);
      router.refresh();
    } catch (error) {
      if (!isCancelled(error)) onError?.(getUserAuthErrorMessage(error));
      setPending(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-11 w-full gap-2.5 bg-background font-medium transition-colors hover:bg-muted/60 motion-reduce:transition-none"
        disabled={disabled || pending}
        aria-busy={pending}
        onClick={onClick}
      >
        {pending ? (
          <Loader2
            aria-hidden="true"
            className="size-[18px] animate-spin motion-reduce:animate-none"
          />
        ) : (
          <FcGoogle aria-hidden="true" className="size-[18px]" />
        )}
        {pending ? "Waiting for Google…" : label}
      </Button>

      {/* Tells screen reader users what to do while the Google window is open. */}
      <span role="status" aria-live="polite" className="sr-only">
        {pending ? "Complete sign-in in the Google window." : ""}
      </span>
    </>
  );
}
