"use client";

import { motion } from "motion/react";
import { Check, Circle } from "lucide-react";

const FLOW_STEPS = [
  "Validate the request",
  "Save the inquiry to Firestore",
  "Send a notification",
];

export function BackendPanel({ reducedMotion, inView }) {
  const animateFlow = inView && !reducedMotion;

  return (
    <div className="flex h-full min-h-0 flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-foreground sm:text-sm">
          Contact API flow
        </p>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-success/25 bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">
          <span className="size-1.5 rounded-full bg-success" />
          Success
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-border/70 bg-background/75 p-2.5 sm:p-3">
        <div className="mb-2 flex items-center gap-2 rounded-lg border border-border/70 bg-muted/40 px-2.5 py-2">
          <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary">
            POST
          </span>
          <code className="font-mono text-[11px] text-foreground sm:text-xs">
            /api/contact
          </code>
        </div>
        <ol className="flex flex-col gap-1.5">
          {FLOW_STEPS.map((step, index) => (
            <motion.li
              key={step}
              initial={animateFlow ? { opacity: 0.45, x: -5 } : false}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: animateFlow ? 0.3 + index * 0.45 : 0,
                duration: 0.3,
              }}
              className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/80 px-2.5 py-2"
            >
              {animateFlow ? (
                <motion.span
                  initial={{ scale: 0.7, opacity: 0.4 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.45 + index * 0.45, duration: 0.2 }}
                  className="flex size-5 shrink-0 items-center justify-center rounded-full bg-success/10 text-success"
                >
                  <Check aria-hidden="true" className="size-3" />
                </motion.span>
              ) : (
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                  <Check aria-hidden="true" className="size-3" />
                </span>
              )}
              <span className="text-[11px] leading-snug text-foreground sm:text-xs">
                {step}
              </span>
            </motion.li>
          ))}
        </ol>
        <div className="mt-2 flex items-center gap-2 border-t border-border/60 pt-2">
          {animateFlow ? (
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.8, duration: 0.25 }}
            >
              <Check aria-hidden="true" className="size-3.5 text-success" />
            </motion.span>
          ) : (
            <Check aria-hidden="true" className="size-3.5 text-success" />
          )}
          <code className="font-mono text-[10px] text-muted-foreground">
            Response ready
          </code>
          <Circle
            aria-hidden="true"
            className="ml-auto size-1.5 fill-success text-success"
          />
        </div>
      </div>
      <p className="sr-only">
        The endpoint validates a request, saves the inquiry to Firestore and
        sends a notification.
      </p>
    </div>
  );
}
