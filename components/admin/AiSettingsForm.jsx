"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  SwitchField,
  TextField,
  TextareaField,
} from "@/components/forms/shared/fields";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { createResolver } from "@/lib/admin/form-payload";
import { cn } from "@/lib/utils/cn";
import { sendJson } from "@/lib/utils/submit-form";
import { aiSettingsSchema } from "@/lib/validations/ai.schema";

const fromLines = (value) =>
  String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const buildPayload = (v) => ({
  enabled: v.enabled,
  name: v.name,
  welcomeMessage: v.welcomeMessage,
  tone: v.tone,
  languages: fromLines(v.languages),
  suggestedPrompts: fromLines(v.suggestedPrompts),
  qualificationQuestions: fromLines(v.qualificationQuestions),
  pricingGuidance: v.pricingGuidance,
  handoffMessage: v.handoffMessage,
  extraInstructions: v.extraInstructions,
  perIpPer10Min: Number(v.perIpPer10Min),
  perSessionPerHour: Number(v.perSessionPerHour),
  dailyMessages: Number(v.dailyMessages),
  storeConversations: v.storeConversations,
  retentionDays: Number(v.retentionDays),
});

/* -------------------------------------------------------------------------- */
/*  Layout pieces                                                             */
/* -------------------------------------------------------------------------- */

