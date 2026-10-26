"use client";

import { Loader2, Mail, MailCheck, Reply, Send, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { SwitchField, TextareaField } from "@/components/forms/shared/fields";
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
import { notificationPrefsSchema } from "@/lib/validations/settings.schema";

const MAX_RECIPIENTS = 5;

const buildPayload = (values) => ({
  autoReplyEnabled: values.autoReplyEnabled,
  autoReplyMessage: values.autoReplyMessage,
  emailEnabled: values.emailEnabled,
  onNewInquiry: values.onNewInquiry,
  onFollowUpDue: values.onFollowUpDue,
  recipients: String(values.recipients ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean),
});

function countRecipients(value) {
  return String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean).length;
}

function StatusPill({ active, activeLabel, inactiveLabel }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        active
          ? "border-primary/30 bg-primary/10 text-foreground"
          : "border-border bg-muted/40 text-muted-foreground",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          active ? "bg-primary" : "bg-muted-foreground/50",
        )}
      />
      {active ? activeLabel : inactiveLabel}
    </span>
  );
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

export function NotificationSettingsForm({ prefs, canTest }) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [testing, setTesting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm({
    resolver: createResolver(notificationPrefsSchema, buildPayload),
    defaultValues: {
      emailEnabled: prefs.emailEnabled,
      onNewInquiry: prefs.onNewInquiry,
      onFollowUpDue: prefs.onFollowUpDue,
      recipients: prefs.recipients.join("\n"),
      autoReplyEnabled: prefs.autoReplyEnabled,
      autoReplyMessage: prefs.autoReplyMessage,
    },
  });

  const [emailEnabled, recipients, autoReplyEnabled, autoReplyMessage] =
    useWatch({
      control,
      name: [
        "emailEnabled",
        "recipients",
        "autoReplyEnabled",
        "autoReplyMessage",
      ],
    });

  const recipientCount = countRecipients(recipients);
  const tooManyRecipients = recipientCount > MAX_RECIPIENTS;
  const busy = isSubmitting || testing;

  async function onSubmit(values) {
    setSubmitError("");
    try {
      await sendJson(
        "PUT",
        "/api/admin/notification-settings",
        buildPayload(values),
      );
      toast.success("Notification settings saved");
      // Saved values naya baseline ban jati hain, taake "unsaved" hat jaye.
      reset(values);
      router.refresh();
    } catch (error) {
      setSubmitError(error.message);
    }
  }

  async function onTest() {
    setTesting(true);
    try {
      await sendJson("POST", "/api/admin/notification-settings/test");
      toast.success(
        "The email provider accepted the test email. Check your inbox.",
      );
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setTesting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex max-w-2xl flex-col gap-6"
    >
      {/* 1. Email notifications */}
      <Card className="border-border/70">
        <SectionHeader
          icon={Mail}
          title="Email notifications"
          description="Choose which events send an email to you."
          aside={
            <StatusPill
              active={emailEnabled}
              activeLabel="On"
              inactiveLabel="Off"
            />
          }
        />
        <CardContent>
          <FieldGroup>
            <SwitchField
              control={control}
              name="emailEnabled"
              label="Send email notifications"
            />
            {/* Master switch off ho to neeche ke controls disabled ho jate hain */}
            <fieldset
              disabled={!emailEnabled}
              className={cn(
                "m-0 min-w-0 border-0 p-0 transition-opacity",
                !emailEnabled && "opacity-50",
              )}
            >
              <legend className="sr-only">Notification events</legend>
              <FieldGroup>
                <SwitchField
                  control={control}
                  name="onNewInquiry"
                  label="Email me about new inquiries and project briefs"
                />
                <SwitchField
                  control={control}
                  name="onFollowUpDue"
                  label="Email me a digest when follow-ups are due"
                />
              </FieldGroup>
            </fieldset>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* 2. Recipients */}
      <Card className="border-border/70">
        <SectionHeader
          icon={Users}
          title="Recipients"
          description="Who receives these notifications."
          aside={
            <span
              aria-live="polite"
              className={cn(
                "text-xs font-medium tabular-nums",
                tooManyRecipients
                  ? "text-destructive"
                  : "text-muted-foreground",
              )}
            >
              {recipientCount} / {MAX_RECIPIENTS}
            </span>
          }
        />
        <CardContent>
          <fieldset
            disabled={!emailEnabled}
            className={cn(
              "m-0 min-w-0 border-0 p-0 transition-opacity",
              !emailEnabled && "opacity-50",
            )}
          >
            <legend className="sr-only">Recipients</legend>
            <TextareaField
              control={control}
              name="recipients"
              label="Recipient emails"
              rows={3}
              description="One email per line (max 5). Leave empty to use ADMIN_NOTIFY_EMAILS."
            />
          </fieldset>
        </CardContent>
      </Card>

      {/* 3. Auto-reply */}
      <Card className="border-border/70">
        <SectionHeader
          icon={Reply}
          title="Visitor auto-reply"
          description="An optional confirmation email sent to people who contact you."
          aside={
            <StatusPill
              active={autoReplyEnabled}
              activeLabel="On"
              inactiveLabel="Off"
            />
          }
        />
        <CardContent>
          <FieldGroup>
            <SwitchField
              control={control}
              name="autoReplyEnabled"
              label="Send visitors an automatic confirmation email"
              description="Off by default. Anyone can type any email address into the form, so the email contains only the message below plus a reference, at most 2 per address per day. Redis is required in production."
            />
            <fieldset
              disabled={!autoReplyEnabled}
              className={cn(
                "m-0 min-w-0 border-0 p-0 transition-opacity",
                !autoReplyEnabled && "opacity-50",
              )}
            >
              <legend className="sr-only">Auto-reply message</legend>
              <TextareaField
                control={control}
                name="autoReplyMessage"
                label="Auto-reply message"
                rows={4}
                description={`The visitor's name or anything they typed never appears in this email. ${String(autoReplyMessage ?? "").length} characters.`}
              />
            </fieldset>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="border-border/70 bg-muted/20">
        <CardContent>
          <FieldGroup>
            <FormError message={submitError} />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="submit"
                size="lg"
                disabled={busy || !isDirty}
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
                  "Save notification settings"
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

              <Button
                type="button"
                size="lg"
                variant="outline"
                disabled={!canTest || busy || isDirty}
                aria-busy={testing}
                onClick={onTest}
                className="gap-2 sm:ml-auto"
              >
                {testing ? (
                  <>
                    <Loader2
                      className="size-4 motion-safe:animate-spin"
                      aria-hidden="true"
                    />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="size-4" aria-hidden="true" />
                    Send test email
                  </>
                )}
              </Button>
            </div>
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex-col items-start gap-1 text-sm text-muted-foreground">
          <p role="status" className="flex items-center gap-1.5">
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
          <p>The test email goes to the saved recipients, so save first.</p>
        </CardFooter>
      </Card>
    </form>
  );
}
