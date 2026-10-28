"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Animation presets — subtle, premium motion with a consistent feel.
 * Each preset defines the "from" state; "to" is always the resting state.
 */
const PRESETS = {
  up: { y: 16, x: 0, scale: 1 },
  down: { y: -16, x: 0, scale: 1 },
  left: { y: 0, x: 16, scale: 1 },
  right: { y: 0, x: -16, scale: 1 },
  scale: { y: 0, x: 0, scale: 0.96 },
  fade: { y: 0, x: 0, scale: 1 },
};

const EASE = [0.22, 1, 0.36, 1];

/**
 * Reveal — fades/slides a single element into view on scroll.
 */
export function Reveal({
  children,
  delay = 0,
  duration = 0.5,
  direction = "up",
  className,
  as = "div",
  viewportMargin = "-80px",
  once = true,
}) {
  const shouldReduceMotion = useReducedMotion();
  const Tag = motion[as] ?? motion.div;
  const preset = PRESETS[direction] ?? PRESETS.up;

  if (shouldReduceMotion) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, ...preset }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once, margin: viewportMargin }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}
