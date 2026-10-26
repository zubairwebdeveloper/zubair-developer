"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef } from "react";

// Three colors the bar moves through: 0% → 50% → 100%. Edit freely.
const COLORS = ["#4F8CFF", "#8DCBFF", "#5EEAD4"];

/** A thin bar at the top of the page that fills as you scroll, with a percentage badge. */
export function ScrollProgress() {
  const reduce = useReducedMotion();
  const percentRef = useRef(null);
  const { scrollYProgress } = useScroll();
  // The spring smooths the bar. People who prefer reduced motion get the raw value.
  const smooth = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  const progress = reduce ? scrollYProgress : smooth;

  const color = useTransform(progress, [0, 0.5, 1], COLORS);
  const badgeOpacity = useTransform(scrollYProgress, [0, 0.02], [0, 1]);

  // Update the number directly in the DOM so scrolling never triggers a re-render.
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (percentRef.current) {
      const clamped = Math.min(1, Math.max(0, value));
      percentRef.current.textContent = `${Math.round(clamped * 100)}%`;
    }
  });

  return (
    <div aria-hidden="true" className="pointer-events-none print:hidden">
      <motion.div
        style={{ scaleX: progress, backgroundColor: color }}
        className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left"
      />
      <motion.div
        style={{ opacity: badgeOpacity, color }}
        className="fixed bottom-4 left-4 z-[60] rounded-full border border-border bg-background/85 px-2.5 py-1 text-xs font-semibold tabular-nums shadow-sm backdrop-blur sm:bottom-6 sm:left-6"
      >
        <span ref={percentRef}>0%</span>
      </motion.div>
    </div>
  );
}
