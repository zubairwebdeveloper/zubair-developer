"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

async function writeToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  // Fallback for older browsers / insecure contexts
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (!ok) throw new Error("Copy command failed");
}

/** Copies an email address to the clipboard with accessible feedback. */
export function CopyEmailButton({ email, className }) {
  const [status, setStatus] = useState("idle"); // "idle" | "copied" | "error"
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleCopy = async () => {
    try {
      await writeToClipboard(email);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setStatus("idle"), 2200);
  };

  const Icon = status === "copied" ? Check : Copy;

  return (
    <>
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          buttonVariants({ variant: "outline", size: "lg" }),
          "w-full sm:w-auto",
          className,
        )}
      >
        <Icon aria-hidden="true" className="size-4" />
        {status === "copied"
          ? "Email copied"
          : status === "error"
            ? "Copy failed"
            : "Copy email"}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {status === "copied"
          ? `${email} copied to clipboard`
          : status === "error"
            ? "Could not copy the email address"
            : ""}
      </span>
    </>
  );
}
