"use client";

import { motion } from "motion/react";

export function ConnectionLines({ reducedMotion, inView }) {
  const animateLines = !reducedMotion && inView;

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 480 420"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 z-0 size-full opacity-40"
    >
      <defs>
        <linearGradient id="hero-showcase-connection" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--highlight)" />
          <stop offset="100%" stopColor="var(--violet)" />
        </linearGradient>
      </defs>
      {[
        "M 12 95 C 110 20, 200 155, 282 86 S 400 55, 472 112",
        "M 10 328 C 112 386, 184 234, 278 326 S 402 373, 470 300",
      ].map((path) => (
        <motion.path
          key={path}
          d={path}
          fill="none"
          stroke="url(#hero-showcase-connection)"
          strokeWidth="1.25"
          strokeDasharray="3 8"
          initial={animateLines ? { pathLength: 0.35 } : false}
          animate={animateLines ? { pathLength: [0.35, 1, 0.35] } : undefined}
          transition={{
            duration: 8,
            repeat: animateLines ? Infinity : 0,
            ease: "easeInOut",
          }}
        />
      ))}
    </svg>
  );
}
