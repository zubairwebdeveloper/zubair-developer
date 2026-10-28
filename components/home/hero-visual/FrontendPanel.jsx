"use client";

import { motion } from "motion/react";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { useState } from "react";

const VIEWPORTS = [
  { id: "mobile", label: "Mobile viewport", icon: Smartphone, width: "58%" },
  { id: "tablet", label: "Tablet viewport", icon: Tablet, width: "76%" },
  { id: "desktop", label: "Desktop viewport", icon: Monitor, width: "100%" },
];

const BUILD_STEPS = ["nav", "hero", "cards", "cta"];

export function FrontendPanel({ reducedMotion, inView }) {
  const [viewport, setViewport] = useState("desktop");
  const selectedViewport =
    VIEWPORTS.find((item) => item.id === viewport) ?? VIEWPORTS[2];
  const animateBuild = inView && !reducedMotion;

  return (
    <div className="flex h-full min-h-0 flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-foreground sm:text-sm">
          Responsive page
        </p>
        <div className="flex items-center gap-1 rounded-lg border border-border/70 bg-background/60 p-0.5">
          {VIEWPORTS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-label={label}
              aria-pressed={viewport === id}
              onClick={() => setViewport(id)}
              className="flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-pressed:bg-primary/10 aria-pressed:text-primary"
            >
              <Icon aria-hidden="true" className="size-3.5" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-background/75 p-2">
        <motion.div
          aria-label={`${viewport} layout preview`}
          animate={{ width: selectedViewport.width }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.5 }}
          className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm"
        >
          <motion.div
            initial={animateBuild ? { opacity: 0, y: -4 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: animateBuild ? 0.12 : 0, duration: 0.35 }}
            className="flex h-7 shrink-0 items-center gap-1.5 border-b border-border/70 px-2"
          >
            <span className="size-1.5 rounded-full bg-destructive/70" />
            <span className="size-1.5 rounded-full bg-warning/70" />
            <span className="size-1.5 rounded-full bg-success/70" />
            <span className="ml-auto h-1.5 w-1/3 rounded-full bg-muted" />
          </motion.div>

          <div className="flex min-h-0 flex-1 flex-col gap-2 p-2">
            <motion.div
              initial={animateBuild ? { opacity: 0, y: 6 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: animateBuild ? 0.35 : 0, duration: 0.4 }}
              className="flex items-center justify-between"
            >
              <span className="text-[8px] font-semibold text-primary">Studio</span>
              <span className="text-[7px] text-muted-foreground sm:text-[9px]">
                Work&nbsp;&nbsp; Services&nbsp;&nbsp; Contact
              </span>
            </motion.div>
            <motion.div
              initial={animateBuild ? { opacity: 0, y: 8 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: animateBuild ? 0.65 : 0, duration: 0.4 }}
              className="flex min-h-10 flex-1 flex-col justify-center gap-1 rounded-lg bg-primary/10 p-1.5 sm:min-h-14 sm:gap-2 sm:p-2"
            >
              <span className="text-[8px] font-semibold leading-tight text-foreground sm:text-xs">
                Build a better digital experience
              </span>
              <span className="text-[7px] leading-tight text-muted-foreground sm:text-[10px]">
                Clear pages that help people take the next step.
              </span>
              <span className="mt-0.5 flex h-3 w-fit items-center rounded bg-primary/70 px-1.5 text-[7px] font-medium text-primary-foreground sm:mt-1 sm:h-5 sm:px-2 sm:text-[9px]">
                Let&rsquo;s talk
              </span>
              {animateBuild ? (
                <motion.span
                  aria-hidden="true"
                  className="absolute right-2 top-1/2 size-3 rounded-full border border-primary bg-background shadow-sm"
                  animate={{ x: [-4, 5, -4], y: [3, -3, 3] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                />
              ) : null}
            </motion.div>
            <div className="grid grid-cols-3 gap-1.5">
              {BUILD_STEPS.slice(0, 3).map((step, index) => (
                <motion.div
                  key={step}
                  initial={animateBuild ? { opacity: 0, y: 8 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: animateBuild ? 0.95 + index * 0.12 : 0,
                    duration: 0.35,
                  }}
                  className="flex min-h-6 flex-col justify-center gap-1 rounded-md border border-border/70 bg-muted/50 p-1 sm:min-h-8 sm:p-1.5"
                >
                  <span className="text-[6px] font-medium leading-tight text-foreground sm:text-[8px]">
                    {["Design", "Build", "Grow"][index]}
                  </span>
                  <span className="h-1 w-2/3 rounded-full bg-muted-foreground/20" />
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={animateBuild ? { opacity: 0, y: 6 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: animateBuild ? 1.35 : 0, duration: 0.35 }}
              className="flex items-center justify-between rounded-md border border-border/70 px-1.5 py-1 sm:px-2 sm:py-1.5"
            >
              <span className="text-[7px] text-muted-foreground sm:text-[9px]">
                Ready to launch?
              </span>
              <span className="h-2.5 w-1/4 rounded bg-primary/60 sm:h-3" />
            </motion.div>
          </div>
        </motion.div>
      </div>
      <p className="sr-only">
        The preview builds from navigation to hero, content cards and a call to
        action. Choose a viewport size to preview its responsive layout.
      </p>
    </div>
  );
}
