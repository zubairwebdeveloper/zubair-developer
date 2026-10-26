"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { FormError } from "@/components/forms/shared/FormStatus";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  getAuthErrorMessage,
  sendAdminPasswordReset,
  signInForSession,
} from "@/lib/firebase/auth";
import { postJson } from "@/lib/utils/submit-form";
import { loginSchema } from "@/lib/validations/auth.schema";

const RESET_COOLDOWN_SECONDS = 30;

const TRUST_POINTS = [
  { icon: ShieldCheck, label: "Admin-only access" },
  { icon: Lock, label: "Secure session" },
  { icon: KeyRound, label: "Email password reset" },
];

export function LoginForm({ next }) {
  const router = useRouter();
  const capsId = useId();

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const {
    control,
    handleSubmit,
    getValues,
    trigger,
    setFocus,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Reset-link cooldown: repeated clicks se bachata hai.
  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    setFocus("email");
  }, [setFocus]);

  function handleCapsLock(event) {
    if (typeof event.getModifierState === "function") {
      setCapsLockOn(event.getModifierState("CapsLock"));
    }
  }

  async function onSubmit({ email, password }) {
    setError("");
    setNotice("");
    try {
      const idToken = await signInForSession(email, password);
      await postJson("/api/admin/session", { idToken });
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(getAuthErrorMessage(err));
      setFocus("password");
    }
  }

  async function onForgotPassword() {
    setError("");
    setNotice("");
    const emailIsValid = await trigger("email");
    if (!emailIsValid) {
      setFocus("email");
      return;
    }

    setIsSendingReset(true);
    try {
      await sendAdminPasswordReset(getValues("email"));
    } catch {
      // Account maujood hai ya nahi, ye zahir nahi karte. Hamesha same message.
    } finally {
      setIsSendingReset(false);
    }
    setNotice(
      "If an account exists for this email, a reset link has been sent.",
    );
    setCooldown(RESET_COOLDOWN_SECONDS);
  }

  const resetDisabled = isSubmitting || isSendingReset || cooldown > 0;

  return (
    <Card className="w-full max-w-md gap-0 overflow-hidden border-border/70 bg-card/95 shadow-xl shadow-black/10">
      {/* Accent line: brand colour ka subtle top edge */}
      <div
        aria-hidden="true"
        className="h-px w-full bg-gradient-to-r from-transparent via-primary/70 to-transparent"
      />

      <CardHeader className="gap-4 px-6 pt-8 pb-2 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-11 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-primary"
            />
            Zubair Developer · Admin
          </span>
        </div>
        <div className="space-y-1.5">
          <CardTitle className="text-card-title text-2xl font-semibold tracking-tight text-balance sm:text-[1.65rem]">
            Admin sign in
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed text-pretty">
            Authorized administrators only. Sign in to manage projects,
            inquiries, and site content.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="px-6 pt-4 pb-6 sm:px-8">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="admin-email">Email</FieldLabel>
                  <div className="relative">
                    <Mail
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      {...field}
                      id="admin-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      aria-invalid={fieldState.invalid}
                      disabled={isSubmitting}
                      className="h-11 pl-10"
                    />
                  </div>
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="admin-password">Password</FieldLabel>
                  <div className="relative">
                    <Lock
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      {...field}
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      aria-invalid={fieldState.invalid}
                      aria-describedby={capsLockOn ? capsId : undefined}
                      disabled={isSubmitting}
                      onKeyUp={handleCapsLock}
                      onKeyDown={handleCapsLock}
                      onBlur={(event) => {
                        field.onBlur(event);
                        setCapsLockOn(false);
                      }}
                      className="h-11 pr-12 pl-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      aria-pressed={showPassword}
                      className="absolute top-1/2 right-1 size-9 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" aria-hidden="true" />
                      ) : (
                        <Eye className="size-4" aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                  {capsLockOn ? (
                    <FieldDescription
                      id={capsId}
                      className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400"
                    >
                      <TriangleAlert className="size-3.5" aria-hidden="true" />
                      Caps Lock is on.
                    </FieldDescription>
                  ) : null}
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />

            <FormError message={error} />

            {notice ? (
              <div
                role="status"
                className="flex items-start gap-2.5 rounded-lg border border-primary/25 bg-primary/10 px-3.5 py-3 text-sm leading-relaxed text-foreground motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-1"
              >
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <p>{notice}</p>
              </div>
            ) : null}

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="h-11 w-full text-sm font-semibold transition-transform motion-safe:active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <Loader2
                    className="size-4 motion-safe:animate-spin"
                    aria-hidden="true"
                  />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={onForgotPassword}
              disabled={resetDisabled}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              {isSendingReset ? (
                <>
                  <Loader2
                    className="size-4 motion-safe:animate-spin"
                    aria-hidden="true"
                  />
                  Sending reset link…
                </>
              ) : cooldown > 0 ? (
                `Resend reset link in ${cooldown}s`
              ) : (
                "Forgot password?"
              )}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="flex-col items-stretch gap-4 border-t border-border/70 bg-muted/20 px-6 py-5 sm:px-8">
        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          {TRUST_POINTS.map(({ icon: Icon, label }) => (
            <li key={label} className="inline-flex items-center gap-1.5">
              <Icon className="size-3.5 text-primary" aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to website
        </Link>
      </CardFooter>
    </Card>
  );
}
