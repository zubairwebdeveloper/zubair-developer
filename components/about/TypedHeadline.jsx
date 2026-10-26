"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

export function TypedHeadline({ text, className }) {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (reduce) return;
    setCount(0);
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) clearInterval(timer);
    }, 35);
    return () => clearInterval(timer);
  }, [text, reduce]);

  const shown = reduce ? text : text.slice(0, count);

  return (
    <p className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {shown}
        {!reduce && count < text.length ? (
          <span className="ml-0.5 inline-block h-[1em] w-px translate-y-0.5 animate-pulse bg-current" />
        ) : null}
      </span>
    </p>
  );
}
