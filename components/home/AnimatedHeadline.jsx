"use client";

import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils/cn";

const EASE = [0.22, 1, 0.36, 1];

/**
 * Word-by-word headline reveal. Reduced motion renders the heading immediately.
 *
 * @param {string} id
 * @param {string[]} lead  Words before the accent phrase
 * @param {string} [accent] Highlighted closing phrase
 * @param {string} [className]
 */
export function AnimatedHeadline({
  id,
  lead,
  accent,
  className,
  visibleFirst = false,
}) {
  const reduce = useReducedMotion();
  const label = accent ? `${lead.join(" ")} ${accent}` : lead.join(" ");

  if (reduce) {
    return (
      <h1 id={id} className={className}>
        {lead.join(" ")}
        {accent ? (
          <>
            {" "}
            <span className="text-highlight">{accent}</span>
          </>
        ) : null}
      </h1>
    );
  }

  const accentWords = accent ? accent.split(/\s+/).filter(Boolean) : [];

  return (
    <h1 id={id} className={className} aria-label={label}>
      <span aria-hidden="true">
        {lead.map((word, index) => (
          <Word
            key={`lead-${word}-${index}`}
            index={index}
            visibleFirst={visibleFirst}
          >
            {word}
          </Word>
        ))}
        {accentWords.map((word, index) => (
          <Word
            key={`accent-${word}-${index}`}
            index={lead.length + index}
            className="text-highlight"
            visibleFirst={visibleFirst}
          >
            {word}
          </Word>
        ))}
      </span>
    </h1>
  );
}

function Word({ children, index, className, visibleFirst }) {
  return (
    <motion.span
      initial={visibleFirst ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.045 * index, ease: EASE }}
      className={cn("inline-block pr-[0.28em] last:pr-0", className)}
    >
      {children}
    </motion.span>
  );
}
