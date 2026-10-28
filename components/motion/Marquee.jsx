"use client";

import { useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils/cn";

/**
 * Horizontal marquee. Pauses on hover and keyboard focus.
 * Reduced-motion visitors see a wrapping static row.
 */
export function Marquee({ children, className, duration = 40, label }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div
        className={cn("flex flex-wrap items-center gap-3", className)}
        aria-label={label}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group/marquee overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]",
        className,
      )}
      aria-label={label}
    >
      <div
        className="flex w-max motion-safe:animate-marquee group-hover/marquee:[animation-play-state:paused] group-focus-within/marquee:[animation-play-state:paused]"
        style={{ animationDuration: `${duration}s` }}
      >
        <div className="flex shrink-0 items-center gap-3 pr-3">{children}</div>
        <div
          aria-hidden="true"
          className="flex shrink-0 items-center gap-3 pr-3"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
