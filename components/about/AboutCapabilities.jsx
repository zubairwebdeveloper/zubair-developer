"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Bot, Check, Globe, Layers } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

// Editable content: worded from your hero text and services metadata.
const AREAS = [
  {
    id: "websites",
    icon: Globe,
    label: "Websites",
    title: "High-performance websites",
    description:
      "Fast, responsive websites that represent your business clearly and work well on every screen size.",
    points: [
      "Responsive layouts for phones, tablets and desktops",
      "Built with a focus on speed and clarity",
      "Content structured so visitors know what to do next",
    ],
  },
  {
    id: "applications",
    icon: Layers,
    label: "Web applications",
    title: "Scalable web applications",
    description:
      "SaaS products and web applications designed so they can grow as your business does.",
    points: [
      "Interfaces built around real user workflows",
      "Data and accounts handled with established tools",
      "Structure that stays maintainable as features are added",
    ],
  },
  {
    id: "automation",
    icon: Bot,
    label: "AI automation",
    title: "AI-powered automation",
    description:
      "Chatbot automation and website AI assistants that take care of repeat work and common questions.",
    points: [
      "Chatbots and AI assistants for your website",
      "Automation of repetitive, well-defined tasks",
      "Designed to support your team, not replace the human touch",
    ],
  },
];

export function AboutCapabilities() {
  const uid = useId();
  const reduceMotion = useReducedMotion();
  const [{ index, dir }, setNav] = useState({ index: 0, dir: 1 });
  const tabRefs = useRef([]);

  const area = AREAS[index];
  const Icon = area.icon;
  const panelId = `${uid}-panel`;

  const goTo = (next, focus = false) => {
    const target = Math.min(Math.max(next, 0), AREAS.length - 1);
    setNav((current) =>
      current.index === target
        ? current
        : { index: target, dir: target > current.index ? 1 : -1 },
    );
    if (focus) tabRefs.current[target]?.focus();
  };

  const onKeyDown = (event) => {
    const targets = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: AREAS.length - 1,
    };
    if (!(event.key in targets)) return;
    event.preventDefault();
    goTo(targets[event.key], true);
  };

  const variants = {
    enter: (d) => ({ opacity: 0, x: reduceMotion ? 0 : d * 40 }),
    center: { opacity: 1, x: 0 },
    exit: (d) => ({ opacity: 0, x: reduceMotion ? 0 : d * -40 }),
  };

  const transition = { duration: reduceMotion ? 0 : 0.28, ease: EASE };

  return (
    <div className="flex flex-col gap-6">
      <div
        role="tablist"
        aria-label="Areas of focus"
        onKeyDown={onKeyDown}
        className="inline-flex w-full flex-wrap gap-1 rounded-xl border border-border bg-card p-1 sm:w-fit"
      >
        {AREAS.map((item, i) => {
          const active = i === index;
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
              className={`relative min-h-10 flex-1 rounded-lg px-4 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-none ${
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {active ? (
                <motion.span
                  layoutId={`${uid}-indicator`}
                  aria-hidden="true"
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 420, damping: 36 }
                  }
                  className="absolute inset-0 rounded-lg border border-primary/30 bg-primary/10"
                />
              ) : null}
              <span className="relative">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={area.id}
            id={panelId}
            role="tabpanel"
            aria-labelledby={`${uid}-tab-${index}`}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            drag="x"
            dragDirectionLock
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            dragSnapToOrigin
            onDragEnd={(_, info) => {
              if (info.offset.x < -60 || info.velocity.x < -500) {
                goTo(index + 1);
              } else if (info.offset.x > 60 || info.velocity.x > 500) {
                goTo(index - 1);
              }
            }}
            className="flex touch-pan-y flex-col gap-6 p-6 sm:p-8"
          >
            <div className="flex items-center gap-4">
              <span
                aria-hidden="true"
                className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20"
              >
                <Icon className="size-6" />
              </span>
              <h3 className="text-card-title text-foreground">{area.title}</h3>
            </div>

            <p className="max-w-prose text-base leading-relaxed text-muted-foreground">
              {area.description}
            </p>

            <ul className="flex flex-col gap-2.5">
              {area.points.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground"
                >
                  <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check aria-hidden="true" className="size-3 text-primary" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>

            <Link
              href="/services"
              className="inline-flex min-h-11 w-fit items-center gap-2 rounded-lg text-sm font-medium text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Explore Services
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="sr-only" aria-live="polite">
        {`${area.title}, ${index + 1} of ${AREAS.length}`}
      </p>
    </div>
  );
}
