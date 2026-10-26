"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Check,
  Copy,
  Database,
  LayoutDashboard,
  RotateCw,
  ShieldAlert,
  Wifi,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";

const checks = [
  {
    icon: Wifi,
    title: "Check your connection",
    text: "A weak or dropped connection can stop a page from loading.",
  },
  {
    icon: Database,
    title: "Check Firebase",
    text: "Make sure the Firebase configuration is correct and the required indexes exist.",
  },
  {
    icon: ShieldAlert,
    title: "Check the server logs",
    text: "The technical details of this error are recorded there. Use the reference below to find it.",
  },
];

export default function AdminError({ error, reset }) {
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  const digest = error?.digest;

  // Browser console ma sirf development ke liye; user ko kuch nahi dikhta
  useEffect(() => {
    console.error("[admin] page error:", error);
  }, [error]);

  useEffect(() => () => clearTimeout(timer.current), []);

  function retry() {
    setPending(true);
    reset();
    // Agar dobara fail ho to boundary dubara render hota hai aur button wapas active ho
    timer.current = setTimeout(() => setPending(false), 1500);
  }

  async function copyDigest() {
    try {
      await navigator.clipboard.writeText(digest);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-8 py-10">
      <div role="alert" className="flex flex-col items-start gap-4">
        <h1 className="text-page-title">This page could not load</h1>
        <p className="text-muted-foreground leading-7">
          Something went wrong. Please try again. If the problem continues,
          check your Firebase configuration and indexes.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={retry}
            disabled={pending}
            aria-busy={pending}
          >
            <RotateCw
              aria-hidden="true"
              className={`size-4 ${pending ? "motion-safe:animate-spin" : ""}`}
            />
            {pending ? "Trying again…" : "Try again"}
          </Button>
          <Link
            href="/admin"
            className={buttonVariants({ variant: "outline" })}
          >
            <LayoutDashboard aria-hidden="true" className="size-4" />
            Back to dashboard
          </Link>
        </div>

        {digest ? (
          <div className="border-border bg-muted/40 flex w-full flex-wrap items-center gap-3 rounded-xl border p-3 text-sm">
            <span className="text-muted-foreground">Error reference</span>
            <code className="bg-background rounded px-2 py-1 font-mono text-xs break-all">
              {digest}
            </code>
            <button
              type="button"
              onClick={copyDigest}
              className="border-border bg-background hover:bg-muted focus-visible:ring-ring ml-auto inline-flex min-h-9 items-center gap-2 rounded-lg border px-3 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none"
            >
              {copied ? (
                <Check aria-hidden="true" className="text-primary size-3.5" />
              ) : (
                <Copy aria-hidden="true" className="size-3.5" />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {copied ? "Error reference copied" : ""}
            </span>
          </div>
        ) : null}
      </div>

      <section aria-labelledby="error-checks" className="flex flex-col gap-4">
        <h2 id="error-checks" className="text-card-title">
          What you can check
        </h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {checks.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="border-border bg-card flex flex-col gap-2 rounded-2xl border p-4"
            >
              <span
                aria-hidden="true"
                className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg"
              >
                <Icon className="size-[18px]" />
              </span>
              <p className="text-sm font-medium">{title}</p>
              <p className="text-muted-foreground text-xs leading-5">{text}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
