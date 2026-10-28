"use client";

// components/home/StickyProcessClient.jsx
// Client component for the StickyProcess sticky scroll storytelling.
// Steps highlight as you scroll on desktop.
// On mobile collapses to a simple numbered list.

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils/cn";

function Check() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="size-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m4.5 10.5 3.5 3.5 7.5-8" />
    </svg>
  );
}

export function StickyProcessClient({ steps }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const sectionRef = useRef(null);
  const stepRefs = useRef([]);

  // Intersection-based highlight — each step card scrolls into a zone
  useEffect(() => {
    if (reduce || typeof IntersectionObserver === "undefined") return;

    const observers = stepRefs.current.map((el, i) => {
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(i);
        },
        { threshold: 0.55 },
      );
      obs.observe(el);
      return obs;
    });

    return () => observers.forEach((obs) => obs?.disconnect());
  }, [reduce, steps.length]);

  // Mobile / reduced-motion: simple numbered list
  if (reduce) {
    return (
      <ol className="flex flex-col gap-4">
        {steps.map((step, i) => (
          <li key={step.id} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
            <span
              aria-hidden="true"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-heading text-sm font-bold text-primary"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex flex-col gap-1">
              <h3 className="text-card-title text-foreground">{step.title}</h3>
              {step.description && (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div ref={sectionRef} className="grid gap-8 lg:grid-cols-[20rem_1fr] lg:gap-12">
      {/* Sticky step navigator — desktop only */}
      <aside className="hidden lg:block">
        <div className="sticky top-28 flex flex-col gap-2">
          {steps.map((step, i) => {
            const isActive = i === active;
            const isDone = i < active;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  stepRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                aria-label={`Go to step: ${step.title}`}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "border-primary/30 bg-primary/10 font-medium text-foreground"
                    : isDone
                      ? "border-transparent text-muted-foreground"
                      : "border-transparent text-muted-foreground/60",
                )}
              >
                <span
                  className={cn(
                    "inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-xs transition-colors duration-200",
                    isDone
                      ? "bg-primary text-primary-foreground"
                      : isActive
                        ? "bg-primary/15 font-bold text-primary ring-1 ring-inset ring-primary/30"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {isDone ? <Check /> : String(i + 1).padStart(2, "0")}
                </span>
                <span className="truncate">{step.title}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Scrollable step cards */}
      <div className="flex flex-col gap-6">
        {steps.map((step, i) => {
          const isActive = i === active;
          return (
            <article
              key={step.id}
              ref={(el) => { stepRefs.current[i] = el; }}
              className={cn(
                "relative overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 sm:p-8",
                isActive
                  ? "border-primary/40 shadow-md"
                  : "border-border opacity-60 hover:opacity-80",
              )}
            >
              {/* Progress bar at top */}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-0 top-0 h-0.5 origin-left bg-gradient-to-r from-primary via-primary/60 to-transparent transition-transform duration-500",
                  isActive ? "scale-x-100" : "scale-x-0",
                )}
              />

              <div className="flex items-start gap-5">
                <span
                  aria-hidden="true"
                  className={cn(
                    "inline-flex size-12 shrink-0 items-center justify-center rounded-2xl font-heading text-lg font-bold transition-colors duration-300",
                    isActive
                      ? "bg-primary/15 text-primary ring-1 ring-inset ring-primary/30"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="text-card-title text-foreground">{step.title}</h3>
                  {step.description && (
                    <p className="max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {step.description}
                    </p>
                  )}
                  {Array.isArray(step.deliverables) && step.deliverables.length > 0 && (
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {step.deliverables.map((d) => (
                        <li
                          key={d}
                          className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground"
                        >
                          {d}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
