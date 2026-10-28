"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils/cn";

const SHOW_AFTER = 480;

/**
 * Fixed control that returns to the top. Hidden until the visitor has
 * scrolled, and it publishes `data-scrolltop` so the chat widget can stack.
 */
export function BackToTop({ threshold = SHOW_AFTER }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    let ticking = false;

    const update = () => {
      setVisible(window.scrollY > threshold);
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
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [threshold]);

  useEffect(() => {
    document.documentElement.dataset.scrolltop = visible ? "visible" : "hidden";
    return () => {
      delete document.documentElement.dataset.scrolltop;
    };
  }, [visible]);

  function handleClick() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      className={cn(
        "focus-ring glass shadow-soft fixed right-4 z-[55] flex size-11 cursor-pointer items-center justify-center rounded-full border border-border text-foreground print:hidden sm:right-6",
        "bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))]",
        "transition-[opacity,transform] duration-300 motion-reduce:transition-none",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      <ArrowUp aria-hidden="true" className="size-4" />
    </button>
  );
}
