"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils/cn";

/**
 * Animated gradient border wrapper.
 * Creates a subtle gradient border that animates on hover.
 * Reduced-motion visitors get a static border.
 */
export function GradientBorder({ children, className }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className={cn("border border-border rounded-2xl", className)}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-2xl p-[1px]",
        "gradient-border-animated",
        className,
      )}
    >
      <div className="relative rounded-[calc(1rem-1px)] bg-card">{children}</div>
    </div>
  );
}
