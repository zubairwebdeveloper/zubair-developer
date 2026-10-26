"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

// Editable content: list only technologies you actually offer to clients.
const GROUPS = [
  { id: "all", label: "All" },
  { id: "frontend", label: "Frontend" },
  { id: "data", label: "Backend & data" },
];

const TECH = [
  { name: "Next.js", group: "frontend", note: "App Router web applications" },
  { name: "React", group: "frontend", note: "Component-based interfaces" },
  {
    name: "Tailwind CSS",
    group: "frontend",
    note: "Consistent, responsive styling",
  },
  {
    name: "Framer Motion",
    group: "frontend",
    note: "Purposeful interface motion",
  },
  { name: "Firebase", group: "data", note: "Authentication and data" },
];

export function AboutTechStack() {
  const reduceMotion = useReducedMotion();
  const [group, setGroup] = useState("all");

  const visible =
    group === "all" ? TECH : TECH.filter((item) => item.group === group);

  const chipClass = (selected) =>
    `min-h-10 rounded-full border px-3.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
      selected
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
    }`;

  return (
    <div className="flex flex-col gap-6">
      <div
        role="group"
        aria-label="Filter technologies"
        className="flex flex-wrap gap-2"
      >
        {GROUPS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={group === item.id}
            onClick={() => setGroup(item.id)}
            className={chipClass(group === item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {`${visible.length} technologies shown`}
      </p>

      <motion.ul layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((item) => (
            <motion.li
              key={item.name}
              layout={reduceMotion ? false : "position"}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
              transition={{ duration: reduceMotion ? 0 : 0.25, ease: EASE }}
              className="grid"
            >
              <div className="group flex flex-col gap-1.5 rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-md motion-safe:hover:-translate-y-0.5">
                <span className="text-card-title text-foreground">
                  {item.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {item.note}
                </span>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
