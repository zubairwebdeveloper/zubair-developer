"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Copy, RotateCcw } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

const ITEMS = [
  "I know the main goal of the project",
  "I know who will use it",
  "I have examples or links I like",
  "I have a rough deadline in mind",
  "I have a budget range in mind (optional)",
  "I have text, logo or brand material ready",
];

function getMessage(done, total) {
  if (done === 0) return "Tick what you already have. Missing items are fine.";
  if (done === total)
    return "You are well prepared. Send your message anytime.";
  if (done >= Math.ceil(total / 2))
    return "Good progress. You have enough to start a conversation.";
  return "A good start. Even a rough idea is enough to write to me.";
}

export function ReadinessChecklist() {
  const reduce = useReducedMotion();
  const baseId = useId();
  const [checked, setChecked] = useState(() => new Set());
  const [status, setStatus] = useState("idle"); // idle | copied | error
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const done = checked.size;
  const percent = Math.round((done / ITEMS.length) * 100);

  function toggle(index) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
    setStatus("idle");
  }

  async function copySummary() {
    const text = [
      "Project readiness:",
      ...ITEMS.map((item, i) => `${checked.has(i) ? "[x]" : "[ ]"} ${item}`),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2200);
  }

  const button =
    "border-border bg-background hover:bg-muted focus-visible:ring-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none";

  return (
    <div className="border-border bg-card flex min-w-0 flex-col gap-6 rounded-2xl border p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-sm font-medium">
            {done} of {ITEMS.length} ready
          </p>
          <p className="text-muted-foreground text-sm tabular-nums">
            {percent}%
          </p>
        </div>
        <div
          role="progressbar"
          aria-label="Project readiness"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="bg-muted h-2 overflow-hidden rounded-full"
        >
          <motion.div
            className="bg-primary h-full origin-left rounded-full"
            initial={false}
            animate={{ scaleX: percent / 100 }}
            transition={{ duration: reduce ? 0.01 : 0.4, ease: EASE }}
          />
        </div>
        <p
          className="text-muted-foreground text-sm leading-6"
          role="status"
          aria-live="polite"
        >
          {getMessage(done, ITEMS.length)}
        </p>
      </div>

      <ul className="grid gap-3 md:grid-cols-2">
        {ITEMS.map((item, index) => {
          const id = `${baseId}-${index}`;
          const isOn = checked.has(index);
          return (
            <li key={item}>
              <label
                htmlFor={id}
                className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm transition-colors duration-200 motion-reduce:transition-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring ${
                  isOn
                    ? "border-primary/50 bg-primary/5"
                    : "border-border bg-background hover:border-primary/30"
                }`}
              >
                <input
                  id={id}
                  type="checkbox"
                  checked={isOn}
                  onChange={() => toggle(index)}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors motion-reduce:transition-none ${
                    isOn
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border"
                  }`}
                >
                  <AnimatePresence initial={false}>
                    {isOn ? (
                      <motion.span
                        key="tick"
                        initial={{ scale: reduce ? 1 : 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: reduce ? 1 : 0.4, opacity: 0 }}
                        transition={{ duration: reduce ? 0.01 : 0.15 }}
                        className="flex"
                      >
                        <Check className="size-3.5" />
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </span>
                <span className="leading-6">{item}</span>
              </label>
            </li>
          );
        })}
      </ul>

      <div className="border-border flex flex-col gap-3 border-t pt-5 sm:flex-row sm:flex-wrap sm:items-center">
        <button type="button" onClick={copySummary} className={button}>
          {status === "copied" ? (
            <Check aria-hidden="true" className="text-primary size-4" />
          ) : (
            <Copy aria-hidden="true" className="size-4" />
          )}
          {status === "copied"
            ? "Summary copied"
            : status === "error"
              ? "Copy failed"
              : "Copy my summary"}
        </button>
        <button
          type="button"
          onClick={() => {
            setChecked(new Set());
            setStatus("idle");
          }}
          disabled={done === 0}
          className={button}
        >
          <RotateCcw aria-hidden="true" className="size-4" />
          Reset
        </button>
        <Link
          href="/contact"
          className="group bg-primary text-primary-foreground focus-visible:ring-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 motion-safe:active:scale-[0.98] sm:ml-auto"
        >
          Discuss Your Project
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </Link>
        <span className="sr-only" role="status" aria-live="polite">
          {status === "copied" ? "Summary copied to clipboard" : ""}
          {status === "error" ? "Could not copy the summary" : ""}
        </span>
      </div>
    </div>
  );
}
