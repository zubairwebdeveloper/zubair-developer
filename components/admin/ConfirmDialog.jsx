"use client";

import { useEffect, useId, useState } from "react";
import { FiAlertTriangle, FiInfo } from "react-icons/fi";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

function Spinner() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4 animate-spin motion-reduce:animate-none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * ConfirmDialog
 *
 * Existing props are unchanged. Optional additions:
 *  - cancelLabel   Text for the cancel button. Defaults to "Cancel".
 *  - children      Extra content under the description, such as a list of what
 *                  will be affected.
 *  - requireText   When set, the person must type this exact text before the
 *                  confirm button turns on. Best for destructive actions,
 *                  for example requireText="DELETE".
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  pending = false,
  onConfirm,
  requireText,
  children,
}) {
  const [typed, setTyped] = useState("");
  const inputId = useId();

  // Start fresh every time the dialog closes.
  useEffect(() => {
    if (open) return undefined;
    const frame = window.requestAnimationFrame(() => setTyped(""));
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  const needsText = Boolean(requireText);
  const textMatches = !needsText || typed.trim() === requireText;
  const canConfirm = !pending && textMatches;

  // Block Esc, overlay clicks, and the close button while a request is running.
  function handleOpenChange(next) {
    if (pending && !next) return;
    onOpenChange(next);
  }

  function onInputKeyDown(event) {
    if (event.key === "Enter" && canConfirm) {
      event.preventDefault();
      onConfirm?.();
    }
  }

  const Icon = destructive ? FiAlertTriangle : FiInfo;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="gap-4 text-left sm:flex-row sm:items-start">
          <span
            aria-hidden="true"
            className={cn(
              "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-1",
              destructive
                ? "bg-destructive/10 text-destructive ring-destructive/20"
                : "bg-primary/10 text-primary ring-primary/20",
            )}
          >
            <Icon className="h-5 w-5" />
          </span>

          <div className="flex min-w-0 flex-col gap-1.5">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="leading-relaxed">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>

        {children ? <div className="text-sm">{children}</div> : null}

        {needsText ? (
          <div className="flex flex-col gap-2">
            <label htmlFor={inputId} className="text-sm font-medium">
              Type{" "}
              <span className="font-mono font-semibold">{requireText}</span> to
              confirm
            </label>
            <Input
              id={inputId}
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              onKeyDown={onInputKeyDown}
              disabled={pending}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </div>
        ) : null}

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            disabled={!canConfirm}
            aria-busy={pending}
            onClick={onConfirm}
            className="gap-2"
          >
            {pending ? <Spinner /> : null}
            <span>{pending ? "Working…" : confirmLabel}</span>
          </Button>
        </DialogFooter>

        <span role="status" aria-live="polite" className="sr-only">
          {pending ? "Working, please wait" : ""}
        </span>
      </DialogContent>
    </Dialog>
  );
}
