"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import {
  CheckboxField,
  HoneypotField,
  SelectField,
  TextField,
  TextareaField,
} from "@/components/forms/shared/fields";
import { FormError, FormSuccess } from "@/components/forms/shared/FormStatus";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import {
  budgetOptions,
  contactMethodOptions,
  getValues,
  serviceCategoryOptions,
  timelineOptions,
} from "@/constants/options";
import { cn } from "@/lib/utils/cn";
import { postJson } from "@/lib/utils/submit-form";
import { projectBriefSchema } from "@/lib/validations/inquiry.schema";

const DRAFT_KEY = "project-brief-draft";
const DRAFT_SAVE_DELAY_MS = 600;

/** Fields that tell you whether the brief is useful. They drive the progress meter. */
const KEY_FIELDS = [
  "name",
  "email",
  "contactMethod",
  "businessType",
  "service",
  "description",
  "budget",
  "timeline",
];

/** Never saved to the draft. */
const NOT_SAVED = ["consent", "companyUrl", "planSlug"];

/** Readable names used in the "please check" message. */
const FIELD_LABELS = {
  name: "Name",
  email: "Email",
  contactMethod: "Preferred contact method",
  businessType: "Business type",
  service: "Service needed",
  description: "Project description",
  features: "Required features",
  budget: "Budget range",
  timeline: "Timeline",
  existingWebsite: "Existing website",
  referenceLinks: "Reference links",
  consent: "Consent",
  planSlug: "Selected plan",
  companyUrl: "Spam check field",
};

/** Fields that have no visible input, so their errors need a message of their own. */
const HIDDEN_FIELDS = ["planSlug", "companyUrl"];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const hasText = (value) => String(value ?? "").trim().length > 0;

const humanizeSlug = (slug) =>
  String(slug)
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

/* The draft lives in sessionStorage, so it is cleared when the tab closes. */
function readDraft() {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function writeDraft(values) {
  try {
    const draft = Object.fromEntries(
      Object.entries(values).filter(([key]) => !NOT_SAVED.includes(key)),
    );
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Storage can be unavailable. The form still works without a saved draft.
  }
}

function clearDraft() {
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // Nothing to clear.
  }
}

/* -------------------------------------------------------------------------- */
/*  Pieces                                                                    */
/* -------------------------------------------------------------------------- */

function FormSection({ step, title, description, children }) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-5 border-0 p-0 not-first:border-t not-first:border-border/60 not-first:pt-6">
      <legend className="sr-only">{title}</legend>
      <div aria-hidden="true" className="flex items-start gap-3">
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary ring-1 ring-primary/20">
          {step}
        </span>
        <div className="space-y-0.5">
          <p className="text-sm font-semibold tracking-tight">{title}</p>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      {children}
    </fieldset>
  );
}

