"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils/cn";

const TYPE_MS = 65;
const DELETE_MS = 32;
const HOLD_MS = 1800;
const GAP_MS = 350;

/**
 * Character-by-character typewriter.
 * - SSR aur pehla render poora pehla phrase dikhata hai (hydration safe, CLS nahi).
 * - Screen reader ko stable sr-only jumla milta hai, animated text aria-hidden hai.
 * - prefers-reduced-motion par animation band, pehla phrase static.
 */
export function TypedRole({ phrases, label, className }) {
  const [reduced, setReduced] = useState(false);
  const [state, setState] = useState({
    index: 0,
    count: phrases[0]?.length ?? 0,
    phase: "hold",
  });

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reduced || phrases.length < 2) return undefined;

    const { index, count, phase } = state;
    const current = phrases[index];
    let delay = TYPE_MS;
    let next;

    if (phase === "hold") {
      delay = HOLD_MS;
      next = { index, count, phase: "delete" };
    } else if (phase === "delete") {
      if (count > 0) {
        delay = DELETE_MS;
        next = { index, count: count - 1, phase };
      } else {
        delay = GAP_MS;
        next = { index: (index + 1) % phrases.length, count: 0, phase: "type" };
      }
    } else if (count < current.length) {
      next = { index, count: count + 1, phase };
    } else {
      next = { index, count, phase: "hold" };
    }

    const timer = setTimeout(() => setState(next), delay);
    return () => clearTimeout(timer);
  }, [state, reduced, phrases]);

  const visible = reduced
    ? phrases[0]
    : phrases[state.index].slice(0, state.count);

  return (
    <span className={cn("inline-block", className)}>
      <span className="sr-only">{label ?? phrases.join(", ")}</span>
      <span aria-hidden="true">
        {visible}
        <span
          className={cn(
            "ml-0.5 inline-block h-[1em] w-0.5 translate-y-[0.15em] bg-current",
            !reduced && "motion-safe:animate-pulse",
          )}
        />
      </span>
    </span>
  );
}
