"use client";

import { useEffect } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";

/** Article scroll hone ke sath top par patli progress bar. Sirf decoration hai. */
export function ReadingProgress({ targetId }) {
  const reduce = useReducedMotion();
  const progress = useMotionValue(0);
  const smooth = useSpring(progress, {
    stiffness: 180,
    damping: 28,
    mass: 0.4,
  });

  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) {
        progress.set(rect.bottom <= window.innerHeight ? 1 : 0);
        return;
      }
      progress.set(Math.min(1, Math.max(0, -rect.top / total)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [targetId, progress]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5"
    >
      <motion.div
        className="bg-primary h-full origin-left"
        style={{ scaleX: reduce ? progress : smooth }}
      />
    </div>
  );
}
