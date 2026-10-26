"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  MailCheck,
  Send,
} from "lucide-react";

import {
  AnimatedError,
  AnimatedNotice,
  AuthCard,
} from "@/components/auth/AuthCard";
import { TextField } from "@/components/forms/shared/fields";
import { Button, buttonVariants } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { useCooldown } from "@/hooks/useCooldown";
import { getMailProvider } from "@/lib/auth/mail-providers";
import {
  getUserAuthErrorMessage,
  sendResetLink,
} from "@/lib/firebase/user-auth";
import { forgotSchema } from "@/lib/validations/user-auth.schema";

const SHOW_ERRORS_FOR = [
  "auth/network-request-failed",
  "auth/too-many-requests",
];

function BackToSignIn() {
  return (
    <Link
      href="/login"
      className="inline-flex items-center gap-1.5 rounded-sm font-medium text-foreground outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <ArrowLeft aria-hidden="true" className="size-4" />
      Back to sign in
    </Link>
  );
}

export function ForgotPasswordForm() {
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [secondsLeft, setSecondsLeft] = useCooldown();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  // Returns true when we should show the "sent" state.
  async function send(email) {
    setError("");
    try {
      await sendResetLink(email);
    } catch (err) {
      // Do not reveal whether an account exists. Only surface network and rate-limit errors.
      if (SHOW_ERRORS_FOR.includes(err?.code)) {
        setError(getUserAuthErrorMessage(err));
        return false;
      }
    }
    setSentTo(email);
    setSecondsLeft(60);
    return true;
  }

  async function resend() {
    setResending(true);
    setResent(false);
    try {
      const ok = await send(sentTo);
      if (ok) setResent(true);
    } finally {
      setResending(false);
    }
  }

  if (sentTo) {
    const provider = getMailProvider(sentTo);

    return (
      <AuthCard
        autoFocusHeading
        title="Check your email"
        description={`If an account exists for ${sentTo}, we sent a link to reset your password.`}
        footer={<BackToSignIn />}
      >
        <div role="status" className="flex flex-col gap-5">
          <span
            aria-hidden="true"
            className="flex size-14 items-center justify-center rounded-2xl bg-success/10 text-success animate-in fade-in zoom-in-95 duration-300 motion-reduce:animate-none"
          >
            <MailCheck className="size-7" />
          </span>

          <ul className="space-y-1.5 text-sm leading-6 text-muted-foreground">
            <li>The link expires after a while, so use it soon.</li>
            <li>Check your spam or junk folder if you don&apos;t see it.</li>
            <li>Make sure you typed the email address correctly.</li>
          </ul>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <AnimatedNotice
            message={resent ? `Another link is on its way to ${sentTo}.` : ""}
          />
          <AnimatedError message={error} />

          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
            {provider ? (
              <a
                href={provider.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${buttonVariants({ size: "lg" })} w-full gap-2 sm:w-auto`}
              >
                Open {provider.label}
                <ExternalLink aria-hidden="true" className="size-4" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ) : null}

            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={secondsLeft > 0 || resending}
              aria-busy={resending}
              onClick={resend}
              className="w-full gap-2 sm:w-auto"
            >
              {resending ? (
                <>
                  <Loader2
                    aria-hidden="true"
                    className="size-4 animate-spin motion-reduce:animate-none"
                  />
                  Sending…
                </>
              ) : secondsLeft > 0 ? (
                `Send again in ${secondsLeft}s`
              ) : (
                "Send again"
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="lg"
              disabled={resending}
              onClick={() => {
                setError("");
                setResent(false);
                setSentTo(null);
              }}
              className="w-full sm:w-auto"
            >
              Use a different email
            </Button>
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot your password?"
      description="Enter your email and we will send you a reset link."
      footer={<BackToSignIn />}
    >
      <form onSubmit={handleSubmit(({ email }) => send(email))} noValidate>
        <FieldGroup>
          <TextField
            control={control}
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
            description="Use the email address you signed up with."
          />
          <AnimatedError message={error} />
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="w-full gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2
                  aria-hidden="true"
                  className="size-4 animate-spin motion-reduce:animate-none"
                />
                Sending…
              </>
            ) : (
              <>
                <Send aria-hidden="true" className="size-4" />
                Send reset link
              </>
            )}
          </Button>
        </FieldGroup>
      </form>
    </AuthCard>
  );
}
