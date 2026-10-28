"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  AlertTriangle,
  Check,
  Loader2,
  MailCheck,
  ShieldCheck,
} from "lucide-react";

import { AnimatedError, AuthCard } from "@/components/auth/AuthCard";
import { PasswordField } from "@/components/auth/PasswordField";
import { Button, buttonVariants } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import {
  checkResetCode,
  confirmEmailCode,
  finishPasswordReset,
  getUserAuthErrorMessage,
} from "@/lib/firebase/user-auth";
import { cn } from "@/lib/utils/cn";
import { resetSchema } from "@/lib/validations/user-auth.schema";

const TONES = {
  success: "bg-success/10 text-success",
  destructive: "bg-destructive/10 text-destructive",
};

const RESET_STEPS = ["Verify link", "New password", "Done"];
const SLOW_CHECK_MS = 10000;

const isSupportedMode = (mode) =>
  mode === "resetPassword" || mode === "verifyEmail";

function StatusIcon({ icon: Icon, tone = "success" }) {
  return (
    <span
      aria-hidden="true"
      className={`flex size-14 items-center justify-center rounded-2xl animate-in fade-in zoom-in-95 duration-300 motion-reduce:animate-none ${TONES[tone]}`}
    >
      <Icon className="size-7" />
    </span>
  );
}

