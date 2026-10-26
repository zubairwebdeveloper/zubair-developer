"use client";

import { useEffect, useState } from "react";
import { Check, Circle } from "lucide-react";

import { ProgressBar } from "@/components/auth/ProgressBar";
import { passwordStrength } from "@/lib/auth/password";
import { cn } from "@/lib/utils/cn";

const barColors = ["", "bg-destructive", "bg-warning", "bg-info", "bg-success"];
const textColors = [
  "text-muted-foreground",
  "text-destructive",
  "text-warning",
  "text-info",
  "text-success",
];

/** Wait for typing to pause before telling screen readers about a change. */
const ANNOUNCE_DELAY_MS = 700;

export function PasswordStrength({ value }) {
  const strength = passwordStrength(value ?? "");
  const [announcement, setAnnouncement] = useState("");

  const metCount = strength.checks.filter((check) => check.passed).length;
  const totalChecks = strength.checks.length;

  // Announce the strength only when the level changes and typing has paused,
  // so screen reader users are not interrupted on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnnouncement(
        strength.label
          ? `Password strength: ${strength.label}. ${metCount} of ${totalChecks} requirements met.`
          : "",
      );
    }, ANNOUNCE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [strength.level, strength.label, metCount, totalChecks]);

  return (
    <div className="flex flex-col gap-2.5 rounded-lg border border-border bg-muted/30 p-3">
      <ProgressBar
        role="meter"
        value={strength.percent}
        label="Password strength"
        valueText={strength.label || undefined}
        barClassName={cn(
          "transition-colors duration-300 motion-reduce:transition-none",
          barColors[strength.level],
        )}
      />

      <div className="flex min-h-5 flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <p>
          {strength.label ? (
            <>
              Strength:{" "}
              <span className={cn("font-medium", textColors[strength.level])}>
                {strength.label}
              </span>
            </>
          ) : (
            "Choose a strong password."
          )}
        </p>
        {value ? (
          <p className="text-xs tabular-nums">
            {metCount} of {totalChecks} requirements met
          </p>
        ) : null}
      </div>

      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>

      <ul className="grid gap-x-4 gap-y-1.5 text-[13px] leading-5 sm:grid-cols-2">
        {strength.checks.map((check) => (
          <li
            key={check.id}
            className={cn(
              "flex items-center gap-2 transition-colors duration-200 motion-reduce:transition-none",
              check.passed ? "text-success" : "text-muted-foreground",
            )}
          >
            {check.passed ? (
              <Check aria-hidden="true" className="size-3.5 shrink-0" />
            ) : (
              <Circle aria-hidden="true" className="size-3.5 shrink-0" />
            )}
            <span>
              {check.label}
              <span className="sr-only">
                {check.passed ? " (done)" : " (not yet)"}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
