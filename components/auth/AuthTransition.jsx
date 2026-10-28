"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

import { getRouteTitle } from "./authRoutes";
const EASE = [0.22, 1, 0.36, 1];

export function AuthTransition({ children }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    // Naye page par scroll top (mobile par important)
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

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
          initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
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