/** Shows where the person is in the password reset flow. */
function Steps({ current, done = false }) {
  return (
    <ol
      aria-label="Password reset progress"
      className="mb-5 flex items-center gap-2"
    >
      {RESET_STEPS.map((label, index) => {
        const number = index + 1;
        const complete = done || number < current;
        const active = !done && number === current;

        return (
          <li
            key={label}
            aria-current={active ? "step" : undefined}
            className="flex min-w-0 items-center gap-2"
          >
            <span
              aria-hidden="true"
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                complete && "bg-primary text-primary-foreground",
                active && "bg-primary/10 text-primary ring-1 ring-primary/40",
                !complete && !active && "bg-muted text-muted-foreground",
              )}
            >
              {complete ? <Check className="size-3.5" /> : number}
            </span>
            <span
              className={cn(
                "truncate text-xs sm:text-sm",
                active
                  ? "font-medium text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {label}
              {complete ? <span className="sr-only"> (completed)</span> : null}
            </span>
            {number < RESET_STEPS.length ? (
              <span
                aria-hidden="true"
                className="h-px w-3 shrink-0 bg-border sm:w-6"
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function Checking({ mode }) {
  const [slow, setSlow] = useState(false);

  // If verification drags on, tell the person what to do instead of leaving them waiting.
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), SLOW_CHECK_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthCard title="One moment…" description="We're checking your link.">
      {mode === "resetPassword" ? <Steps current={1} /> : null}
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground"
      >
        <Loader2
          aria-hidden="true"
          className="size-4 shrink-0 animate-spin motion-reduce:animate-none"
        />
        Verifying the link. This only takes a few seconds.
      </div>

      {slow ? (
        <div className="mt-4 flex flex-col items-start gap-3">
          <p className="text-sm leading-6 text-muted-foreground">
            This is taking longer than usual. Check your internet connection,
            then try again.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Try again
          </Button>
        </div>
      ) : null}
    </AuthCard>
  );
}

function Done({
  icon,
  title,
  description,
  href,
  label,
  steps = false,
  extra,
  tip,
}) {
  return (
    <AuthCard title={title} description={description}>
      {steps ? <Steps current={3} done /> : null}
      <div role="status" className="flex flex-col items-start gap-5">
        <StatusIcon icon={icon} />
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Link
            href={href}
            className={`${buttonVariants({ size: "lg" })} w-full sm:w-auto`}
          >
            {label}
          </Link>
          {extra ? (
            <Link
              href={extra.href}
              className={`${buttonVariants({ variant: "ghost", size: "lg" })} w-full sm:w-auto`}
            >
              {extra.label}
            </Link>
          ) : null}
        </div>
        {tip ? (
          <p className="text-sm leading-6 text-muted-foreground">{tip}</p>
        ) : null}
      </div>
    </AuthCard>
  );
}

function Problem({ message, mode }) {
  const isReset = mode === "resetPassword";
  const known = isSupportedMode(mode);

  const guidance = isReset
    ? "Reset links expire and can only be used once. Request a new one to continue."
    : known
      ? "Verification links expire and can only be used once. Sign in to continue."
      : "Open the link directly from your email. If it still does not work, sign in or request a new one.";

  return (
    <AuthCard title="This link can't be used" description={message}>
      <div role="alert" className="flex flex-col items-start gap-5">
        <StatusIcon icon={AlertTriangle} tone="destructive" />
        <p className="text-sm leading-6 text-muted-foreground">{guidance}</p>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Link
            href={isReset ? "/forgot-password" : "/login"}
            className={`${buttonVariants({ variant: "outline", size: "lg" })} w-full sm:w-auto`}
          >
            {isReset ? "Request a new link" : "Go to sign in"}
          </Link>
          {isReset ? (
            <Link
              href="/login"
              className={`${buttonVariants({ variant: "ghost", size: "lg" })} w-full sm:w-auto`}
            >
              Back to sign in
            </Link>
          ) : null}
        </div>
      </div>
    </AuthCard>
  );
}

function ResetForm({ code, email, onDone }) {
  const [error, setError] = useState("");
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit({ password }) {
    setError("");
    try {
      await finishPasswordReset(code, password);
      onDone();
    } catch (err) {
      setError(getUserAuthErrorMessage(err));
    }
  }

  return (
    <AuthCard
      title="Choose a new password"
      description={`Create a new password for ${email}.`}
    >
      <Steps current={2} />
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <PasswordField
            control={control}
            name="password"
            label="New password"
            autoComplete="new-password"
            showStrength
          />
          <PasswordField
            control={control}
            name="confirmPassword"
            label="Confirm new password"
            autoComplete="new-password"
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
                Saving…
              </>
            ) : (
              "Reset password"
            )}
          </Button>
        </FieldGroup>
      </form>
    </AuthCard>
  );
}

export function ActionHandler({ mode, code }) {
  const supported = isSupportedMode(mode) && Boolean(code);

  const incompleteMessage = isSupportedMode(mode)
    ? "This link is incomplete."
    : "This type of link is not supported here.";

  const [state, setState] = useState(
    supported
      ? { status: "checking" }
      : { status: "error", message: incompleteMessage },
  );
  const startedFor = useRef(null);

  useEffect(() => {
    if (!supported) return;

    // Run once per link. A different link on the same page starts over.
    const key = `${mode}:${code}`;
    if (startedFor.current === key) return;
    if (startedFor.current !== null) setState({ status: "checking" });
    startedFor.current = key;

    async function run() {
      try {
        if (mode === "resetPassword") {
          const email = await checkResetCode(code);
          setState({ status: "reset", email });
        } else {
          await confirmEmailCode(code);
          setState({ status: "verified" });
        }
      } catch (err) {
        setState({ status: "error", message: getUserAuthErrorMessage(err) });
      }
    }

    run();
  }, [supported, mode, code, incompleteMessage]);

  const visibleState = supported
    ? state
    : { status: "error", message: incompleteMessage };

  switch (visibleState.status) {
    case "checking":
      return <Checking mode={mode} />;
    case "reset":
      return (
        <ResetForm
          code={code}
          email={visibleState.email}
          onDone={() => setState({ status: "reset-done" })}
        />
      );
    case "reset-done":
      return (
        <Done
          steps
          icon={ShieldCheck}
          title="Password updated"
          description="You can now sign in with your new password."
          href="/login"
          label="Go to sign in"
          tip="Tip: a password manager can create and remember strong, unique passwords for you."
        />
      );
    case "verified":
      return (
        <Done
          icon={MailCheck}
          title="Email verified"
          description="Thanks, your email address is confirmed."
          href="/account"
          label="Go to my account"
          extra={{ href: "/", label: "Back to site" }}
        />
      );
    default:
      return <Problem message={visibleState.message} mode={mode} />;
  }
}
