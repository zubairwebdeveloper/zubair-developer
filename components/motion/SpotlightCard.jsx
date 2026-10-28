"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Spotlight card with mouse-following glow effect.
 * Touch and reduced-motion visitors get a static card.
 */
export function SpotlightCard({ children, className, spotlightSize = 200 }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 150, damping: 20, mass: 0.1 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20, mass: 0.1 });

  function handleMouseMove(event) {
    if (event.pointerType === "touch" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set(event.clientX - rect.left);
    mouseY.set(event.clientY - rect.top);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  if (reduce) {
    return (
      <div ref={ref} className={cn("rounded-2xl border border-border bg-card", className)}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative rounded-2xl border border-border bg-card overflow-hidden",
        className,
      )}
    >
      {/* Spotlight glow */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(${spotlightSize}px circle at ${springX}px ${springY}px, color-mix(in oklab, var(--highlight) 15%, transparent), transparent)`,
        }}
      />
      {children}
    </div>
  );
}
