"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiArrowRight, FiX } from "react-icons/fi";

import { Button } from "@/components/ui/button";

const COLLAPSE_MS = 250;

export function AnnouncementBar({ announcement }) {
  const [closing, setClosing] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Unmount after the collapse transition has finished.
  useEffect(() => {
    if (!closing) return undefined;
    const timer = setTimeout(() => setDismissed(true), COLLAPSE_MS);
    return () => clearTimeout(timer);
  }, [closing]);

  if (!announcement || dismissed) return null;

  return (
    <div
      role="region"
      aria-label="Announcement"
      className={`grid transition-[grid-template-rows,opacity] duration-250 ease-out motion-reduce:transition-none ${
        closing ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
      }`}
    >
      <div className="overflow-hidden">
        <div className="relative isolate bg-primary text-primary-foreground">
          {/* Subtle highlight and bottom edge for depth */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,transparent,hsl(var(--primary-foreground)/0.12),transparent)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-primary-foreground/20"
          />

          <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 sm:gap-3 sm:px-6">
            <p className="text-balance text-center text-sm leading-snug">
              <span className="font-medium">{announcement.message}</span>
              {announcement.href ? (
                <>
                  {" "}
                  <Link
                    href={announcement.href}
                    className="group inline-flex items-center gap-1 whitespace-nowrap rounded-sm font-semibold underline decoration-primary-foreground/40 underline-offset-4 transition-colors hover:decoration-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/70 focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                  >
                    {announcement.linkLabel ?? "Learn more"}
                    <FiArrowRight
                      aria-hidden="true"
                      className="size-3.5 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5"
                    />
                  </Link>
                </>
              ) : null}
            </p>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Dismiss announcement"
              onClick={() => setClosing(true)}
              className="shrink-0 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground focus-visible:ring-primary-foreground/70"
            >
              <FiX aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
