"use client";

import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils/cn";

/**
 * ProgressBar
 *
 * @param {number}  value          0 to 100.
 * @param {string}  label          Accessible name.
 * @param {string}  [valueText]    Human-readable value, e.g. "Strong".
 * @param {string}  [barClassName] Extra classes for the filled bar (for example its color).
 * @param {"progressbar"|"meter"} [role]
 *   Use "progressbar" for something that is completing (an upload, a step flow).
 *   Use "meter" for a reading that is not a task, such as password strength.
 */
export function ProgressBar({
  value,
  label,
  valueText,
  barClassName,
  role = "progressbar",
}) {
  const reduce = useReducedMotion();
  // Guard against NaN / out-of-range values so the bar and ARIA value stay valid.
  const safeValue = Number.isFinite(value)
    ? Math.min(100, Math.max(0, value))
    : 0;

  return (
    <div
      role={role}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(safeValue)}
      aria-valuetext={valueText}
      className="h-2 w-full overflow-hidden rounded-full bg-border/70"
    >
      <motion.div
        className={cn("h-full rounded-full bg-brand", barClassName)}
        initial={false}
        animate={{ width: `${safeValue}%` }}
        transition={
          reduce ? { duration: 0 } : { duration: 0.35, ease: "easeOut" }
        }
      />
    </div>
  );
}
