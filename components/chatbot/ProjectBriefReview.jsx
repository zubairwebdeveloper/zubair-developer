"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiAlertTriangle, FiArrowLeft, FiLoader, FiSend } from "react-icons/fi";

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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import {
  budgetOptions,
  contactMethodOptions,
  serviceCategoryOptions,
  timelineOptions,
} from "@/constants/options";
import { formatEstimate } from "@/lib/ai/pricing-estimator";
import { postJson } from "@/lib/utils/submit-form";
import { aiLeadSchema } from "@/lib/validations/ai.schema";

const formSchema = aiLeadSchema.omit({ transcript: true });

const sectionCardClass = "gap-4 rounded-xl py-4 shadow-none";
const sectionHeaderClass = "gap-0.5 px-4";
const sectionContentClass = "px-4";

export function ProjectBriefReview({
  initial,
  estimate,
  notice,
  transcript,
  onBack,
  onSubmitted,
}) {
  const [submitError, setSubmitError] = useState("");
  // Ek hi submissionId har retry par jata hai taake duplicate lead na bane.
  const [submissionId] = useState(() => crypto.randomUUID());

  const {
    control,
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      businessType: initial.businessType ?? "",
      service: initial.service ?? "",
      planSlug: initial.planSlug ?? "",
      description: initial.description ?? "",
      features: initial.features ?? "",
      budget: initial.budget ?? "",
      timeline: initial.timeline ?? "",
      existingWebsite: initial.existingWebsite ?? "",
      contactMethod: initial.contactMethod ?? "",
      referenceLinks: "",
      consent: false,
      shareChatSummary: false,
      companyUrl: "",
    },
  });

  async function onSubmit(values) {
    setSubmitError("");
    try {
      const result = await postJson("/api/ai/lead", {
        ...values,
        submissionId,
        transcript: values.shareChatSummary ? transcript : undefined,
      });
      onSubmitted(result.reference ?? null);
    } catch (error) {
      setSubmitError(error.message);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-busy={isSubmitting}
      className="flex flex-col gap-4"
    >
      <div className="space-y-1.5">
        <h3 className="text-card-title">Review your project brief</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Check and edit everything. Nothing is sent until you submit.
        </p>
        {notice ? (
          <p
            role="status"
            className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning"
          >
            <FiAlertTriangle
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0"
            />
            <span>{notice}</span>
          </p>
        ) : null}
      </div>

      {estimate ? (
        <Card className="gap-1.5 rounded-xl border-primary/30 bg-primary/5 py-4 shadow-none">
          <CardHeader className="gap-0 px-4">
            <CardTitle className="text-sm font-semibold">
              Preliminary estimate: {formatEstimate(estimate)}
            </CardTitle>
          </CardHeader>
          <CardContent className={sectionContentClass}>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {estimate.disclaimer}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card className={sectionCardClass}>
        <CardHeader className={sectionHeaderClass}>
          <CardTitle className="text-sm">About you</CardTitle>
          <CardDescription className="text-xs">
            So I know who to reply to.
          </CardDescription>
        </CardHeader>
        <CardContent className={sectionContentClass}>
          <FieldGroup>
            <TextField
              control={control}
              name="name"
              label="Your name"
              autoComplete="name"
            />
            <TextField
              control={control}
              name="email"
              label="Email"
              type="email"
              autoComplete="email"
            />
            <SelectField
              control={control}
              name="contactMethod"
              label="Preferred contact method"
              options={contactMethodOptions}
              placeholder="Choose a method"
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card className={sectionCardClass}>
        <CardHeader className={sectionHeaderClass}>
          <CardTitle className="text-sm">Your project</CardTitle>
          <CardDescription className="text-xs">
            What you want built and how.
          </CardDescription>
        </CardHeader>
        <CardContent className={sectionContentClass}>
          <FieldGroup>
            <TextField
              control={control}
              name="businessType"
              label="Business type"
            />
            <SelectField
              control={control}
              name="service"
              label="Service needed"
              options={serviceCategoryOptions}
              placeholder="Choose a service"
            />
            <TextareaField
              control={control}
              name="description"
              label="Project description"
              rows={4}
            />
            <TextareaField
              control={control}
              name="features"
              label="Required features (optional)"
              rows={2}
            />
            <TextField
              control={control}
              name="existingWebsite"
              label="Existing website (optional)"
              placeholder="https://"
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card className={sectionCardClass}>
        <CardHeader className={sectionHeaderClass}>
          <CardTitle className="text-sm">Budget and timeline</CardTitle>
        </CardHeader>
        <CardContent className={sectionContentClass}>
          <FieldGroup>
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
          </FieldGroup>
        </CardContent>
      </Card>

      <Card className={sectionCardClass}>
        <CardHeader className={sectionHeaderClass}>
          <CardTitle className="text-sm">Consent</CardTitle>
        </CardHeader>
        <CardContent className={sectionContentClass}>
          <FieldGroup>
            <CheckboxField
              control={control}
              name="shareChatSummary"
              label="Include a short AI summary of our chat for the owner (optional)."
            />
            <CheckboxField
              control={control}
              name="consent"
              label="I agree to share these details so I can be contacted about my project."
            />
            <HoneypotField register={register} />
          </FieldGroup>
        </CardContent>
      </Card>

      <FormError message={submitError} />

      <div className="sticky -bottom-4 -mx-4 -mb-4 flex flex-col-reverse gap-2 border-t border-border bg-card px-4 py-3 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
        >
          <FiArrowLeft aria-hidden="true" />
          Back to chat
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <FiLoader
              aria-hidden="true"
              className="animate-spin motion-reduce:animate-none"
            />
          ) : (
            <FiSend aria-hidden="true" />
          )}
          {isSubmitting ? "Submitting…" : "Submit brief"}
        </Button>
      </div>
    </form>
  );
}
