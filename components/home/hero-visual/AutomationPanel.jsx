"use client";

import { motion } from "motion/react";

const FLOW_NODES = [
  "Comment",
  "Auto DM",
  "Qualify",
  "Google Sheet / CRM",
  "Notify",
];

export function AutomationPanel({ reducedMotion, inView }) {
  const animateFlow = inView && !reducedMotion;
  return (
    <div className="flex h-full min-h-0 flex-col gap-2.5">
      <p className="text-xs font-semibold text-foreground sm:text-sm">
        A connected lead flow
      </p>
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-background/75 px-2">
        <svg
          aria-hidden="true"
          viewBox="0 0 380 160"
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 size-full"
        >
          <defs>
            <linearGradient id="hero-automation-line" x1="0" x2="1">
              <stop offset="0%" stopColor="var(--primary)" />
              <stop offset="100%" stopColor="var(--violet)" />
            </linearGradient>
          </defs>
          <motion.path
            d="M 28 80 H 352"
            fill="none"
            stroke="url(#hero-automation-line)"
            strokeWidth="2"
            strokeDasharray="5 6"
            initial={animateFlow ? { pathLength: 0 } : false}
            animate={{ pathLength: 1 }}
            transition={{ duration: animateFlow ? 1.4 : 0 }}
          />
        </svg>
        <ol className="relative z-10 grid w-full grid-cols-5 items-center gap-1">
          {FLOW_NODES.map((node, index) => (
            <motion.li
              key={node}
              initial={animateFlow ? { opacity: 0, y: 5 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: animateFlow ? index * 0.18 : 0,
                duration: 0.25,
              }}
              className="flex min-w-0 flex-col items-center gap-2 text-center"
            >
              <motion.span
                animate={
                  animateFlow
                    ? { boxShadow: ["0 0 0 0 color-mix(in srgb, var(--primary) 0%, transparent)", "0 0 0 7px color-mix(in srgb, var(--primary) 16%, transparent)", "0 0 0 0 color-mix(in srgb, var(--primary) 0%, transparent)"] }
                    : undefined
                }
                transition={
                  animateFlow
                    ? {
                        duration: 2.2,
                        repeat: Infinity,
                        delay: index * 0.25,
                      }
                    : undefined
                }
                className="flex size-8 items-center justify-center rounded-xl border border-primary/25 bg-card text-[10px] font-semibold text-primary shadow-sm sm:size-10 sm:text-xs"
              >
                {index + 1}
              </motion.span>
              <span className="text-[8px] font-medium leading-tight text-muted-foreground sm:text-[10px]">
                {node}
              </span>
            </motion.li>
          ))}
        </ol>
      </div>
      <p className="sr-only">
        A comment starts an automatic direct message, qualifies the lead, adds
        it to a Google Sheet or CRM and sends a notification.
      </p>
    </div>
  );
}