function ProgressMeter({ filled, total }) {
  const percent = Math.round((filled / total) * 100);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>Brief progress</span>
        <span className="tabular-nums">
          {filled} of {total} key details
        </span>
      </div>
      <div
        role="meter"
        aria-label="Brief progress"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={filled}
        className="h-1.5 w-full overflow-hidden rounded-full bg-border/70"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Form                                                                      */
/* -------------------------------------------------------------------------- */

export function ProjectBriefForm({ defaultService = "", defaultPlan = "" }) {
  const [submitError, setSubmitError] = useState("");
  const [reference, setReference] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [restored, setRestored] = useState(false);
  // One submissionId is sent on every retry so a double send cannot create duplicate inquiries.
  const [submissionId, setSubmissionId] = useState(() => crypto.randomUUID());
  const errorRef = useRef(null);
  const draftReady = useRef(false);

  // A value from the URL is only used when it is a valid option.
  const initialService = getValues(serviceCategoryOptions).includes(
    defaultService,
  )
    ? defaultService
    : "";

  const defaultValues = {
    name: "",
    email: "",
    businessType: "",
    service: initialService,
    planSlug: defaultPlan,
    description: "",
    features: "",
    budget: "",
    timeline: "",
    existingWebsite: "",
    contactMethod: "",
    referenceLinks: "",
    consent: false,
    companyUrl: "",
  };

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm({ resolver: zodResolver(projectBriefSchema), defaultValues });

  const values = useWatch({ control });

  const filled =
    KEY_FIELDS.filter((key) => hasText(values?.[key])).length +
    (values?.consent ? 1 : 0);
  const total = KEY_FIELDS.length + 1; // the key details plus consent
  const hasContent =
    KEY_FIELDS.some((key) => hasText(values?.[key])) ||
    hasText(values?.features) ||
    hasText(values?.existingWebsite) ||
    hasText(values?.referenceLinks);

  // Hidden fields have no input to highlight, so their errors are shown separately.
  const hasHiddenFieldError = HIDDEN_FIELDS.some((name) => errors[name]);

  // Bring back a draft from earlier in this tab, such as after an accidental refresh.
  useEffect(() => {
    const draft = readDraft();
    if (draft && Object.values(draft).some(hasText)) {
      reset({
        ...defaultValues,
        ...draft,
        // A valid service from the URL wins over the saved one.
        service: initialService || draft.service || "",
        planSlug: defaultPlan,
        consent: false,
        companyUrl: "",
      });
      setRestored(true);
    }
    draftReady.current = true;
    // Runs once when the form first appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save the draft shortly after typing stops.
  useEffect(() => {
    if (!draftReady.current || submitted || !values) return undefined;
    const timer = setTimeout(() => {
      if (hasContent) writeDraft(values);
    }, DRAFT_SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [values, hasContent, submitted]);

  // Warn before closing the tab with a brief in progress.
  useEffect(() => {
    if (!hasContent || submitted) return undefined;
    const onBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasContent, submitted]);

  // Bring a send error into view so it is not missed on small screens.
  useEffect(() => {
    if (submitError) errorRef.current?.scrollIntoView({ block: "nearest" });
  }, [submitError]);

  async function onSubmit(formValues) {
    setSubmitError("");
    try {
      const result = await postJson("/api/inquiries", {
        ...formValues,
        submissionId,
      });
      setReference(result.id ?? null);
      clearDraft();
      reset(defaultValues);
      setRestored(false);
      setSubmitted(true);
      toast.success("Project brief submitted");
    } catch (error) {
      // The values stay in the form so the person does not have to type again.
      setSubmitError(error.message);
    }
  }

  // Names the exact fields that failed, and logs the details for debugging.
  function onInvalid(fieldErrors) {
    console.error("[ProjectBriefForm] validation errors:", fieldErrors);
    const labels = Object.keys(fieldErrors).map(
      (name) => FIELD_LABELS[name] ?? name,
    );
    toast.error(
      labels.length > 0
        ? `Please check: ${labels.join(", ")}.`
        : "Some fields need attention. Check the highlighted fields and try again.",
    );
  }

  // Ctrl or Cmd + Enter submits from any field.
  function onKeyDown(event) {
    if (
      (event.metaKey || event.ctrlKey) &&
      event.key === "Enter" &&
      !isSubmitting
    ) {
      event.preventDefault();
      handleSubmit(onSubmit, onInvalid)();
    }
  }

  function startOver() {
    clearDraft();
    reset(defaultValues);
    setRestored(false);
    setSubmitError("");
  }

  function sendAnother() {
    // A new brief needs a new id, or the server would treat it as a duplicate of the last one.
    setSubmissionId(crypto.randomUUID());
    setReference(null);
    setSubmitError("");
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <FormSuccess
        title="Your project brief was submitted."
        description="Thank you. I will review it and reply using your preferred contact method."
        reference={reference}
      >
        <Button type="button" variant="outline" onClick={sendAnother}>
          Submit another brief
        </Button>
      </FormSuccess>
    );
  }

  return (
    <Card className="gap-6 rounded-2xl border-border/60 shadow-sm">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-1.5">
          <CardTitle className="text-card-title tracking-tight">
            Start your project
          </CardTitle>
          <CardDescription className="leading-relaxed">
            Tell me about your idea, budget, and timeline so I can reply with a
            clear next step.
          </CardDescription>
        </div>

        {defaultPlan ? (
          <p className="w-fit rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-foreground">
            Selected plan: {humanizeSlug(defaultPlan)}
          </p>
        ) : null}

        <ProgressMeter filled={filled} total={total} />
      </CardHeader>

      <CardContent>
        {restored ? (
          <div
            role="status"
            className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/40 px-3.5 py-3 text-sm"
          >
            <p className="text-muted-foreground">
              We restored the brief you were working on in this tab.
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={startOver}
              className={focusRing}
            >
              Start over
            </Button>
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          onKeyDown={onKeyDown}
          noValidate
          aria-busy={isSubmitting}
          className="relative flex flex-col gap-6"
        >
          <input type="hidden" {...register("planSlug")} />

          <FormSection step={1} title="About you">
            <FieldGroup>
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  control={control}
                  name="name"
                  label="Name"
                  autoComplete="name"
                />
                <TextField
                  control={control}
                  name="email"
                  label="Email"
                  type="email"
                  autoComplete="email"
                />
              </div>
              <SelectField
                control={control}
                name="contactMethod"
                label="Preferred contact method"
                options={contactMethodOptions}
                placeholder="Choose a method"
              />
            </FieldGroup>
          </FormSection>

          <FormSection
            step={2}
            title="Your project"
            description="What you want built and what it should achieve."
          >
            <FieldGroup>
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  control={control}
                  name="businessType"
                  label="Business type"
                  description="e.g. restaurant, clinic, online store"
                />
                <SelectField
                  control={control}
                  name="service"
                  label="Service needed"
                  options={serviceCategoryOptions}
                  placeholder="Choose a service"
                />
              </div>
              <TextareaField
                control={control}
                name="description"
                label="Project description"
                rows={6}
                description={`What do you want to build and what should it achieve? ${
                  (values?.description ?? "").length
                } characters so far.`}
              />
              <TextareaField
                control={control}
                name="features"
                label="Required features (optional)"
                rows={3}
                description="Pages, integrations, or tools you already know you need."
              />
            </FieldGroup>
          </FormSection>

          <FormSection
            step={3}
            title="Budget and timeline"
            description="A range is enough. It helps me suggest a realistic approach."
          >
            <FieldGroup>
              <div className="grid gap-5 sm:grid-cols-2">
                <SelectField
                  control={control}
                  name="budget"
                  label="Budget range"
                  options={budgetOptions}
                  placeholder="Choose a range"
                />
                <SelectField
                  control={control}
                  name="timeline"
                  label="Timeline"
                  options={timelineOptions}
                  placeholder="Choose a timeline"
                />
              </div>
            </FieldGroup>
          </FormSection>

          <FormSection step={4} title="References">
            <FieldGroup>
              <TextField
                control={control}
                name="existingWebsite"
                label="Existing website (optional)"
                type="url"
                placeholder="https://"
              />
              <TextareaField
                control={control}
                name="referenceLinks"
                label="Reference links (optional)"
                rows={2}
                description="Sites or examples you like."
              />
            </FieldGroup>
          </FormSection>

          <FormSection step={5} title="Consent">
            <FieldGroup>
              <CheckboxField
                control={control}
                name="consent"
                label="I agree to share these details so I can be contacted about my project."
              />
              <HoneypotField register={register} />

              {/* planSlug and companyUrl have no visible input to highlight. */}
              {hasHiddenFieldError ? (
                <FormError message="Something went wrong with this form. Please reload the page and try again." />
              ) : null}

              <div ref={errorRef}>
                <FormError message={submitError} />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full transition-all duration-200 enabled:hover:-translate-y-0.5 enabled:active:translate-y-0 motion-reduce:transition-none motion-reduce:enabled:hover:translate-y-0 sm:w-auto"
                >
                  {isSubmitting ? (
                    <Loader2
                      aria-hidden="true"
                      className="animate-spin motion-reduce:animate-none"
                    />
                  ) : (
                    <Send aria-hidden="true" />
                  )}
                  {isSubmitting ? "Submitting…" : "Submit project brief"}
                </Button>

                <p className="text-xs leading-5 text-muted-foreground sm:max-w-[16rem] sm:text-right">
                  Your details are only used to reply to your brief. Press Ctrl
                  or ⌘ + Enter to submit. See the{" "}
                  <Link
                    href="/privacy"
                    className={cn(
                      "rounded-sm font-medium text-foreground underline underline-offset-4 hover:text-primary",
                      focusRing,
                    )}
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </FieldGroup>
          </FormSection>
        </form>
      </CardContent>
    </Card>
  );
}
