"use client";

import { motion, useReducedMotion } from "motion/react";

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
 * Reveals direct children in sequence. Reduced-motion visitors get the
 * same layout with no transform.
 */
export function Stagger({
  children,
  className,
  staggerDelay = 0.08,
  direction = "up",
  duration = 0.45,
  viewportMargin = "-80px",
  once = true,
  as = "div",
}) {
  const shouldReduceMotion = useReducedMotion();
  const preset = PRESETS[direction] ?? PRESETS.up;
  const Tag = motion[as] ?? motion.div;

  if (shouldReduceMotion) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: staggerDelay },
    },
  };

  const item = {
    hidden: { opacity: 0, ...preset },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: { duration, ease: EASE },
    },
  };

  const items = Array.isArray(children) ? children : [children];

  return (
    <Tag
      className={className}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: viewportMargin }}
    >
      {items.map((child, i) => (
        <motion.div key={child?.key ?? i} variants={item}>
          {child}
        </motion.div>
      ))}
    </Tag>
  );
}
