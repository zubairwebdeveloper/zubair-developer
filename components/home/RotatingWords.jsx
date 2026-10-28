"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils/cn";

const HOLD_MS = 2200;

/**
 * Rotating object of "I build ___".
 * Screen readers get one stable sentence. Animated text is aria-hidden.
 * Reduced motion shows the full list, never a live region that chatters.
 */
export function RotatingWords({ words, className, reserveWidth = false }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const spoken = `I build ${words.join(", ")}.`;
  const reservedWidth = reserveWidth
    ? `${Math.max(...words.map((word) => word.length))}ch`
    : undefined;

  useEffect(() => {
    if (reduce || words.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, HOLD_MS);
    return () => window.clearInterval(timer);
  }, [reduce, words.length]);

  if (reduce) {
    return (
      <span
        aria-live="polite"
        aria-atomic="true"
        className={cn("text-highlight", className)}
        style={reservedWidth ? { minWidth: reservedWidth } : undefined}
      >
        <span className="sr-only">{spoken}</span>
        <span aria-hidden="true">{words[0]}</span>
      </span>
    );
  }

  return (
    <span
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        "relative inline-flex min-h-[1.5em] items-baseline",
        reserveWidth ? "" : "min-w-[9ch]",
        className,
      )}
      style={reservedWidth ? { minWidth: reservedWidth } : undefined}
    >
      <span className="sr-only">{spoken}</span>
      <span aria-hidden="true" className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={words[index]}
            initial={{ y: "0.55em", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-0.55em", opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="inline-block text-highlight"
          >
            {words[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}
