"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

/** Chhota copy button. `label` screen reader ke liye hai, jaise "email". */
export function CopyValueButton({ value, label }) {
  const [status, setStatus] = useState("idle"); // idle | copied | error
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2000);
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        aria-label={status === "copied" ? `${label} copied` : `Copy ${label}`}
        className="border-border text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-ring inline-flex size-8 shrink-0 items-center justify-center rounded-md border outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none print:hidden"
      >
        {status === "copied" ? (
          <Check aria-hidden="true" className="text-primary size-3.5" />
        ) : (
          <Copy aria-hidden="true" className="size-3.5" />
        )}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {status === "copied" ? `${label} copied to clipboard` : ""}
        {status === "error" ? `Could not copy ${label}` : ""}
      </span>
    </>
  );
}
