"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

import { AnimatedError } from "@/components/auth/AuthCard";
import { TextField } from "@/components/forms/shared/fields";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { sendJson } from "@/lib/utils/submit-form";
import { profileNameSchema } from "@/lib/validations/user-auth.schema";

export function ProfileNameForm({ displayName }) {
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(profileNameSchema),
    defaultValues: { displayName: displayName ?? "" },
  });

  // Warn before closing the tab with an unsaved name change.
  useEffect(() => {
    if (!isDirty) return undefined;
    const onBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  async function onSubmit(values) {
    setError("");
    try {
      await sendJson("PATCH", "/api/auth/profile", values);
      toast.success("Name updated");
      // Make the saved value the new baseline so the button disables again until the next edit.
      reset(values);
      router.refresh();
    } catch (err) {
      setError(err.message);
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
        <TextField
          control={control}
          name="displayName"
          label="Full name"
          autoComplete="name"
          description="This is the name shown on your account."
        />

        <AnimatedError id="profile-name-error" message={error} />

        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center">
          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            aria-busy={isSubmitting}
            aria-describedby={error ? "profile-name-error" : undefined}
            className="w-full gap-2 sm:w-fit"
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
              <>
                <Save aria-hidden="true" className="size-4" />
                Save name
              </>
            )}
          </Button>

          {isDirty && !isSubmitting ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setError("");
                reset();
              }}
              className="w-full sm:w-fit"
            >
              Cancel
            </Button>
          ) : null}
        </div>
      </FieldGroup>
    </form>
  );
}
