"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Info } from "lucide-react";

import {
  ESTIMATE_DISCLAIMER,
  estimateProject,
  formatEstimate,
  getEstimateTiers,
  getPublishedAddOns,
  PROJECT_SIZES,
} from "@/lib/pricing/estimate";
import { cn } from "@/lib/utils/cn";

const PROJECT_TYPES = [
  { value: "web", label: "Web" },
  { value: "chatbot", label: "Chatbot" },
];

export function EstimatorTeaserClient({ plans }) {
  const [projectType, setProjectType] = useState("web");
  const [size, setSize] = useState("starter");
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const availableTiers = useMemo(
    () => getEstimateTiers(plans, projectType),
    [plans, projectType],
  );
  const addOns = useMemo(
    () => getPublishedAddOns(plans, projectType),
    [plans, projectType],
  );
  const selectedTier = availableTiers[PROJECT_SIZES.findIndex((item) => item.value === size)];
  const estimate = estimateProject({ projectType, size, plans });
  const hireMeParams = new URLSearchParams({
    service: projectType === "web" ? "web-development" : "chatbot-automation",
    type: projectType,
    size,
  });
  if (selectedTier?.slug) hireMeParams.set("plan", selectedTier.slug);
  selectedAddOns.forEach((addOn) => hireMeParams.append("addons", addOn));
  const hireMeUrl = `/hire-me?${hireMeParams.toString()}`;

  const toggleAddOn = (addOn) => {
    setSelectedAddOns((current) =>
      current.includes(addOn)
        ? current.filter((item) => item !== addOn)
        : current.length < 3
          ? [...current, addOn]
          : current,
    );
  };

  const optionClass = (selected) =>
    cn(
      "min-h-10 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      selected
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-card text-foreground hover:border-primary/40",
    );

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium text-foreground">
          What are you building?
        </legend>
        <div className="flex flex-wrap gap-2">
          {PROJECT_TYPES.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={projectType === option.value}
              onClick={() => {
                setProjectType(option.value);
                setSize("starter");
                setSelectedAddOns([]);
              }}
              className={optionClass(projectType === option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium text-foreground">
          Project size
        </legend>
        <div className="flex flex-wrap gap-2">
          {PROJECT_SIZES.map((option, index) => {
            const available = Boolean(availableTiers[index]);
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={size === option.value}
                disabled={!available}
                onClick={() => setSize(option.value)}
                className={cn(
                  optionClass(size === option.value),
                  !available && "cursor-not-allowed opacity-45",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        {selectedTier ? (
          <p className="text-xs text-muted-foreground">
            {size === "starter"
              ? "Uses the lowest published plan."
              : `Based on the published ${selectedTier.name} plan.`}
          </p>
        ) : null}
      </fieldset>

      {addOns.length > 0 ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium text-foreground">
            Optional extras from published plan exclusions{" "}
            <span className="font-normal text-muted-foreground">
              (optional, choose up to 3)
            </span>
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {addOns.map((addOn) => {
              const checked = selectedAddOns.includes(addOn);
              return (
                <label
                  key={addOn}
                  className="flex min-h-10 cursor-pointer items-start gap-2 rounded-lg border border-border p-3 text-sm text-foreground"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={!checked && selectedAddOns.length >= 3}
                    onChange={() => toggleAddOn(addOn)}
                    className="mt-0.5 size-4 accent-primary"
                  />
                  <span>{addOn}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <div
        className="flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-5"
        aria-live="polite"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Starting from
          </p>
          <p className="mt-1 font-heading text-2xl font-bold text-foreground sm:text-3xl">
            {formatEstimate(estimate)}
          </p>
          {estimate.planName ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Based on the published {estimate.planName} plan; the range uses
              the next published price when available.
            </p>
          ) : null}
        </div>
        <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          {estimate.type === "custom"
            ? "There is no matching published price for this size yet."
            : "These are listed as not included on published plans, not priced add-ons. They are included in your brief for discussion, not added to this estimate."}
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {ESTIMATE_DISCLAIMER}
        </p>
      </div>

      <Link
        href={hireMeUrl}
        className="group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-safe:active:scale-[0.98] sm:w-auto"
      >
        Get exact quote
        <ArrowRight
          aria-hidden="true"
          className="size-4 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5"
        />
      </Link>
    </div>
  );
}
