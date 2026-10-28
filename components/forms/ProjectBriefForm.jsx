"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Send,
} from "lucide-react";
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

/** Fields that tell whether an in-progress brief should be saved. */
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

const STEPS = [
  {
    title: "Project type",
    fields: ["businessType", "service"],
  },
  {
    title: "Scope and features",
    fields: ["description"],
  },
  {
    title: "Budget and timeline",
    fields: ["budget", "timeline"],
  },
  {
    title: "Contact details",
    fields: ["name", "email", "contactMethod", "consent"],
  },
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

function StepProgress({ step }) {
  const percent = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-foreground">
          Step {step + 1} of {STEPS.length}: {STEPS[step].title}
        </span>
        <span className="text-muted-foreground">
          {percent}% through
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Project brief progress"
        aria-valuemin={1}
        aria-valuemax={STEPS.length}
        aria-valuenow={step + 1}
        aria-valuetext={`Step ${step + 1} of ${STEPS.length}: ${STEPS[step].title}`}
        className="h-1.5 w-full overflow-hidden rounded-full bg-border/70"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${percent}%` }}
        />
      </div>
      <ol aria-label="Project brief steps" className="sr-only">
        {STEPS.map((item, index) => (
          <li key={item.title} aria-current={index === step ? "step" : undefined}>
            {index + 1}. {item.title}
          </li>
        ))}
      </ol>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Form                                                                      */
/* -------------------------------------------------------------------------- */

export function ProjectBriefForm({
  defaultService = "",
  defaultPlan = "",
  defaultFeatures = "",
}) {
  const [submitError, setSubmitError] = useState("");
  const [reference, setReference] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [restored, setRestored] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  // One submissionId is sent on every retry so a double send cannot create duplicate inquiries.
  const [submissionId, setSubmissionId] = useState(() => crypto.randomUUID());
  const errorRef = useRef(null);
  const stepHeadingRef = useRef(null);
  const stepValidationRef = useRef(false);
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
    features: defaultFeatures,
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
    trigger,
    formState: { isSubmitting, errors },
  } = useForm({ resolver: zodResolver(projectBriefSchema), defaultValues });

  const values = useWatch({ control });

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
        features: defaultFeatures || draft.features || "",
        consent: false,
        companyUrl: "",
      });
      // Restored state is only known after reading sessionStorage on mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
    const invalidStep = STEPS.findIndex((step) =>
      step.fields.some((name) => fieldErrors[name]),
    );
    if (invalidStep >= 0) {
      setCurrentStep(invalidStep);
      requestAnimationFrame(() => stepHeadingRef.current?.focus());
    }
    const labels = Object.keys(fieldErrors).map(
      (name) => FIELD_LABELS[name] ?? name,
    );
    toast.error(
      labels.length > 0
        ? `Please check: ${labels.join(", ")}.`
        : "Some fields need attention. Check the highlighted fields and try again.",
    );
  }

  async function goToNextStep() {
    if (stepValidationRef.current || isSubmitting) return;
    stepValidationRef.current = true;

    try {
      const isValid = await trigger(STEPS[currentStep].fields, {
        shouldFocus: true,
      });
      if (!isValid) return;

      setCurrentStep((step) => Math.min(step + 1, STEPS.length - 1));
      requestAnimationFrame(() => stepHeadingRef.current?.focus());
    } finally {
      stepValidationRef.current = false;
    }
  }

  function onFormSubmit(event) {
    event.preventDefault();
    if (currentStep < STEPS.length - 1) {
      goToNextStep();
      return;
    }
    handleSubmit(onSubmit, onInvalid)();
  }

  function goToPreviousStep() {
    setCurrentStep((step) => Math.max(step - 1, 0));
    requestAnimationFrame(() => stepHeadingRef.current?.focus());
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
    setCurrentStep(0);
  }

  function sendAnother() {
    // A new brief needs a new id, or the server would treat it as a duplicate of the last one.
    setSubmissionId(crypto.randomUUID());
    setReference(null);
    setSubmitError("");
    setSubmitted(false);
    setCurrentStep(0);
  }

  if (submitted) {
    return (
      <Card
        role="status"
        aria-live="polite"
        className="gap-0 rounded-2xl border-success/35 shadow-sm"
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-title">
            <CheckCircle2 aria-hidden="true" className="size-5 text-success" />
            Your project brief was submitted.
          </CardTitle>
          <CardDescription className="leading-relaxed">
            Thank you. I will review the details and reply using your preferred
            contact method.
          </CardDescription>
          {reference ? (
            <p className="text-sm text-muted-foreground">
              Reference: <span className="font-mono">{reference}</span>
            </p>
          ) : null}
        </CardHeader>
        <CardContent>
          <section aria-labelledby="brief-next-title">
            <h3 id="brief-next-title" className="text-sm font-semibold">
              What happens next
            </h3>
            <ol className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                "I review your brief.",
                "I may contact you with clarifying questions.",
                "We discuss scope and a written proposal.",
              ].map((step, index) => (
                <li
                  key={step}
                  className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/30 p-3 text-sm leading-6"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
                  >
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </section>
        </CardContent>
        <CardFooter className="border-t border-border/70 pt-5">
          <Button type="button" variant="outline" onClick={sendAnother}>
            Submit another brief
          </Button>
        </CardFooter>
      </Card>
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

        <StepProgress step={currentStep} />
      </CardHeader>

      <form
        onSubmit={onFormSubmit}
        onKeyDown={onKeyDown}
        noValidate
        aria-busy={isSubmitting}
        className="relative"
      >
        <CardContent className="gap-6">
          {restored ? (
            <div
              role="status"
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/40 px-3.5 py-3 text-sm"
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

          <input type="hidden" {...register("planSlug")} />
          <HoneypotField register={register} />

          <section aria-labelledby="current-step-title">
            <h3
              id="current-step-title"
              ref={stepHeadingRef}
              tabIndex={-1}
              className="mb-5 text-base font-semibold tracking-tight outline-none"
            >
              Step {currentStep + 1}: {STEPS[currentStep].title}
            </h3>

            {currentStep === 0 ? (
              <FormSection
                step={1}
                title="Project type"
                description="Choose the closest service and tell me what kind of business or project this is."
              >
                <FieldGroup>
                  <TextField
                    control={control}
                    name="businessType"
                    label="Business or project type"
                    description="e.g. restaurant, clinic, online store"
                  />
                  <SelectField
                    control={control}
                    name="service"
                    label="Project type"
                    options={serviceCategoryOptions}
                    placeholder="Choose a service"
                  />
                </FieldGroup>
              </FormSection>
            ) : null}

            {currentStep === 1 ? (
              <FormSection
                step={2}
                title="Scope and features"
                description="Describe what you want to build and how it should help."
              >
                <FieldGroup>
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
            ) : null}

            {currentStep === 2 ? (
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
            ) : null}

            {currentStep === 3 ? (
              <FormSection
                step={4}
                title="Contact details"
                description="Tell me where to send a reply."
              >
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
                  <CheckboxField
                    control={control}
                    name="consent"
                    label="I agree to share these details so I can be contacted about my project."
                  />
                  {hasHiddenFieldError ? (
                    <FormError message="Something went wrong with this form. Please reload the page and try again." />
                  ) : null}
                </FieldGroup>
              </FormSection>
            ) : null}
          </section>
        </CardContent>

        <CardFooter className="flex-col items-stretch gap-4 border-t border-border/70 pt-5">
          <div ref={errorRef}>
            <FormError message={submitError} />
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              {currentStep > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToPreviousStep}
                  className="gap-2"
                >
                  <ArrowLeft aria-hidden="true" className="size-4" />
                  Back
                </Button>
              ) : null}
            </div>

            {currentStep < STEPS.length - 1 ? (
              <Button
                type="button"
                size="lg"
                onClick={goToNextStep}
                className="gap-2"
              >
                Continue
                <ArrowRight aria-hidden="true" className="size-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="gap-2"
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
            )}
          </div>
          <p className="text-xs leading-5 text-muted-foreground sm:text-right">
            Your details are only used to reply to your brief. Press Ctrl or ⌘ +
            Enter to submit. See the{" "}
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
        </CardFooter>
      </form>
    </Card>
  );
}
