"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/**
 * CopyLinkButton
 *
 * Copies a link to the clipboard and shows a short "Copied" confirmation.
 *
 * @param {string} [url]        Link to copy. Can be a full URL or a path like "/projects/my-app".
 *                              Defaults to the current page URL.
 * @param {string} [label]      Button text. Default "Copy link".
 * @param {string} [copiedLabel] Text shown after copying. Default "Copied".
 * @param {string} [variant]    Button variant. Default "outline".
 * @param {string} [size]       Button size. Default "sm".
 * @param {string} [className]  Extra classes.
 */
export function CopyLinkButton({
  url,
  label = "Copy link",
  copiedLabel = "Copied",
  variant = "outline",
  size = "sm",
  className = "",
}) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  // Clear the timer if the component unmounts while "Copied" is showing.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function resolveUrl() {
    if (!url) return window.location.href;
    try {
      // Turns "/projects/my-app" into a full URL, leaves full URLs unchanged.
      return new URL(url, window.location.origin).toString();
    } catch {
      return url;
    }
  }

  // Fallback for older browsers or non-secure contexts.
  function legacyCopy(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  }

  async function handleCopy() {
    const link = resolveUrl();

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else if (!legacyCopy(link)) {
        throw new Error("Copy failed");
      }

      setCopied(true);
      toast.success("Link copied");

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(
        "Could not copy the link. Please copy it from the address bar.",
      );
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={className}
    >
      {copied ? (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
          <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
        </svg>
      )}
      <span aria-live="polite">{copied ? copiedLabel : label}</span>
    </Button>
  );
}

export default CopyLinkButton;
