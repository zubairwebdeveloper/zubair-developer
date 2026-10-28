"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useRef } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * Gentle pull toward the pointer. Strength is in pixels (keep it small).
 */
export function Magnetic({ children, strength = 8, className }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 20, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 260, damping: 20, mass: 0.4 });

  function onMove(event) {
    if (event.pointerType === "touch" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    x.set((dx / rect.width) * strength);
    y.set((dy / rect.height) * strength);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  if (reduce) {
    return <span className={cn("inline-flex", className)}>{children}</span>;
  }

  return (
    <motion.span
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ x: springX, y: springY }}
      className={cn("inline-flex will-change-transform", className)}
    >
      {children}
    </motion.span>
  );
}
