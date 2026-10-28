"use client";

import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

/**
 * AuthCard
 *
 * @param {boolean} [autoFocusHeading]  Moves focus to the heading when the card appears.
 *   Useful when a screen swaps to a new card (for example after a link is verified), so
 *   screen reader users hear the new title. Leave it off for a page's first card.
 */
export function AuthCard({
  title,
  description,
  children,
  footer,
  autoFocusHeading = false,
}) {
  const reduce = useReducedMotion();
  const headingId = useId();
  const headingRef = useRef(null);

  useEffect(() => {
    if (autoFocusHeading) headingRef.current?.focus({ preventScroll: true });
  }, [autoFocusHeading]);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.4, ease: "easeOut" }}
      className="w-full max-w-md"
    >
      <Card
        role="region"
        aria-labelledby={headingId}
        className="relative overflow-hidden rounded-2xl bg-card shadow-xl shadow-black/[0.04] dark:shadow-black/30 sm:rounded-3xl"
      >
        <div aria-hidden="true" className="h-1 w-full bg-primary" />
        <CardHeader className="gap-2.5 px-6 pt-6 sm:px-9 sm:pt-9">
          <h1
            id={headingId}
            ref={headingRef}
            tabIndex={-1}
            className="text-balance font-heading text-2xl font-semibold tracking-tight text-foreground focus:outline-none sm:text-[28px] sm:leading-9"
          >
            {title}
          </h1>
          {description ? (
            <p className="text-pretty text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </CardHeader>
        <CardContent className="gap-0 px-6 pb-6 sm:px-9 sm:pb-9">
          {children}
        </CardContent>
        {footer ? (
          <CardFooter className="justify-center border-t border-border pt-5 text-center text-sm leading-6 text-muted-foreground">
            {footer}
          </CardFooter>
        ) : null}
      </Card>
    </motion.div>
  );
}

/**
 * AnimatedError
 *
 * @param {string} [id]  Optional. Lets a field or button point to the error with
 *                       aria-describedby.
 */
export function AnimatedError({ message, id }) {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence initial={false}>
      {message ? (
        <motion.div
          key="error"
          id={id}
          role="alert"
          initial={reduce ? false : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
          transition={{ duration: reduce ? 0 : 0.2, ease: "easeOut" }}
          className="overflow-hidden rounded-lg border border-destructive/30 bg-destructive/5 text-sm leading-6 text-destructive"
        >
          <div className="flex items-start gap-2.5 p-3">
            <AlertCircle
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0"
            />
            <p>{message}</p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

const NOTICE_TONES = {
  success: {
    icon: CheckCircle2,
    className: "border-success/30 bg-success/5 text-success",
  },
  info: {
    icon: Info,
    className: "border-border bg-muted/40 text-muted-foreground",
  },
};

/**
 * AnimatedNotice
 *
 * A calm confirmation or hint that matches AnimatedError, for messages like
 * "We sent you an email". It is announced politely, not as an alert.
 *
 * @param {string} message
 * @param {"success"|"info"} [tone]
 */
export function AnimatedNotice({ message, tone = "success", id }) {
  const reduce = useReducedMotion();
  const { icon: Icon, className } = NOTICE_TONES[tone] ?? NOTICE_TONES.success;

  return (
    <AnimatePresence initial={false}>
      {message ? (
        <motion.div
          key="notice"
          id={id}
          role="status"
          aria-live="polite"
          initial={reduce ? false : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
          transition={{ duration: reduce ? 0 : 0.2, ease: "easeOut" }}
          className={`overflow-hidden rounded-lg border text-sm leading-6 ${className}`}
        >
          <div className="flex items-start gap-2.5 p-3">
            <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <p>{message}</p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
