"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FiMoon, FiSun } from "react-icons/fi";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const subscribe = () => () => {};

const ICON_TRANSITION = { duration: 0.25, ease: [0.22, 1, 0.36, 1] };

export function ThemeToggle({ className }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const shouldReduceMotion = useReducedMotion();

  const isDark = mounted && resolvedTheme === "dark";

  if (!mounted) {
    // Reserves the exact footprint of the real button so nothing shifts
    // once we know the resolved theme.
    return (
      <div
        aria-hidden="true"
        className={cn("bg-muted size-9 animate-pulse rounded-md", className)}
      />
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn("relative overflow-hidden", className)}
    >
      <span className="sr-only">
        {isDark ? "Switch to light theme" : "Switch to dark theme"}
      </span>

      {shouldReduceMotion ? (
        isDark ? (
          <FiSun aria-hidden="true" />
        ) : (
          <FiMoon aria-hidden="true" />
        )
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isDark ? "sun" : "moon"}
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
            transition={ICON_TRANSITION}
            className="flex items-center justify-center"
          >
            {isDark ? (
              <FiSun aria-hidden="true" />
            ) : (
              <FiMoon aria-hidden="true" />
            )}
          </motion.span>
        </AnimatePresence>
      )}
    </Button>
  );
}
