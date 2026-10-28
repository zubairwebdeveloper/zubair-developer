"use client";

import { motion } from "motion/react";

import {
  getKeyboardTabIndex,
  SHOWCASE_TABS,
} from "@/lib/hero/showcase";
import { cn } from "@/lib/utils/cn";

export function ShowcaseTabs({
  activeIndex,
  onSelect,
  reducedMotion,
  cycling,
}) {
  function handleKeyDown(event) {
    const nextIndex = getKeyboardTabIndex(
      event.key,
      activeIndex,
      SHOWCASE_TABS.length,
    );
    if (nextIndex === null) return;

    event.preventDefault();
    onSelect(nextIndex, { user: true });
    document.getElementById(`hero-showcase-tab-${nextIndex}`)?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label="What I build"
      onKeyDown={handleKeyDown}
      className="grid grid-cols-2 gap-1.5 rounded-2xl border border-border/70 bg-background/70 p-1.5 backdrop-blur-md sm:flex sm:gap-1"
    >
      {SHOWCASE_TABS.map((tab, index) => {
        const selected = index === activeIndex;

        return (
          <button
            key={tab.id}
            id={`hero-showcase-tab-${index}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls="hero-showcase-panel"
            tabIndex={selected ? 0 : -1}
            onClick={() => onSelect(index, { user: true })}
            className={cn(
              "relative isolate min-h-10 cursor-pointer overflow-hidden rounded-xl px-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-1 sm:px-3 sm:text-sm",
              selected
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {selected ? (
              <motion.span
                layoutId="hero-showcase-tab-indicator"
                aria-hidden="true"
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 420, damping: 34 }
                }
                className="absolute inset-0 -z-10 rounded-xl border border-primary/25 bg-primary/10"
              />
            ) : null}
            <span>{tab.label}</span>
            {selected && cycling && !reducedMotion ? (
              <motion.span
                aria-hidden="true"
                data-slot="auto-cycle-progress"
                className="absolute inset-x-2 bottom-0 h-0.5 origin-left rounded-full bg-primary"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 5, ease: "linear" }}
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
