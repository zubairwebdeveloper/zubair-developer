"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

import {
  FORWARD_SLIDES_LEFT_TO_RIGHT,
  getRouteIndex,
  getRouteTitle,
} from "./authRoutes";

const OFFSET = 56; // px
const EASE = [0.22, 1, 0.36, 1];

export function AuthTransition({ children }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  const index = getRouteIndex(pathname);
  const previousIndex = useRef(index);
  const isFirstRender = useRef(true);

  // +1 = forward, -1 = back (render ke waqt calculate hota hai)
  const direction = index >= previousIndex.current ? 1 : -1;
  const slideSign = FORWARD_SLIDES_LEFT_TO_RIGHT ? -1 : 1;
  const fromX = reduceMotion ? 0 : direction * slideSign * OFFSET;
  const firstLoad = isFirstRender.current;

  useEffect(() => {
    previousIndex.current = index;
    isFirstRender.current = false;
    // Naye page par scroll top (mobile par important)
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [index, pathname]);

  return (
    <>
      {/* Screen reader ko page change ki khabar */}
      <p className="sr-only" role="status" aria-live="polite">
        {getRouteTitle(pathname)}
      </p>

      {/* overflow-x-clip: slide ke dauran horizontal scrollbar nahi aayega.
          px-1/-mx-1: focus ring clip nahi hogi. */}
      <div className="-mx-1 w-full overflow-x-clip px-1">
        <motion.div
          key={pathname}
          initial={
            firstLoad
              ? { opacity: 0, y: reduceMotion ? 0 : 12 }
              : { opacity: 0, x: fromX }
          }
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{
            duration: reduceMotion ? 0.01 : 0.45,
            ease: EASE,
          }}
        >
          {children}
        </motion.div>
      </div>
    </>
  );
}
