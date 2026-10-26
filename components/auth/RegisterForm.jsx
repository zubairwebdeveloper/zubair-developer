"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";

import { AuthDivider } from "@/components/auth/AuthDivider";
import { AnimatedError, AuthCard } from "@/components/auth/AuthCard";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { PasswordField } from "@/components/auth/PasswordField";
import { CheckboxField, TextField } from "@/components/forms/shared/fields";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { createUserSession } from "@/lib/auth/complete-sign-in";
import {
  getUserAuthErrorMessage,
  registerForSession,
} from "@/lib/firebase/user-auth";
import { registerSchema } from "@/lib/validations/user-auth.schema";

const LINK_CLASS =
  "rounded-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const POLICY_LINK_CLASS = `${LINK_CLASS} font-medium text-foreground underline underline-offset-4 hover:text-primary`;

const DEFAULT_NEXT = "/account";

/**
 * Only allow redirects to pages on this site, so a crafted link cannot send
 * someone to another website after they sign up. Same rule as LoginForm.
 * Tip: move this into a shared file such as "@/lib/auth/safe-next" so both forms use one copy.
 */
function getSafeNext(next) {
  if (typeof next !== "string") return DEFAULT_NEXT;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return DEFAULT_NEXT;
  }
  return next;
}

function PolicyLinks() {
  return (
    <>
      <Link
        href="/terms"
        target="_blank"
        rel="noopener noreferrer"
        className={POLICY_LINK_CLASS}
      >
        Terms
      </Link>{" "}
      and{" "}
      <Link
        href="/privacy"
        target="_blank"
        rel="noopener noreferrer"
        className={POLICY_LINK_CLASS}
      >
        Privacy Policy
      </Link>
    </>
  );
}

const termsLabel = (
  <>
    I agree to the <PolicyLinks />.
  </>
);

export function RegisterForm({ next }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const safeNext = getSafeNext(next);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  async function onSubmit(values) {
    setError("");
    try {
      const { idToken, verificationSent } = await registerForSession(values);
      await createUserSession({ idToken, remember: true, acceptedTerms: true });
      toast.success(
        verificationSent
          ? "Account created. Check your inbox to verify your email."
          : "Account created.",
      );
      router.replace(safeNext);
      router.refresh();
    } catch (err) {
      setError(getUserAuthErrorMessage(err));
    }
  }

  return (
    <AuthCard
      title="Create your account"
      description="It takes less than a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={`/login?next=${encodeURIComponent(safeNext)}`}
            className={POLICY_LINK_CLASS}
          >
            Sign in
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Fastest option first, then the divider, then the email form. */}
        <div className="flex flex-col gap-3">
          <GoogleButton
            next={safeNext}
            onError={setError}
            disabled={isSubmitting}
            label="Sign up with Google"
          />
          <p className="text-center text-xs leading-5 text-muted-foreground">
            By continuing with Google, you agree to our <PolicyLinks />.
          </p>
        </div>

        <AuthDivider>or use email</AuthDivider>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          aria-busy={isSubmitting}
        >
          <FieldGroup>
            <TextField
              control={control}
              name="name"
              label="Full name"
              autoComplete="name"
            />
            <TextField
              control={control}
              name="email"
              label="Email"
              type="email"
              autoComplete="email"
              description="We will send a verification link to this address."
            />
            <PasswordField
              control={control}
              name="password"
              label="Password"
              autoComplete="new-password"
              showStrength
            />
            <PasswordField
              control={control}
              name="confirmPassword"
              label="Confirm password"
              autoComplete="new-password"
            />

            <CheckboxField control={control} name="terms" label={termsLabel} />

            <AnimatedError id="register-error" message={error} />

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              aria-describedby={error ? "register-error" : undefined}
              className="w-full gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2
                    aria-hidden="true"
                    className="size-4 animate-spin motion-reduce:animate-none"
                  />
                  Creating account…
                </>
              ) : (
                <>
                  <UserPlus aria-hidden="true" className="size-4" />
                  Create account
                </>
              )}
            </Button>
          </FieldGroup>
        </form>
      </div>
    </AuthCard>
  );
}
