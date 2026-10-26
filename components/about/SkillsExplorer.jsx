"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

/**
 * groups: [{ category: string, names: string[] }]
 * Category buttons se skills filter hoti hain. "All" par grouped grid dikhta hai.
 */
export function SkillsExplorer({ groups }) {
  const [active, setActive] = useState("all");
  const reduceMotion = useReducedMotion();

  const total = groups.reduce((sum, group) => sum + group.names.length, 0);
  const visible =
    active === "all" ? groups : groups.filter((g) => g.category === active);

  const filters = [
    { id: "all", label: "All", count: total },
    ...groups.map((g) => ({
      id: g.category,
      label: g.category,
      count: g.names.length,
    })),
  ];

  return (
    <div className="mt-8 flex flex-col gap-8">
      {/* Filters: mobile par horizontal scroll, desktop par wrap */}
      <div
        role="group"
        aria-label="Filter skills by category"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
      >
        {filters.map((filter) => {
          const selected = active === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setActive(filter.id)}
              className={`focus-visible:ring-ring inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none ${
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {filter.label}
              <span
                aria-hidden="true"
                className={`rounded-full px-1.5 text-xs tabular-nums ${
                  selected ? "bg-primary-foreground/20" : "bg-muted"
                }`}
              >
                {filter.count}
              </span>
              <span className="sr-only">({filter.count} skills)</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={active}
          initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.25, ease: EASE }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {visible.map((group) => (
            <div
              key={group.category}
              className="border-border bg-card flex flex-col gap-4 rounded-xl border p-5"
            >
              <h3 className="text-card-title">{group.category}</h3>
              <ul className="flex flex-wrap gap-2">
                {group.names.map((name) => (
                  <li
                    key={name}
                    className="bg-muted text-foreground/90 rounded-md px-3 py-1 text-sm"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
