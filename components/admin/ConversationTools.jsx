"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, Check, Copy, Link2, Printer } from "lucide-react";

const button =
  "border-border bg-background hover:bg-muted focus-visible:ring-ring inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none";

export function ConversationTools({ conversationId, latestAnchorId }) {
  const [status, setStatus] = useState("idle"); // idle | id | link | error
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  function flash(next) {
    setStatus(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2000);
  }

  async function copy(text, kind) {
    try {
      await navigator.clipboard.writeText(text);
      flash(kind);
    } catch {
      flash("error");
    }
  }

  function jumpToLatest() {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    document.getElementById(latestAnchorId)?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "center",
    });
  }

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <button type="button" onClick={jumpToLatest} className={button}>
        <ArrowDown aria-hidden="true" className="size-4" />
        Latest message
      </button>
      <button
        type="button"
        onClick={() => copy(conversationId, "id")}
        className={button}
      >
        {status === "id" ? (
          <Check aria-hidden="true" className="text-primary size-4" />
        ) : (
          <Copy aria-hidden="true" className="size-4" />
        )}
        {status === "id" ? "ID copied" : "Copy ID"}
      </button>
      <button
        type="button"
        onClick={() => copy(window.location.href, "link")}
        className={button}
      >
        {status === "link" ? (
          <Check aria-hidden="true" className="text-primary size-4" />
        ) : (
          <Link2 aria-hidden="true" className="size-4" />
        )}
        {status === "link" ? "Link copied" : "Copy link"}
      </button>
      <button type="button" onClick={() => window.print()} className={button}>
        <Printer aria-hidden="true" className="size-4" />
        Print
      </button>

      <span className="sr-only" role="status" aria-live="polite">
        {status === "id" ? "Conversation ID copied" : ""}
        {status === "link" ? "Link copied" : ""}
        {status === "error" ? "Could not copy" : ""}
      </span>
    </div>
  );
}
