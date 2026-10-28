"use client";

import { useEffect, useRef } from "react";

/**
 * Thin top progress bar. Width is written to the DOM on scroll so the
 * rest of the tree does not re-render. Color comes from theme tokens.
 */
export function ScrollProgress() {
  const barRef = useRef(null);

  useEffect(() => {
    let frame = 0;
    let ticking = false;

    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress})`;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        frame = requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 bg-foreground/10 print:hidden"
    >
      <div
        ref={barRef}
        className="h-full origin-left bg-gradient-to-r from-primary via-violet to-highlight will-change-transform"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
