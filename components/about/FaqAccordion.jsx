"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

/** items: [{ question: string, answer: string }] */
export function FaqAccordion({ items }) {
  const baseId = useId();
  const reduceMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="border-border bg-card divide-border divide-y overflow-hidden rounded-2xl border">
      {items.map((item, index) => {
        const open = openIndex === index;
        const buttonId = `${baseId}-trigger-${index}`;
        const panelId = `${baseId}-panel-${index}`;

        return (
          <div key={item.question}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? -1 : index)}
                className="focus-visible:ring-ring hover:bg-muted/50 flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset motion-reduce:transition-none"
              >
                <span className="text-balance">{item.question}</span>
                <ChevronDown
                  aria-hidden="true"
                  className={`text-muted-foreground size-5 shrink-0 transition-transform duration-200 motion-reduce:transition-none ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {open ? (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  key="panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    duration: reduceMotion ? 0.01 : 0.28,
                    ease: EASE,
                  }}
                  className="overflow-hidden"
                >
                  <p className="text-muted-foreground max-w-2xl px-5 pt-1 pb-5 leading-7">
                    {item.answer}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
