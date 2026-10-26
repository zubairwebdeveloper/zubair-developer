"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Copy, RotateCcw } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

// Editable content: these are choices for the visitor, not claims about you.
const NEEDS = [
  {
    id: "website",
    label: "A website",
    description: "A fast, responsive site for my business.",
  },
  {
    id: "application",
    label: "A web application",
    description: "A SaaS product or a custom web app.",
  },
  {
    id: "automation",
    label: "AI automation",
    description: "A chatbot or an AI assistant for my website.",
  },
  {
    id: "unsure",
    label: "I'm not sure yet",
    description: "I have an idea and want to talk it through.",
  },
];

const FEATURES = [
  "User accounts and login",
  "Admin dashboard",
  "AI chatbot or assistant",
  "Online payments",
  "Blog or content pages",
  "Contact or quote forms",
  "Integration with existing tools",
];

const TIMELINES = [
  "As soon as possible",
  "Within a month",
  "In the next few months",
  "Flexible",
];

const STEPS = ["Project", "Details", "Your brief"];

const fieldClass =
  "min-h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm text-foreground transition-colors duration-200 placeholder:text-muted-foreground hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:pointer-events-none disabled:opacity-40 motion-safe:active:scale-[0.98]";

export function ProjectBriefBuilder() {
  const uid = useId();
  const reduceMotion = useReducedMotion();

  const [{ step, dir }, setNav] = useState({ step: 0, dir: 1 });
  const [need, setNeed] = useState("");
  const [features, setFeatures] = useState([]);
  const [timeline, setTimeline] = useState("");
  const [notes, setNotes] = useState("");
  const [copyStatus, setCopyStatus] = useState("idle"); // idle | copied | error

  const headingRef = useRef(null);
  const mounted = useRef(false);
  const timer = useRef(null);

  // Move focus to the new step's heading after the first interaction.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const goTo = (next) =>
    setNav((current) => {
      const target = Math.min(Math.max(next, 0), STEPS.length - 1);
      return target === current.step
        ? current
        : { step: target, dir: target > current.step ? 1 : -1 };
    });

  const toggleFeature = (feature) =>
    setFeatures((current) =>
      current.includes(feature)
        ? current.filter((item) => item !== feature)
        : [...current, feature],
    );

  const needLabel = NEEDS.find((item) => item.id === need)?.label ?? "";

  const briefText = [
    "Project brief",
    `Looking for: ${needLabel || "Not specified"}`,
    `Features: ${features.length > 0 ? features.join(", ") : "None selected"}`,
    `Timeline: ${timeline || "Not specified"}`,
    notes.trim() ? `Notes: ${notes.trim()}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(briefText);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopyStatus("idle"), 2400);
  };

  const reset = () => {
    setNeed("");
    setFeatures([]);
    setTimeline("");
    setNotes("");
    setCopyStatus("idle");
    goTo(0);
  };

  const variants = {
    enter: (d) => ({ opacity: 0, x: reduceMotion ? 0 : d * 36 }),
    center: { opacity: 1, x: 0 },
    exit: (d) => ({ opacity: 0, x: reduceMotion ? 0 : d * -36 }),
  };

  const transition = { duration: reduceMotion ? 0 : 0.26, ease: EASE };

  const optionCard =
    "flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-4 text-sm transition-colors duration-200 hover:border-primary/40 peer-checked:border-primary peer-checked:bg-primary/5 peer-focus-visible:ring-2 peer-focus-visible:ring-ring";

  return (
    <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Progress */}
      <div className="flex flex-col gap-3 border-b border-border p-5 sm:px-8">
        <ol className="flex items-center gap-2 text-xs font-medium">
          {STEPS.map((label, i) => (
            <li
              key={label}
              aria-current={i === step ? "step" : undefined}
              className={`flex items-center gap-2 ${
                i === step ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <span
                aria-hidden="true"
                className={`inline-flex size-6 items-center justify-center rounded-full text-[11px] ${
                  i < step
                    ? "bg-primary text-primary-foreground"
                    : i === step
                      ? "bg-primary/15 text-primary ring-1 ring-inset ring-primary/30"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="size-3" /> : i + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
              {i < STEPS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="hidden h-px w-6 bg-border sm:block"
                />
              ) : null}
            </li>
          ))}
        </ol>
        <div
          aria-hidden="true"
          className="h-1 overflow-hidden rounded-full bg-muted"
        >
          <motion.div
            className="h-full origin-left rounded-full bg-primary"
            initial={false}
            animate={{ scaleX: (step + 1) / STEPS.length }}
            transition={transition}
          />
        </div>
        <p className="sr-only" aria-live="polite">
          {`Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`}
        </p>
      </div>

      <div className="p-5 sm:p-8">
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            className="flex flex-col gap-6"
          >
            {step === 0 ? (
              <fieldset className="flex flex-col gap-4">
                <legend className="sr-only">What do you need?</legend>
                <h3
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-card-title text-foreground focus:outline-none"
                >
                  What do you need?
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {NEEDS.map((item) => (
                    <label key={item.id} className="relative block">
                      <input
                        type="radio"
                        name={`${uid}-need`}
                        value={item.id}
                        checked={need === item.id}
                        onChange={() => setNeed(item.id)}
                        className="peer sr-only"
                      />
                      <span className={optionCard}>
                        <span className="flex flex-col gap-1">
                          <span className="font-medium text-foreground">
                            {item.label}
                          </span>
                          <span className="text-muted-foreground">
                            {item.description}
                          </span>
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}

            {step === 1 ? (
              <div className="flex flex-col gap-6">
                <h3
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-card-title text-foreground focus:outline-none"
                >
                  A few details
                </h3>

                <fieldset className="flex flex-col gap-3">
                  <legend className="mb-1 text-sm font-medium text-foreground">
                    Features you have in mind (optional)
                  </legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {FEATURES.map((feature) => (
                      <label key={feature} className="relative block">
                        <input
                          type="checkbox"
                          checked={features.includes(feature)}
                          onChange={() => toggleFeature(feature)}
                          className="peer sr-only"
                        />
                        <span className={`${optionCard} min-h-12 items-center`}>
                          <span className="text-foreground">{feature}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor={`${uid}-timeline`}
                    className="text-sm font-medium text-foreground"
                  >
                    When would you like to start?
                  </label>
                  <select
                    id={`${uid}-timeline`}
                    value={timeline}
                    onChange={(event) => setTimeline(event.target.value)}
                    className={fieldClass}
                  >
                    <option value="">Not decided</option>
                    {TIMELINES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor={`${uid}-notes`}
                    className="text-sm font-medium text-foreground"
                  >
                    Anything else I should know? (optional)
                  </label>
                  <textarea
                    id={`${uid}-notes`}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={4}
                    maxLength={600}
                    placeholder="Your goals, existing website, who will use it..."
                    className={`${fieldClass} py-3`}
                  />
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="flex flex-col gap-5">
                <h3
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-card-title text-foreground focus:outline-none"
                >
                  Your project brief
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Copy this brief and include it when you request a quote. It
                  gives us a clear starting point for the written proposal.
                </p>

                <pre className="whitespace-pre-wrap break-words rounded-xl border border-border bg-muted/50 p-4 font-sans text-sm leading-relaxed text-foreground">
                  {briefText}
                </pre>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`${buttonBase} border border-border text-foreground hover:bg-muted`}
                  >
                    {copyStatus === "copied" ? (
                      <Check aria-hidden="true" className="size-4" />
                    ) : (
                      <Copy aria-hidden="true" className="size-4" />
                    )}
                    {copyStatus === "copied" ? "Brief copied" : "Copy brief"}
                  </button>
                  <Link
                    href="/hire-me"
                    className={`${buttonBase} bg-primary text-primary-foreground hover:opacity-90`}
                  >
                    Request a quote
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>

                <p
                  role="status"
                  aria-live="polite"
                  className="text-xs text-muted-foreground"
                >
                  {copyStatus === "copied" ? "Brief copied to clipboard." : ""}
                  {copyStatus === "error"
                    ? "Copying isn't available here. Select the text above and copy it manually."
                    : ""}
                </p>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-5">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => goTo(step - 1)}
              className={`${buttonBase} border border-border text-foreground hover:bg-muted`}
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              Back
            </button>
          ) : (
            <span aria-hidden="true" />
          )}

          {step < STEPS.length - 1 ? (
            <div className="flex flex-col items-end gap-1">
              <button
                type="button"
                onClick={() => goTo(step + 1)}
                disabled={step === 0 && !need}
                className={`${buttonBase} bg-primary text-primary-foreground hover:opacity-90`}
              >
                {step === 0 ? "Next" : "See my brief"}
                <ArrowRight aria-hidden="true" className="size-4" />
              </button>
              {step === 0 && !need ? (
                <p className="text-xs text-muted-foreground">
                  Choose an option to continue.
                </p>
              ) : null}
            </div>
          ) : (
            <button
              type="button"
              onClick={reset}
              className={`${buttonBase} text-muted-foreground hover:text-foreground`}
            >
              <RotateCcw aria-hidden="true" className="size-4" />
              Start over
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
