"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";

const buttonClass =
  "border-border bg-background hover:bg-muted focus-visible:ring-ring inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none";

export function ShareButtons({ title }) {
  const [status, setStatus] = useState("idle"); // idle | copied | error
  const [canShare, setCanShare] = useState(false);
  const timer = useRef(null);

  // Hydration-safe: browser support client par check hota hai
  useEffect(() => {
    setCanShare(typeof navigator.share === "function");
    return () => clearTimeout(timer.current);
  }, []);

  function flash(next) {
    setStatus(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2000);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      flash("copied");
    } catch {
      flash("error");
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, url: window.location.href });
    } catch {
      // User ne share cancel kar diya, koi error dikhane ki zarurat nahi
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={copyLink} className={buttonClass}>
        {status === "copied" ? (
          <Check aria-hidden="true" className="text-primary size-4" />
        ) : (
          <Link2 aria-hidden="true" className="size-4" />
        )}
        {status === "copied"
          ? "Link copied"
          : status === "error"
            ? "Copy failed"
            : "Copy link"}
      </button>

      {canShare ? (
        <button type="button" onClick={nativeShare} className={buttonClass}>
          <Share2 aria-hidden="true" className="size-4" />
          Share
        </button>
      ) : null}

      <span className="sr-only" role="status" aria-live="polite">
        {status === "copied" ? "Link copied to clipboard" : ""}
        {status === "error" ? "Could not copy the link" : ""}
      </span>
    </div>
  );
}
