"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { SwitchField, TextField } from "@/components/forms/shared/fields";
import { FormError } from "@/components/forms/shared/FormStatus";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { createResolver } from "@/lib/admin/form-payload";
import { cn } from "@/lib/utils/cn";
import { fromLocalInput, toLocalInput } from "@/lib/utils/dates";
import { sendJson } from "@/lib/utils/submit-form";
import { announcementSchema } from "@/lib/validations/settings.schema";

const buildPayload = (values) => ({
  enabled: values.enabled,
  message: values.message,
  href: values.href,
  linkLabel: values.linkLabel,
  startsAt: fromLocalInput(values.startsAt),
  endsAt: fromLocalInput(values.endsAt),
});

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

/** datetime-local strings ("2026-10-22T09:30") parse as local time. */
function parseLocal(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

const dateFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

/** Plain-language summary of when visitors will see the bar. */
function getScheduleSummary({ enabled, startsAt, endsAt }, now) {
  const start = parseLocal(startsAt);
  const end = parseLocal(endsAt);

  if (start && end && end <= start) {
    return {
      tone: "warning",
      text: "The end time is before the start time. Choose an end time after the start.",
    };
  }
  if (!enabled) {
    return {
      tone: "muted",
      text: "The announcement is turned off, so visitors will not see it.",
    };
  }
  if (end && end <= now) {
    return {
      tone: "muted",
      text: `This announcement ended on ${dateFormat.format(end)}, so visitors will not see it.`,
    };
  }
  if (start && start > now) {
    return {
      tone: "info",
      text: `Scheduled. It will appear on ${dateFormat.format(start)}${
        end ? ` and stop on ${dateFormat.format(end)}` : ""
      }.`,
    };
  }
  return {
    tone: "live",
    text: end
      ? `Live now. It will stop showing on ${dateFormat.format(end)}.`
      : "Live now, with no end date.",
  };
}

/* -------------------------------------------------------------------------- */
/*  Preview                                                                   */
/* -------------------------------------------------------------------------- */

function AnnouncementPreview({ enabled, message, href, linkLabel }) {
  const text = message?.trim();
  const showLink = Boolean(href?.trim());

  return (
    <section
      aria-labelledby="announcement-preview-title"
      className="flex flex-col gap-2"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="announcement-preview-title" className="text-sm font-semibold">
          Preview
        </h2>
        <span className="text-xs text-muted-foreground">
          Approximate. Your site's bar may differ slightly.
        </span>
      </div>

      <div
        className={cn(
          "flex min-h-11 flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-xl px-4 py-2.5 text-center text-sm",
          "bg-primary text-primary-foreground transition-opacity motion-reduce:transition-none",
          !enabled && "opacity-50",
        )}
      >
        <span className={cn("font-medium", !text && "opacity-70")}>
          {text || "Your message appears here"}
        </span>
        {showLink ? (
          <span className="font-medium underline underline-offset-4">
            {linkLabel?.trim() || "Learn more"}
          </span>
        ) : null}
      </div>

      {!enabled ? (
        <p className="text-xs text-muted-foreground">
          Shown dimmed because the announcement is turned off.
        </p>
      ) : null}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Form                                                                      */
/* -------------------------------------------------------------------------- */

const summaryStyles = {
  live: "border-primary/30 bg-primary/5 text-foreground",
  info: "border-border bg-muted/40 text-foreground",
  muted: "border-border bg-muted/40 text-muted-foreground",
  warning: "border-destructive/40 bg-destructive/5 text-foreground",
};

export function AnnouncementForm({ announcement }) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [mounted, setMounted] = useState(false); // dates render after mount to avoid hydration mismatch

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting, isDirty },
  } = useForm({
    resolver: createResolver(announcementSchema, buildPayload),
    defaultValues: {
      enabled: announcement?.enabled ?? false,
      message: announcement?.message ?? "",
      href: announcement?.href ?? "",
      linkLabel: announcement?.linkLabel ?? "",
      startsAt: toLocalInput(announcement?.startsAt),
      endsAt: toLocalInput(announcement?.endsAt),
    },
  });

  const [enabled, message, href, linkLabel, startsAt, endsAt] = useWatch({
    control,
    name: ["enabled", "message", "href", "linkLabel", "startsAt", "endsAt"],
  });

  useEffect(() => setMounted(true), []);

  // Warn before leaving the page with unsaved edits.
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
    setSubmitError("");
    try {
      await sendJson("PUT", "/api/admin/settings", buildPayload(values));
      toast.success("Announcement saved");
      reset(values); // the saved values become the new baseline
      router.refresh();
    } catch (error) {
      setSubmitError(error.message);
    }
  }

  function onInvalid() {
    toast.error(
      "Some fields need attention. Check the highlighted fields and try again.",
    );
  }

  function clearSchedule() {
    setValue("startsAt", "", { shouldDirty: true, shouldValidate: true });
    setValue("endsAt", "", { shouldDirty: true, shouldValidate: true });
  }

  const summary = mounted
    ? getScheduleSummary({ enabled, startsAt, endsAt }, new Date())
    : null;
  const hasSchedule = Boolean(startsAt || endsAt);
  const messageLength = (message ?? "").trim().length;

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      noValidate
      className="flex max-w-3xl flex-col gap-6"
    >
      <AnnouncementPreview
        enabled={Boolean(enabled)}
        message={message}
        href={href}
        linkLabel={linkLabel}
      />

      <section
        aria-labelledby="announcement-content-title"
        className="rounded-xl border border-border bg-card p-4 sm:p-6"
      >
        <div className="mb-5 flex flex-col gap-1">
          <h2
            id="announcement-content-title"
            className="text-base font-semibold tracking-tight"
          >
            Content
          </h2>
          <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
            A short message shown at the top of your public site. Use it for
            offers, availability, or important news.
          </p>
        </div>

        <FieldGroup>
          <SwitchField
            control={control}
            name="enabled"
            label="Show announcement bar"
            description="Turn this off to hide the bar without losing your text."
          />
          <TextField
            control={control}
            name="message"
            label="Message"
            description={`${messageLength} characters. Keep it short so it stays on one or two lines on phones.`}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              control={control}
              name="href"
              label="Link (optional)"
              description="Use a page path like /pricing or a full URL like https://…"
            />
            <TextField
              control={control}
              name="linkLabel"
              label="Link label (optional)"
              description="Defaults to “Learn more” in the preview when empty."
            />
          </div>
        </FieldGroup>
      </section>

      <section
        aria-labelledby="announcement-schedule-title"
        className="rounded-xl border border-border bg-card p-4 sm:p-6"
      >
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2
              id="announcement-schedule-title"
              className="text-base font-semibold tracking-tight"
            >
              Schedule
            </h2>
            <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
              Optional. Leave both empty to show the bar whenever it is turned
              on.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearSchedule}
            disabled={!hasSchedule}
          >
            Clear schedule
          </Button>
        </div>

        <FieldGroup>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              control={control}
              name="startsAt"
              label="Starts (optional)"
              type="datetime-local"
              description="Shown in your local time."
            />
            <TextField
              control={control}
              name="endsAt"
              label="Ends (optional)"
              type="datetime-local"
              description="The bar hides itself after this time."
            />
          </div>

          <div
            role="status"
            aria-live="polite"
            className={cn(
              "min-h-11 rounded-lg border px-3 py-2.5 text-sm leading-relaxed",
              summary ? summaryStyles[summary.tone] : "border-transparent",
            )}
          >
            {summary?.text}
          </div>
        </FieldGroup>
      </section>

      <FormError message={submitError} />

      {/* Action bar */}
      <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/85">
        <p
          role="status"
          aria-live="polite"
          className="text-sm text-muted-foreground"
        >
          {isDirty ? (
            <span className="font-medium text-foreground">
              You have unsaved changes
            </span>
          ) : (
            "All changes saved"
          )}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            disabled={!isDirty || isSubmitting}
            onClick={() => reset()}
          >
            Discard changes
          </Button>
          <Button type="submit" size="lg" disabled={!isDirty || isSubmitting}>
            {isSubmitting ? "Saving…" : "Save announcement"}
          </Button>
        </div>
      </div>
    </form>
  );
}
