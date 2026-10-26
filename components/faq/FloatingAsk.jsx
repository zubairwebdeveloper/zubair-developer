"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MessageCircleQuestion } from "lucide-react";

/** Thora scroll karne ke baad "Ask a question" button nazar aata hai. */
export function FloatingAsk() {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setVisible(window.scrollY > 700);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduce ? 0 : 16 }}
          transition={{ duration: reduce ? 0.01 : 0.25 }}
          className="fixed right-4 bottom-4 z-40 pb-[env(safe-area-inset-bottom,0px)] sm:right-6 sm:bottom-6"
        >
          <Link
            href="/contact"
            className="bg-primary text-primary-foreground focus-visible:ring-ring inline-flex min-h-12 items-center gap-2 rounded-full px-5 text-sm font-medium shadow-lg outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 motion-safe:active:scale-[0.98]"
          >
            <MessageCircleQuestion aria-hidden="true" className="size-4" />
            Ask a question
          </Link>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
