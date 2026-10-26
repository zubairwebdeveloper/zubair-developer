"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const VIEWS = [
  { id: "walkthrough", label: "Walkthrough" },
  { id: "overview", label: "Overview" },
];

const EASE = [0.22, 1, 0.36, 1];

function Arrow({ direction = "right", className = "size-4" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === "right" ? (
        <path d="M4 10h12m-5-5 5 5-5 5" />
      ) : (
        <path d="M16 10H4m5-5-5 5 5 5" />
      )}
    </svg>
  );
}

function Check({ className = "size-3.5" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m4.5 10.5 3.5 3.5 7.5-8" />
    </svg>
  );
}

function StepDetails({ step }) {
  const hasDeliverables = step.deliverables.length > 0;

  return (
    <>
      {step.duration ? (
        <span className="inline-flex w-fit items-center rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {step.duration}
        </span>
      ) : null}

      {hasDeliverables ? (
        <div className="flex flex-col gap-2.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            What you get
          </h4>
          <ul className="flex flex-col gap-2">
            {step.deliverables.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground"
              >
                <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-brand">
                  <Check className="size-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {step.outcome ? (
        <div className="rounded-xl border border-border bg-muted/50 p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Outcome
          </h4>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground">
            {step.outcome}
          </p>
        </div>
      ) : null}
    </>
  );
}

export function ProcessExplorer({ steps }) {
  const uid = useId();
  const reduceMotion = useReducedMotion();
  const total = steps.length;

  const [view, setView] = useState("walkthrough");
  const [{ index, dir }, setNav] = useState({ index: 0, dir: 1 });
  const [canSwipe, setCanSwipe] = useState(false);

  const tabRefs = useRef([]);
  const listRef = useRef(null);
  const focusTabAfterSwitch = useRef(false);

  const step = steps[index];
  const nextStep = steps[index + 1];
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const panelId = `${uid}-panel`;

  const goTo = useCallback(
    (next, { focus = false } = {}) => {
      const target = Math.min(Math.max(next, 0), total - 1);
      setNav((current) =>
        current.index === target
          ? current
          : { index: target, dir: target > current.index ? 1 : -1 },
      );
      if (focus) tabRefs.current[target]?.focus();
    },
    [total],
  );

  // Enable swipe only on touch devices so mouse text selection keeps working.
  useEffect(() => {
    const query = window.matchMedia("(pointer: coarse)");
    const update = () => setCanSwipe(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // Keep the active step visible inside the horizontal mobile stepper.
  useEffect(() => {
    const list = listRef.current;
    const tab = tabRefs.current[index];
    if (!list || !tab || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({
      left: tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [index, reduceMotion]);

  // Restore focus when jumping from an overview card into the walkthrough.
  useEffect(() => {
    if (view === "walkthrough" && focusTabAfterSwitch.current) {
      focusTabAfterSwitch.current = false;
      tabRefs.current[index]?.focus();
    }
  }, [view, index]);

  const onTabKeyDown = (event) => {
    const targets = {
      ArrowRight: index + 1,
      ArrowDown: index + 1,
      ArrowLeft: index - 1,
      ArrowUp: index - 1,
      Home: 0,
      End: total - 1,
    };
    if (!(event.key in targets)) return;
    event.preventDefault();
    goTo(targets[event.key], { focus: true });
  };

  const openInWalkthrough = (target) => {
    focusTabAfterSwitch.current = true;
    goTo(target);
    setView("walkthrough");
  };

  const slideVariants = useMemo(
    () => ({
      enter: (direction) => ({
        opacity: 0,
        x: reduceMotion ? 0 : direction * 40,
      }),
      center: { opacity: 1, x: 0 },
      exit: (direction) => ({
        opacity: 0,
        x: reduceMotion ? 0 : direction * -40,
      }),
    }),
    [reduceMotion],
  );

  const transition = { duration: reduceMotion ? 0 : 0.28, ease: EASE };

  return (
    <div className="flex flex-col gap-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" aria-hidden="true">
          {view === "walkthrough"
            ? `Step ${index + 1} of ${total}`
            : `${total} steps`}
        </p>

        <div
          role="group"
          aria-label="Choose how to view the process"
          className="inline-flex rounded-xl border border-border bg-muted p-1"
        >
          {VIEWS.map((option) => {
            const selected = view === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setView(option.id)}
                className={`min-h-9 rounded-lg px-3.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  selected
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Screen-reader announcement for step changes */}
      <p className="sr-only" aria-live="polite">
        {view === "walkthrough"
          ? `Step ${index + 1} of ${total}: ${step.title}`
          : ""}
      </p>

      {view === "walkthrough" ? (
        <div className="grid gap-6 lg:grid-cols-[18rem_1fr] lg:gap-8">
          {/* Step navigator */}
          <div
            ref={listRef}
            role="tablist"
            aria-label="Project steps"
            onKeyDown={onTabKeyDown}
            className="relative -mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
          >
            {steps.map((item, i) => {
              const active = i === index;
              const done = i < index;
              return (
                <button
                  key={item.id}
                  ref={(node) => {
                    tabRefs.current[i] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`${uid}-tab-${i}`}
                  aria-selected={active}
                  aria-controls={panelId}
                  tabIndex={active ? 0 : -1}
                  onClick={() => goTo(i)}
                  className={`relative flex min-h-12 shrink-0 items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:w-full ${
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {active ? (
                    <motion.span
                      layoutId={`${uid}-active`}
                      aria-hidden="true"
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 420, damping: 36 }
                      }
                      className="absolute inset-0 rounded-xl border border-primary/30 bg-primary/10"
                    />
                  ) : null}

                  <span
                    aria-hidden="true"
                    className={`text-metric relative inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-xs transition-colors duration-200 ${
                      done
                        ? "bg-primary text-primary-foreground"
                        : active
                          ? "bg-primary/15 text-brand ring-1 ring-inset ring-primary/30"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {done ? <Check /> : String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="relative max-w-[10rem] truncate font-medium lg:max-w-none">
                    {item.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Detail panel */}
          <div className="relative min-h-[22rem] overflow-hidden rounded-2xl border border-border bg-card">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-0.5 bg-border"
            >
              <motion.div
                className="h-full origin-left bg-primary"
                initial={false}
                animate={{ scaleX: (index + 1) / total }}
                transition={transition}
              />
            </div>

            <AnimatePresence mode="wait" initial={false} custom={dir}>
              <motion.article
                key={step.id}
                id={panelId}
                role="tabpanel"
                aria-labelledby={`${uid}-tab-${index}`}
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={transition}
                drag={canSwipe ? "x" : false}
                dragDirectionLock
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                dragSnapToOrigin
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60 || info.velocity.x < -500) {
                    goTo(index + 1);
                  } else if (info.offset.x > 60 || info.velocity.x > 500) {
                    goTo(index - 1);
                  }
                }}
                className="flex flex-col gap-6 p-6 touch-pan-y sm:p-8"
              >
                <div className="flex items-center gap-4">
                  <span
                    aria-hidden="true"
                    className="text-metric inline-flex h-14 min-w-16 items-center justify-center rounded-2xl bg-primary/10 px-4 text-2xl text-brand ring-1 ring-inset ring-primary/20"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {isLast ? "Final step" : `Step ${index + 1} of ${total}`}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  <h3 className="text-card-title text-foreground">
                    {step.title}
                  </h3>
                  {step.description ? (
                    <p className="max-w-prose text-base leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  ) : null}
                </div>

                <StepDetails step={step} />

                <div className="mt-auto flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => goTo(index - 1)}
                    disabled={isFirst}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 motion-safe:active:scale-[0.98]"
                  >
                    <Arrow direction="left" />
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={() => (isLast ? goTo(0) : goTo(index + 1))}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-all duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card motion-safe:active:scale-[0.98]"
                  >
                    <span className="truncate">
                      {isLast ? "Start over" : `Next: ${nextStep.title}`}
                    </span>
                    {isLast ? null : <Arrow />}
                  </button>
                </div>
              </motion.article>
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((item, i) => (
            <motion.li
              key={item.id}
              className="grid"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: reduceMotion ? 0 : 0.4,
                ease: EASE,
                delay: reduceMotion ? 0 : Math.min(i * 0.06, 0.3),
              }}
            >
              <article className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-md motion-safe:hover:-translate-y-0.5 sm:p-6">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-primary via-primary/60 to-transparent transition-transform duration-300 group-hover:scale-x-100"
                />

                <div className="flex items-center justify-between gap-3">
                  <span
                    aria-hidden="true"
                    className="text-metric inline-flex h-10 min-w-12 items-center justify-center rounded-xl bg-primary/10 px-3 text-lg text-brand ring-1 ring-inset ring-primary/20 transition-colors duration-200 group-hover:bg-primary/15"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {i === total - 1
                      ? "Final step"
                      : `Step ${i + 1} of ${total}`}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <h3 className="text-card-title text-foreground">
                    {item.title}
                  </h3>
                  {item.description ? (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  ) : null}
                </div>

                {item.duration ? (
                  <span className="inline-flex w-fit items-center rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {item.duration}
                  </span>
                ) : null}

                <button
                  type="button"
                  onClick={() => openInWalkthrough(i)}
                  className="mt-auto inline-flex min-h-11 w-fit items-center gap-2 rounded-lg text-sm font-medium text-brand transition-colors duration-200 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  View in walkthrough
                  <Arrow className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </article>
            </motion.li>
          ))}
        </ol>
      )}
    </div>
  );
}
