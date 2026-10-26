"use client";

import { Check, CircleAlert, CircleCheck, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

/**
 * FormError
 *
 * @param {string} [id]  Optional. Lets a button or field point to the error with aria-describedby.
 */
export function FormError({ message, id, className }) {
  if (!message) return null;

  return (
    <p
      id={id}
      role="alert"
      className={cn(
        "flex items-start gap-2.5 rounded-xl border border-destructive/40 bg-destructive/10 px-3.5 py-3 text-sm leading-relaxed text-destructive motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1 motion-safe:duration-200",
        className,
      )}
    >
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </p>
  );
}

/**
 * FormSuccess
 *
 * @param {ReactNode} [children]  Optional actions shown under the message,
 *                                such as a "Send another message" button.
 */
export function FormSuccess({ title, description, reference, children }) {
  const [copyStatus, setCopyStatus] = useState("idle"); // idle | copied | error
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  async function copyReference() {
    try {
      await navigator.clipboard.writeText(String(reference));
      setCopyStatus("copied");
    } catch {
      // The browser can block clipboard access. The reference stays visible to copy by hand.
      setCopyStatus("error");
    }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopyStatus("idle"), 2000);
  }

  return (
    <div
      role="status"
      className="flex flex-col items-start gap-4 rounded-2xl border border-success/40 bg-success/10 p-6 sm:p-8 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-300"
    >
      <span
        aria-hidden="true"
        className="grid size-11 place-items-center rounded-full bg-success/15 text-success"
      >
        <CircleCheck className="size-6" />
      </span>

      <div className="space-y-1.5">
        <h2 className="text-card-title text-balance tracking-tight">{title}</h2>
        <p className="leading-relaxed text-muted-foreground">{description}</p>
      </div>

      {reference ? (
        <div className="flex w-full max-w-md items-center justify-between gap-2 rounded-xl border border-border/60 bg-background/70 py-1.5 pr-1.5 pl-3.5">
          <p className="min-w-0 text-sm">
            <span className="text-muted-foreground">Reference: </span>
            <span className="font-mono break-all">{reference}</span>
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={copyReference}
            aria-label="Copy reference"
          >
            {copyStatus === "copied" ? (
              <Check aria-hidden="true" />
            ) : (
              <Copy aria-hidden="true" />
            )}
            {copyStatus === "copied"
              ? "Copied"
              : copyStatus === "error"
                ? "Copy failed"
                : "Copy"}
          </Button>
          {/* A button label change is not announced, so say it out loud for screen readers. */}
          <span role="status" aria-live="polite" className="sr-only">
            {copyStatus === "copied"
              ? "Reference copied to clipboard"
              : copyStatus === "error"
                ? "Could not copy the reference. Select it and copy it manually."
                : ""}
          </span>
        </div>
      ) : null}

      {children ? (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      ) : null}
    </div>
  );
}
