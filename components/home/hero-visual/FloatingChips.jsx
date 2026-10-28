"use client";

import { motion } from "motion/react";

export function FloatingChips({ technologies, reducedMotion, inView }) {
  const offsets = [
    { x: -8, y: -6 },
    { x: 7, y: -4 },
    { x: -6, y: 7 },
    { x: 8, y: 5 },
  ];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-2 bottom-2 z-20 flex flex-wrap justify-center gap-1.5 sm:inset-x-5 sm:bottom-4 sm:gap-2"
    >
      {technologies.map((technology, index) => (
        <motion.span
          key={technology}
          animate={
            reducedMotion || !inView
              ? undefined
              : offsets[index % offsets.length]
          }
          transition={{
            duration: 3.2 + (index % offsets.length) * 0.7,
            repeat: reducedMotion || !inView ? 0 : Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          className="rounded-full border border-border/80 bg-card/90 px-2.5 py-1 text-[9px] font-medium text-foreground shadow-sm backdrop-blur-md sm:px-3 sm:text-[10px]"
        >
          {technology}
        </motion.span>
      ))}
    </div>
  );
}
