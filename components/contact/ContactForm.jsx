"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Copy, Loader2, Mail, Send } from "lucide-react";
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { siteConfig } from "@/config/site";
import { serviceCategoryOptions } from "@/constants/options";
import { cn } from "@/lib/utils/cn";
import { postJson } from "@/lib/utils/submit-form";
import { contactSchema } from "@/lib/validations/contact.schema";

const MESSAGE_LIMIT = 2000;

const defaultValues = {
  name: "",
  email: "",
  company: "",
  subject: "",
  service: "",
  message: "",
  consent: false,
  companyUrl: "",
};

/** The process described here should match how you actually work. Edit freely. */
const nextSteps = [
  "You send the details of your project.",
  "I read them and reply to your email.",
  "We talk through scope and the best next step.",
];

const helpfulDetails = [
  "What you want to build or fix",
  "Who it is for and what success looks like",
  "Your timeline, and a budget range if you have one",
  "Links to anything relevant, such as a current site",
];

/** Matches the brand positioning. */
const expertise = [
  "Full stack web development",
  "SaaS solutions",
  "AI chatbot automation",
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/* -------------------------------------------------------------------------- */
/*  Supporting panel                                                          */
/* -------------------------------------------------------------------------- */

function CopyEmail({ email }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy the email. Select it and copy it manually.");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={`mailto:${email}`}
        className={cn(
          "inline-flex items-center gap-2 rounded-md text-sm font-medium text-foreground underline-offset-4 hover:underline",
          focusRing,
        )}
      >
        <Mail aria-hidden="true" className="size-4 text-primary" />
        <span className="break-all">{email}</span>
      </a>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={copy}
        className="h-8 gap-1.5 px-2 text-muted-foreground"
      >
        {copied ? (
          <Check aria-hidden="true" className="size-3.5" />
        ) : (
          <Copy aria-hidden="true" className="size-3.5" />
        )}
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}

function ContactAside({ email }) {
  return (
    <aside
      aria-label="About your enquiry"
      className="flex flex-col gap-7 rounded-2xl border border-border/60 bg-muted/30 p-6 lg:sticky lg:top-24"
    >
      <section
        aria-labelledby="contact-next-steps"
        className="flex flex-col gap-3"
      >
        <h3
          id="contact-next-steps"
          className="text-base font-semibold tracking-tight"
        >
          What happens next
        </h3>
        <ol className="flex flex-col gap-3">
          {nextSteps.map((step, index) => (
            <li key={step} className="flex items-start gap-3 text-sm leading-6">
              <span
                aria-hidden="true"
                className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary ring-1 ring-primary/20"
              >
                {index + 1}
              </span>
              <span className="text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="contact-details"
        className="flex flex-col gap-3"
      >
        <h3
          id="contact-details"
          className="text-base font-semibold tracking-tight"
        >
          Helpful details to include
        </h3>
        <ul className="flex flex-col gap-2">
          {helpfulDetails.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2.5 text-sm leading-6"
            >
              <Check
                aria-hidden="true"
                className="mt-1 size-3.5 shrink-0 text-primary"
              />
              <span className="text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="contact-expertise"
        className="flex flex-col gap-3"
      >
        <h3
          id="contact-expertise"
          className="text-base font-semibold tracking-tight"
        >
          I can help with
        </h3>
        <ul className="flex flex-wrap gap-2">
          {expertise.map((item) => (
            <li
              key={item}
              className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      {email ? (
        <section
          aria-labelledby="contact-direct"
          className="flex flex-col gap-2 border-t border-border/60 pt-5"
        >
          <h3 id="contact-direct" className="text-sm font-semibold">
            Prefer email?
          </h3>
          <CopyEmail email={email} />
        </section>
      ) : null}
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/*  Form                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * ContactForm
 *
 * @param {boolean} [showAside]  Shows the "what happens next" panel beside the form.
 *   Set to false if the page already has its own contact information next to the form.
 */
export function ContactForm({ showAside = true }) {
  const [submitError, setSubmitError] = useState("");
  const [reference, setReference] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  // One submissionId is sent on every retry so a double send cannot create duplicate messages.
  const [submissionId, setSubmissionId] = useState(() => crypto.randomUUID());
  const errorRef = useRef(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm({ resolver: zodResolver(contactSchema), defaultValues });

  const message = useWatch({ control, name: "message" }) ?? "";
  const contactEmail =
    siteConfig?.contactEmail ??
    siteConfig?.contact?.email ??
    siteConfig?.email ??
    null;

  // Warn before leaving with a half-written message.
  useEffect(() => {
    if (!isDirty || submitted) return undefined;
    const onBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty, submitted]);

  // Bring a send error into view so it is not missed on small screens.
  useEffect(() => {
    if (submitError) errorRef.current?.scrollIntoView({ block: "nearest" });
  }, [submitError]);

  async function onSubmit(values) {
    setSubmitError("");
    try {
      const result = await postJson("/api/contact", {
        ...values,
        submissionId,
      });
      setReference(result.reference ?? null);
      reset(defaultValues);
      setSubmitted(true);
      toast.success("Message sent");
    } catch (error) {
      // The values stay in the form so the person does not have to type again.
      setSubmitError(error.message);
    }
  }

  function onInvalid() {
    toast.error(
      "Some fields need attention. Check the highlighted fields and try again.",
    );
  }

  // Ctrl or Cmd + Enter sends the message from any field.
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

  function sendAnother() {
    // A new message needs a new id, or the server would treat it as a duplicate of the last one.
    setSubmissionId(crypto.randomUUID());
    setReference(null);
    setSubmitError("");
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <Card className="gap-0 rounded-2xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-card-title">Message received</CardTitle>
        </CardHeader>
        <CardContent>
          <FormSuccess
            title="Thank you, your message was received."
            description="I will review it and reply to the email address you provided."
            reference={reference}
          />
        </CardContent>
        <CardFooter className="border-t border-border/70 pt-5">
          <Button type="button" variant="outline" onClick={sendAnother}>
            Send another message
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const card = (
    <Card className="gap-6 rounded-2xl border-border/60 shadow-sm">
      <CardHeader className="gap-1.5">
        <CardTitle className="text-card-title tracking-tight">
          Discuss your project
        </CardTitle>
        <CardDescription className="leading-relaxed">
          Tell me what you want to build or fix. The more context you share, the
          more useful my reply will be.
        </CardDescription>
      </CardHeader>

      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        onKeyDown={onKeyDown}
        noValidate
        aria-busy={isSubmitting}
        className="relative"
      >
        <CardContent>
          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                control={control}
                name="name"
                label="Full name"
                autoComplete="name"
              />
              <TextField
                control={control}
                name="email"
                label="Email"
                type="email"
                autoComplete="email"
                description="Your reply will be sent here."
              />
            </div>
            <TextField
              control={control}
              name="company"
              label="Company (optional)"
              autoComplete="organization"
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField control={control} name="subject" label="Subject" />
              <SelectField
                control={control}
                name="service"
                label="Category"
                options={serviceCategoryOptions}
                placeholder="Choose a category"
              />
            </div>
            <TextareaField
              control={control}
              name="message"
              label="Message"
              description={`${message.length} of ${MESSAGE_LIMIT} characters. Press Ctrl or ⌘ + Enter to send.`}
            />
            <CheckboxField
              control={control}
              name="consent"
              label="I agree that my details may be used to respond to this enquiry."
            />
            <HoneypotField register={register} />
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-4 border-t border-border/70 pt-5">
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
              {isSubmitting ? "Sending…" : "Send message"}
            </Button>

            <p className="text-xs leading-5 text-muted-foreground sm:max-w-[16rem] sm:text-right">
              Your details are only used to reply to you. See the{" "}
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
        </CardFooter>
      </form>
    </Card>
  );

  if (!showAside) return card;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-8">
      {/* Form first on phones, supporting details first on large screens */}
      <div className="order-2 lg:order-1">
        <ContactAside email={contactEmail} />
      </div>
      <div className="order-1 lg:order-2">{card}</div>
    </div>
  );
}
