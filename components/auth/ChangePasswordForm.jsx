"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Info, KeyRound, Loader2 } from "lucide-react";

import { AnimatedError, AnimatedNotice } from "@/components/auth/AuthCard";
import { PasswordField } from "@/components/auth/PasswordField";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { createUserSession } from "@/lib/auth/complete-sign-in";
import {
  changePasswordForSession,
  getUserAuthErrorMessage,
} from "@/lib/firebase/user-auth";
import { changePasswordSchema } from "@/lib/validations/user-auth.schema";

const passwordTips = [
  "Use a password you do not use on any other site.",
  "A long phrase made of several words is hard to guess and easy to remember.",
  "A password manager can create and store strong passwords for you.",
];

export function ChangePasswordForm({ email }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [changed, setChanged] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", password: "", confirmPassword: "" },
  });

  async function onSubmit({ currentPassword, password }) {
    setError("");
    setChanged(false);

    if (password === currentPassword) {
      setError(
        "Your new password must be different from your current password.",
      );
      return;
    }

    try {
      const idToken = await changePasswordForSession(
        email,
        currentPassword,
        password,
      );
      // Changing the password revokes existing sessions, so create a fresh cookie for this device.
      await createUserSession({ idToken, remember: true });
      toast.success("Password changed. Your other devices were signed out.");
      reset();
      setChanged(true);
      router.refresh();
    } catch (err) {
      setError(getUserAuthErrorMessage(err));
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-busy={isSubmitting}
      className="w-full max-w-md"
    >
      <FieldGroup>
        {/* The success message stays visible until the person starts typing again. */}
        <AnimatedNotice
          message={
            changed && !isDirty
              ? "Your password was updated. Your other devices were signed out."
              : ""
          }
        />

        <div className="flex flex-col gap-2">
          <PasswordField
            control={control}
            name="currentPassword"
            label="Current password"
            autoComplete="current-password"
          />
          <p className="text-sm text-muted-foreground">
            Cannot remember it?{" "}
            <Link
              href="/forgot-password"
              className="rounded-sm font-medium text-foreground underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Reset it by email
            </Link>
          </p>
        </div>

        <div className="border-t border-border pt-6">
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

            <details className="group rounded-lg border border-border bg-card text-sm">
              <summary className="cursor-pointer select-none rounded-lg px-3 py-2.5 font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Tips for a strong password
              </summary>
              <ul className="list-disc space-y-1.5 border-t border-border px-3 py-3 pl-7 leading-6 text-muted-foreground">
                {passwordTips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </details>
          </FieldGroup>
        </div>

        <p className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/40 p-3 text-sm leading-6 text-muted-foreground">
          <Info
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-primary"
          />
          For your security, changing your password signs you out of all your
          other devices. You will stay signed in here.
        </p>

        <AnimatedError id="change-password-error" message={error} />

        <Button
          type="submit"
          disabled={isSubmitting}
          aria-describedby={error ? "change-password-error" : undefined}
          className="w-full gap-2 sm:w-fit"
        >
          {isSubmitting ? (
            <>
              <Loader2
                aria-hidden="true"
                className="size-4 animate-spin motion-reduce:animate-none"
              />
              Updating…
            </>
          ) : (
            <>
              <KeyRound aria-hidden="true" className="size-4" />
              Change password
            </>
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}
