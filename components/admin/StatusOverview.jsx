"use client";

import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

/**
 * segments: [{ id, label, value, className }]
 * Bar total ke hisab se proportion dikhati hai. Sirf decoration + summary,
 * exact numbers neeche list ma text ma bhi hain.
 */
export function StatusOverview({ total, segments }) {
  const reduce = useReducedMotion();
  const visible = segments.filter((s) => s.value > 0);

  return (
    <section
      aria-label="Status overview"
      className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-4 sm:p-5"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium">Status overview</h2>
        <p className="text-muted-foreground text-xs tabular-nums">
          {total} {total === 1 ? "item" : "items"}
        </p>
      </div>

      <div
        aria-hidden="true"
        className="bg-muted flex h-2.5 w-full overflow-hidden rounded-full"
      >
        {visible.map((segment, index) => (
          <motion.div
            key={segment.id}
            className={`h-full origin-left ${segment.className}`}
            style={{ width: `${(segment.value / total) * 100}%` }}
            initial={{ scaleX: reduce ? 1 : 0, opacity: reduce ? 1 : 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{
              duration: reduce ? 0.01 : 0.5,
              ease: EASE,
              delay: reduce ? 0 : index * 0.08,
            }}
          />
        ))}
      </div>

      <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {segments.map((segment) => (
          <li key={segment.id} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`size-2.5 rounded-full ${segment.className}`}
            />
            <span className="text-muted-foreground">{segment.label}</span>
            <span className="font-medium tabular-nums">
              {segment.value}
              <span className="text-muted-foreground font-normal">
                {" "}
                ({Math.round((segment.value / total) * 100)}%)
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
