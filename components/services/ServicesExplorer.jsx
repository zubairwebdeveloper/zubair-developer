"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

export function ServicesExplorer({ items = [], categories = [] }) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState("all");

  const visible =
    active === "all" ? items : items.filter((item) => item.category === active);

  const chipClass = (selected) =>
    `min-h-10 rounded-full border px-3.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
      selected
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
    }`;

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
        <h2 className="text-card-title text-foreground">
          Services are coming soon
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Check back shortly, or get in touch to discuss your project.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {categories.length > 1 ? (
        <div className="flex flex-col gap-3">
          <div
            role="group"
            aria-label="Filter services by category"
            className="flex flex-wrap gap-2"
          >
            <button
              type="button"
              aria-pressed={active === "all"}
              onClick={() => setActive("all")}
              className={chipClass(active === "all")}
            >
              All services
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                aria-pressed={active === category.id}
                onClick={() => setActive(category.id)}
                className={chipClass(active === category.id)}
              >
                {category.label}
              </button>
            ))}
          </div>

          <p
            role="status"
            aria-live="polite"
            className="text-sm text-muted-foreground"
          >
            {visible.length === items.length
              ? `${items.length} ${items.length === 1 ? "service" : "services"}`
              : `Showing ${visible.length} of ${items.length}`}
          </p>
        </div>
      ) : null}

      <motion.ul layout className="grid gap-6 md:grid-cols-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((item) => (
            <motion.li
              key={item.slug}
              layout={reduceMotion ? false : "position"}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
              transition={{ duration: reduceMotion ? 0 : 0.25, ease: EASE }}
              className="grid"
            >
              {item.node}
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
