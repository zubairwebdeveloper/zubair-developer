"use client";

import {
  ArrowUpRight,
  Link2,
  Loader2,
  MailCheck,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { TextField, TextareaField } from "@/components/forms/shared/fields";
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
import { FieldGroup } from "@/components/ui/field";
import { createResolver } from "@/lib/admin/form-payload";
import { cn } from "@/lib/utils";
import { sendJson } from "@/lib/utils/submit-form";
import { profileSchema } from "@/lib/validations/settings.schema";

const SOCIALS = [
  { name: "github", label: "GitHub" },
  { name: "linkedin", label: "LinkedIn" },
  { name: "instagram", label: "Instagram" },
  { name: "facebook", label: "Facebook" },
];

function isHttpUrl(value) {
  try {
    const url = new URL(String(value ?? "").trim());
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function SectionHeader({ icon: Icon, title, description, aside }) {
  return (
    <CardHeader className="gap-3">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <CardTitle className="text-base font-semibold tracking-tight">
            {title}
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed text-pretty">
            {description}
          </CardDescription>
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
    </CardHeader>
  );
}

export function ProfileForm({ profile }) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm({
    resolver: createResolver(profileSchema, (values) => values),
    defaultValues: {
      headline: profile?.headline ?? "",
      bio: profile?.bio ?? "",
      github: profile?.socials?.github ?? "",
      linkedin: profile?.socials?.linkedin ?? "",
      instagram: profile?.socials?.instagram ?? "",
      facebook: profile?.socials?.facebook ?? "",
    },
  });

  const watched = useWatch({ control });
  const headline = String(watched.headline ?? "").trim();
  const bio = String(watched.bio ?? "");
  const linkedSocials = SOCIALS.filter(({ name }) => isHttpUrl(watched[name]));

  async function onSubmit(values) {
    setSubmitError("");
    try {
      await sendJson("PUT", "/api/admin/profile", values);
      toast.success("Profile saved");
      // Saved values naya baseline ban jati hain, taake "unsaved" hat jaye.
      reset(values);
      router.refresh();
    } catch (error) {
      setSubmitError(error.message);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex max-w-2xl flex-col gap-6"
    >
      {/* 1. Public profile */}
      <Card className="border-border/70">
        <SectionHeader
          icon={UserRound}
          title="Public profile"
          description="Shown on your About page. Only write real, verifiable things."
          aside={
            <span
              aria-live="polite"
              className="text-xs font-medium text-muted-foreground tabular-nums"
            >
              {bio.length} characters
            </span>
          }
        />
        <CardContent>
          <FieldGroup>
            <TextField
              control={control}
              name="headline"
              label="Headline (optional)"
            />
            <TextareaField
              control={control}
              name="bio"
              label="About me (optional)"
              rows={7}
              description="Shown on the About page. Only write real, verifiable things."
            />
          </FieldGroup>
        </CardContent>
      </Card>

      {/* 2. Social links */}
      <Card className="border-border/70">
        <SectionHeader
          icon={Link2}
          title="Social links"
          description="Full profile URLs, starting with https://. Leave a field empty to hide it."
          aside={
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              {linkedSocials.length} / {SOCIALS.length} linked
            </span>
          }
        />
        <CardContent className="flex flex-col gap-5">
          <FieldGroup>
            {SOCIALS.map(({ name, label }) => (
              <TextField
                key={name}
                control={control}
                name={name}
                label={`${label} URL`}
                placeholder="https://"
              />
            ))}
          </FieldGroup>

          {linkedSocials.length > 0 ? (
            <ul
              aria-label="Open linked profiles"
              className="flex flex-wrap gap-2 border-t border-border/70 pt-4"
            >
              {linkedSocials.map(({ name, label }) => (
                <li key={name}>
                  <a
                    href={String(watched[name]).trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    {label}
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>

      {/* 3. Preview (sirf wahi dikhata hai jo aapne likha hai) */}
      {headline || bio.trim() ? (
        <Card className="border-dashed border-border/70 bg-muted/20">
          <CardHeader className="gap-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {headline ? (
              <p className="text-lg font-semibold tracking-tight text-balance">
                {headline}
              </p>
            ) : null}
            {bio.trim() ? (
              <p className="line-clamp-6 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                {bio}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {/* Actions */}
      <Card className="border-border/70 bg-muted/20">
        <CardContent>
          <FieldGroup>
            <FormError message={submitError} />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || !isDirty}
                aria-busy={isSubmitting}
                className="gap-2 motion-safe:active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      className="size-4 motion-safe:animate-spin"
                      aria-hidden="true"
                    />
                    Saving…
                  </>
                ) : (
                  "Save profile"
                )}
              </Button>
              {isDirty && !isSubmitting ? (
                <Button
                  type="button"
                  size="lg"
                  variant="ghost"
                  onClick={() => reset()}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Discard changes
                </Button>
              ) : null}
            </div>
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <p
            role="status"
            className={cn(
              "flex items-center gap-1.5 text-sm text-muted-foreground",
            )}
          >
            {isDirty ? (
              <>
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-amber-500"
                />
                You have unsaved changes.
              </>
            ) : (
              <>
                <MailCheck className="size-4 text-primary" aria-hidden="true" />
                All changes saved.
              </>
            )}
          </p>
        </CardFooter>
      </Card>
    </form>
  );
}
