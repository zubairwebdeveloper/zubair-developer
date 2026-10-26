"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyEmailButton({ email }) {
  const [status, setStatus] = useState("idle"); // idle | copied | error
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
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
        className="border-border bg-background hover:bg-muted focus-visible:ring-ring inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none"
      >
        {status === "copied" ? (
          <Check aria-hidden="true" className="text-primary size-4" />
        ) : (
          <Copy aria-hidden="true" className="size-4" />
        )}
        {status === "copied"
          ? "Copied"
          : status === "error"
            ? "Copy failed"
            : "Copy email"}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {status === "copied" ? "Email copied to clipboard" : ""}
        {status === "error" ? "Could not copy the email" : ""}
      </span>
    </>
  );
}
