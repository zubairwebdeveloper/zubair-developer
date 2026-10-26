"use client";

import { useId, useState } from "react";
import { toast } from "sonner";
import { ExternalLink, Loader2, MailWarning } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { useCooldown } from "@/hooks/useCooldown";
import { getMailProvider } from "@/lib/auth/mail-providers";
import { cn } from "@/lib/utils/cn";
import { postJson } from "@/lib/utils/submit-form";

export function VerifyEmailBanner({ email }) {
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [secondsLeft, setSecondsLeft] = useCooldown();
  const headingId = useId();

  const provider = getMailProvider(email);

  async function resend() {
    setPending(true);
    try {
      await postJson("/api/auth/verify-email", {});
      toast.success("Verification email sent.");
      setSent(true);
      setSecondsLeft(60);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-4 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:p-5"
    >
      <div className="flex items-start gap-3.5">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-warning/20 text-warning-foreground"
        >
          <MailWarning className="size-5" />
        </span>
        <div className="min-w-0">
          <p id={headingId} className="font-semibold text-foreground">
            Verify your email address
          </p>
          <p className="mt-1 leading-6 text-muted-foreground">
            We sent a link to{" "}
            <span className="break-all font-medium text-foreground">
              {email}
            </span>
            . Open it to confirm your account.
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Cannot find it? Check your spam or junk folder.
          </p>

          {/* Stays on screen after the toast disappears. */}
          <p
            role="status"
            aria-live="polite"
            className={cn(
              "mt-2 font-medium text-foreground",
              !sent && "sr-only",
            )}
          >
            {sent ? "A new link is on its way." : ""}
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
        {provider ? (
          <a
            href={provider.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ size: "sm" }),
              "h-10 w-full gap-2 sm:w-auto",
            )}
          >
            Open {provider.label}
            <ExternalLink aria-hidden="true" className="size-4" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        ) : null}

        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending || secondsLeft > 0}
          aria-busy={pending}
          onClick={resend}
          className="h-10 w-full gap-2 bg-background sm:w-auto"
        >
          {pending ? (
            <>
              <Loader2
                aria-hidden="true"
                className="size-4 animate-spin motion-reduce:animate-none"
              />
              Sending…
            </>
          ) : secondsLeft > 0 ? (
            `Resend in ${secondsLeft}s`
          ) : (
            "Resend email"
          )}
        </Button>
      </div>
    </section>
  );
}
