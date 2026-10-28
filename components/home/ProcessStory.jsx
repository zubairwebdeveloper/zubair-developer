"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

export function ProcessStory({ steps }) {
  const [active, setActive] = useState(0);
  const stepRefs = useRef([]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (first, second) =>
              second.intersectionRatio - first.intersectionRatio,
          )[0];
        if (visible) {
          setActive(Number(visible.target.dataset.stepIndex));
        }
      },
      {
        rootMargin: "-30% 0px -45% 0px",
        threshold: [0, 0.2, 0.5, 0.8, 1],
      },
    );

    stepRefs.current.forEach((element) => {
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [steps.length]);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(15rem,0.75fr)_minmax(0,1.25fr)] lg:gap-16">
      <aside className="hidden lg:block">
        <div className="sticky top-28 rounded-[1.75rem] border border-border bg-card/80 p-5 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Overview
          </p>
          <h3 className="mt-3 text-card-title text-foreground">
            A clear path through the project
          </h3>
          <ol className="relative mt-7 flex flex-col gap-1">
            <span
              aria-hidden="true"
              className="absolute bottom-4 left-[1.05rem] top-4 w-px bg-border"
            />
            <span
              aria-hidden="true"
              className="absolute left-[1.05rem] top-4 w-px bg-primary transition-[height] duration-300 motion-reduce:transition-none"
              style={{
                height: `${(active / Math.max(steps.length - 1, 1)) * 100}%`,
              }}
            />
            {steps.map((step, index) => {
              const isActive = index === active;
              const isDone = index < active;
              return (
                <li key={step.id}>
                  <a
                    href={`#process-step-${index + 1}`}
                    aria-current={isActive ? "step" : undefined}
                    className={cn(
                      "relative flex min-h-11 items-center gap-3 rounded-lg px-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive
                        ? "font-semibold text-foreground"
                        : isDone
                          ? "text-muted-foreground"
                          : "text-muted-foreground/70",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "z-10 grid size-8 shrink-0 place-items-center rounded-full border bg-background text-xs transition-colors",
                        isActive
                          ? "border-primary bg-primary text-primary-foreground"
                          : isDone
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground",
                      )}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {step.title}
                  </a>
                </li>
              );
            })}
          </ol>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Timing depends on the agreed scope and the feedback or materials
            needed at each stage.
          </p>
        </div>
      </aside>

      <ol className="relative flex flex-col gap-5 before:absolute before:bottom-5 before:left-[19px] before:top-5 before:w-px before:bg-border lg:gap-8 lg:before:hidden">
        {steps.map((step, index) => {
          const isActive = index === active;
          return (
            <li
              key={step.id}
              id={`process-step-${index + 1}`}
              ref={(element) => {
                stepRefs.current[index] = element;
              }}
              data-step-index={index}
              className={cn(
                "relative scroll-mt-28 ml-10 rounded-[1.5rem] border bg-card p-5 transition-all duration-300 sm:p-7 motion-reduce:transition-none lg:ml-0",
                isActive
                  ? "border-primary/40 shadow-md shadow-primary/5"
                  : "border-border shadow-sm",
              )}
            >
              <div className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-xl font-heading text-sm font-bold transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-4">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="text-card-title text-foreground">
                        {step.title}
                      </h3>
                      {isActive ? (
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                          Active
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>

                  <dl className="grid gap-3 border-t border-border/70 pt-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        What you get
                      </dt>
                      <dd className="text-sm leading-relaxed text-foreground/90">
                        {step.deliverable}
                      </dd>
                    </div>
                    <div className="flex flex-col gap-1">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        What I need from you
                      </dt>
                      <dd className="text-sm leading-relaxed text-foreground/90">
                        {step.fromYou}
                      </dd>
                    </div>
                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Timing
                      </dt>
                      <dd className="text-sm text-foreground/90">
                        {step.duration || "Depends on scope"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
