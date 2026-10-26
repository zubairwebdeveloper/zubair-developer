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

const EASE = [0.22, 1, 0.36, 1]; // smooth, confident "ease-out-expo"-ish curve

/**
 * Reveal — fades/slides a single element into view on scroll.
 *
 * @param {React.ReactNode} children
 * @param {number} delay - seconds before the animation starts
 * @param {number} duration - seconds the animation takes
 * @param {keyof PRESETS} direction - which preset to animate from
 * @param {string} className
 * @param {string} as - element tag to render (default "div")
 * @param {string} viewportMargin - how early/late the reveal triggers
 * @param {boolean} once - whether to animate only the first time it enters view
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

/**
 * StaggerGroup — wraps a list of children and reveals them in sequence.
 * Pass plain children (e.g. mapped cards); each direct child is staggered.
 *
 * Usage:
 *   <StaggerGroup className="grid grid-cols-3 gap-6">
 *     {items.map((item) => <Card key={item.id} {...item} />)}
 *   </StaggerGroup>
 */
export function StaggerGroup({
  children,
  className,
  staggerDelay = 0.08,
  direction = "up",
  duration = 0.45,
  viewportMargin = "-80px",
  once = true,
}) {
  const shouldReduceMotion = useReducedMotion();
  const preset = PRESETS[direction] ?? PRESETS.up;

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
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
    <motion.div
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
    </motion.div>
  );
}
