"use client";

import { ArrowUp, Printer } from "lucide-react";

const button =
  "border-border bg-background hover:bg-muted focus-visible:ring-ring inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none";

export function LeadToolbar() {
  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <button type="button" onClick={() => window.print()} className={button}>
        <Printer aria-hidden="true" className="size-4" />
        Print
      </button>
      <button
        type="button"
        onClick={() => {
          const reduce = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches;
          window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
        }}
        className={button}
      >
        <ArrowUp aria-hidden="true" className="size-4" />
        Back to top
      </button>
    </div>
  );
}
