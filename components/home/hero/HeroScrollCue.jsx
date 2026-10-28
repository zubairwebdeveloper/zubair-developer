"use client";

import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

export function HeroScrollCue({
  href = "#what-i-do",
  label = "Scroll to explore what I build",
}) {
  const reducedMotion = useReducedMotion();

  return (
    <Link
      href={href}
      className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md pr-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-card/70">
        <motion.span
          aria-hidden="true"
          animate={reducedMotion ? undefined : { y: [0, 3, 0] }}
          transition={
            reducedMotion
              ? undefined
              : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
          }
          className="inline-flex"
        >
          <ArrowDown className="size-4" />
        </motion.span>
      </span>
      {label}
    </Link>
  );
}