function Section({ id, title, description, children }) {
  return (
    <section
      aria-labelledby={`${id}-title`}
      className="rounded-xl border border-border bg-card p-4 sm:p-6"
    >
      <div className="mb-5 flex flex-col gap-1">
        <h2
          id={`${id}-title`}
          className="text-base font-semibold tracking-tight"
        >
          {title}
        </h2>
        {description ? (
          <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <FieldGroup>{children}</FieldGroup>
    </section>
  );
}

function StatusBanner({ settings }) {
  const live = Boolean(settings.enabled);

  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-border bg-card px-4 py-3"
    >
      <span className="flex items-center gap-2 text-sm font-medium">
        <span
          aria-hidden="true"
          className={cn(
            "h-2.5 w-2.5 rounded-full",
            live ? "bg-primary" : "bg-muted-foreground/40",
          )}
        />
        {live ? "Assistant is live on your site" : "Assistant is turned off"}
      </span>
      <span className="text-sm text-muted-foreground">
        {live
          ? "Visitors can see the chat widget right now."
          : "The chat widget is hidden from visitors."}
      </span>
      {settings.version !== undefined && settings.version !== null ? (
        <span className="text-sm text-muted-foreground sm:ml-auto">
          Current version {settings.version}
        </span>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Form                                                                      */
/* -------------------------------------------------------------------------- */

export function AiSettingsForm({ settings }) {
  const router = useRouter();
  const [pending, setPending] = useState(null); // validated values, waiting for confirmation
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm({
    resolver: createResolver(aiSettingsSchema, buildPayload),
    defaultValues: {
      enabled: settings.enabled,
      name: settings.name,
      welcomeMessage: settings.welcomeMessage,
      tone: settings.tone,
      languages: settings.languages.join("\n"),
      suggestedPrompts: settings.suggestedPrompts.join("\n"),
      qualificationQuestions: settings.qualificationQuestions.join("\n"),
      pricingGuidance: settings.pricingGuidance,
      handoffMessage: settings.handoffMessage,
      extraInstructions: settings.extraInstructions,
      perIpPer10Min: String(settings.perIpPer10Min),
      perSessionPerHour: String(settings.perSessionPerHour),
      dailyMessages: String(settings.dailyMessages),
      storeConversations: settings.storeConversations,
      retentionDays: String(settings.retentionDays),
    },
  });

  const storeConversations = useWatch({ control, name: "storeConversations" });

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

  async function confirmSave() {
    const savedValues = pending;
    setSaving(true);
    try {
      const result = await sendJson(
        "PUT",
        "/api/admin/ai/settings",
        buildPayload(savedValues),
      );
      toast.success(`Saved as version ${result.version}`);
      reset(savedValues); // the saved values become the new baseline
      setPending(null);
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  function onInvalid() {
    toast.error(
      "Some fields need attention. Check the highlighted fields and try again.",
    );
  }

  const confirmDescription = pending?.enabled
    ? "These changes take effect immediately. They change the assistant's answers, usage limits, and privacy behavior, and visitors will see the chat widget on your site."
    : "These changes take effect immediately. They change the assistant's answers, usage limits, and privacy behavior. The assistant is turned off, so visitors will not see the chat widget.";

  return (
    <>
      <form
        onSubmit={handleSubmit((values) => setPending(values), onInvalid)}
        noValidate
        className="flex max-w-3xl flex-col gap-6"
      >
        <StatusBanner settings={settings} />

        <Section
          id="availability"
          title="Availability"
          description="Choose whether visitors can chat with the assistant on your public site."
        >
          <SwitchField
            control={control}
            name="enabled"
            label="Enable the public AI assistant"
            description="When this is off, the chat widget is hidden from your public site."
          />
        </Section>

        <Section
          id="identity"
          title="Identity and tone"
          description="How the assistant introduces itself and the way it speaks to visitors."
        >
          <TextField control={control} name="name" label="Assistant name" />
          <TextareaField
            control={control}
            name="welcomeMessage"
            label="Welcome message"
            rows={2}
            description="The first message visitors see when they open the chat."
          />
          <TextField
            control={control}
            name="tone"
            label="Business tone"
            description="For example: friendly, clear, and professional."
          />
          <TextareaField
            control={control}
            name="languages"
            label="Supported languages"
            rows={3}
            description="One per line."
          />
        </Section>

        <Section
          id="conversation"
          title="Conversation flow"
          description="What the assistant suggests, what it asks, and how it passes visitors to you."
        >
          <TextareaField
            control={control}
            name="suggestedPrompts"
            label="Suggested prompts"
            rows={5}
            description="Quick questions shown to visitors. One per line."
          />
          <TextareaField
            control={control}
            name="qualificationQuestions"
            label="Lead qualification topics"
            rows={6}
            description="One per line. The assistant asks about these naturally, one at a time."
          />
          <TextareaField
            control={control}
            name="handoffMessage"
            label="Human handoff message"
            rows={2}
            description="Shown when a visitor should talk to you directly."
          />
        </Section>

        <Section
          id="rules"
          title="Business rules"
          description="Guidance that keeps answers accurate and consistent with what you publish."
        >
          <TextareaField
            control={control}
            name="pricingGuidance"
            label="Pricing guidance (optional)"
            rows={3}
            description="Only rules that match your published prices. The assistant does not invent new prices from this field."
          />
          <TextareaField
            control={control}
            name="extraInstructions"
            label="Extra instructions (advanced, optional)"
            rows={4}
            description="Additional directions for the assistant. Keep them short and specific, then test them in the AI playground."
          />
        </Section>

        <Section
          id="limits"
          title="Usage limits"
          description="Protect your service from spam and control how many messages the assistant can handle."
        >
          <div className="grid gap-5 sm:grid-cols-3">
            <TextField
              control={control}
              name="perIpPer10Min"
              label="Per IP / 10 min"
              type="number"
              description="Messages from one IP address."
            />
            <TextField
              control={control}
              name="perSessionPerHour"
              label="Per session / hour"
              type="number"
              description="Messages in one chat session."
            />
            <TextField
              control={control}
              name="dailyMessages"
              label="Daily message cap"
              type="number"
              description="Total messages across all visitors."
            />
          </div>
        </Section>

        <Section
          id="privacy"
          title="Privacy and retention"
          description="Decide whether chats are saved and how long they are kept."
        >
          <SwitchField
            control={control}
            name="storeConversations"
            label="Store chat conversations"
            description="Off by default. When on, the chat widget's privacy notice tells visitors their conversations are stored."
          />
          <TextField
            control={control}
            name="retentionDays"
            label="Retention (days)"
            type="number"
            description={
              storeConversations
                ? "To delete old conversations automatically, add a Firestore TTL policy (see the setup guide)."
                : "Only applies when chat storage is on. To delete old conversations automatically, add a Firestore TTL policy (see the setup guide)."
            }
          />
        </Section>

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
              disabled={!isDirty || saving}
              onClick={() => reset()}
            >
              Discard changes
            </Button>
            <Button type="submit" size="lg" disabled={!isDirty || saving}>
              Review and save
            </Button>
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
        title="Save AI settings?"
        description={confirmDescription}
        confirmLabel="Save settings"
        pending={saving}
        onConfirm={confirmSave}
      />
    </>
  );
}
