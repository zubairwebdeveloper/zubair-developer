"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, LogIn } from "lucide-react";

import { AuthDivider } from "@/components/auth/AuthDivider";
import { AnimatedError, AuthCard } from "@/components/auth/AuthCard";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { PasswordField } from "@/components/auth/PasswordField";
import { CheckboxField, TextField } from "@/components/forms/shared/fields";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { createUserSession } from "@/lib/auth/complete-sign-in";
import {
  emailSignInToken,
  getUserAuthErrorMessage,
} from "@/lib/firebase/user-auth";
import { userLoginSchema } from "@/lib/validations/user-auth.schema";

const LINK_CLASS =
  "rounded-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const DEFAULT_NEXT = "/account";

/**
 * Only allow redirects to pages on this site. This blocks values like
 * "https://example.com" or "//example.com" that could send someone elsewhere
 * after signing in.
 */
function getSafeNext(next) {
  if (typeof next !== "string") return DEFAULT_NEXT;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return DEFAULT_NEXT;
  }
  return next;
}

export function LoginForm({ next }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const safeNext = getSafeNext(next);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(userLoginSchema),
    defaultValues: { email: "", password: "", remember: true },
  });

  async function onSubmit({ email, password, remember }) {
    setError("");
    try {
      const idToken = await emailSignInToken(email, password);
      await createUserSession({ idToken, remember });
      router.replace(safeNext);
      router.refresh();
    } catch (err) {
      setError(getUserAuthErrorMessage(err));
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to manage your account."
      footer={
        <>
          New here?{" "}
          <Link
            href={`/register?next=${encodeURIComponent(safeNext)}`}
            className={`${LINK_CLASS} font-medium text-foreground underline underline-offset-4 hover:text-primary`}
          >
            Create an account
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          aria-busy={isSubmitting}
        >
          <FieldGroup>
            <TextField
              control={control}
              name="email"
              label="Email"
              type="email"
              autoComplete="email"
            />
            <PasswordField
              control={control}
              name="password"
              label="Password"
              autoComplete="current-password"
            />

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <CheckboxField
                  control={control}
                  name="remember"
                  label="Remember me"
                />
                <Link
                  href="/forgot-password"
                  className={`${LINK_CLASS} text-sm font-medium text-primary underline-offset-4 hover:underline`}
                >
                  Forgot password?
                </Link>
              </div>
              <p className="text-xs leading-5 text-muted-foreground">
                Only use Remember me on your own device.
              </p>
            </div>

            <AnimatedError id="login-error" message={error} />

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              aria-describedby={error ? "login-error" : undefined}
              className="w-full gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2
                    aria-hidden="true"
                    className="size-4 animate-spin motion-reduce:animate-none"
                  />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn aria-hidden="true" className="size-4" />
                  Sign in
                </>
              )}
            </Button>
          </FieldGroup>
        </form>

        <AuthDivider>or continue with Google</AuthDivider>

        <GoogleButton
          next={safeNext}
          onError={setError}
          disabled={isSubmitting}
        />
      </div>
    </AuthCard>
  );
}
