"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

export function CountUp({ value }) {
  const [count, setCount] = useState(0);
  const reduce = useReducedMotion();
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    let frame = 0;
    if (reduce) {
      frame = requestAnimationFrame(() => setCount(value));
      return () => cancelAnimationFrame(frame);
    }

    let startedAt;
    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            ([entry]) => {
              if (!entry.isIntersecting) return;
              observer?.disconnect();

              const animate = (timestamp) => {
                startedAt ??= timestamp;
                const progress = Math.min((timestamp - startedAt) / 800, 1);
                const eased = 1 - (1 - progress) ** 3;
                setCount(Math.round(value * eased));
                if (progress < 1) frame = requestAnimationFrame(animate);
              };
              frame = requestAnimationFrame(animate);
            },
            { threshold: 0.3 },
          );
    if (observer) observer.observe(element);
    else {
      const animate = (timestamp) => {
        startedAt ??= timestamp;
        const progress = Math.min((timestamp - startedAt) / 800, 1);
        setCount(Math.round(value * (1 - (1 - progress) ** 3)));
        if (progress < 1) frame = requestAnimationFrame(animate);
      };
      frame = requestAnimationFrame(animate);
    }

    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [reduce, value]);

  return (
    <span ref={ref} aria-hidden="true" className="tabular-nums">
      {count}
    </span>
  );
}
