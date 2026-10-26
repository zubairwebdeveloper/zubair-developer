// components/layout/ThemeToggle.jsx
"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import { Check, Laptop, Moon, Palette, Sun } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils/cn";

const OPTIONS = [
  {
    value: "light",
    label: "Light",
    description: "Bright and clean",
    icon: Sun,
    preview: "#ffffff",
  },
  {
    value: "dark",
    label: "Dark",
    description: "Easy on the eyes",
    icon: Moon,
    preview: "#0b1220",
  },
  {
    value: "system",
    label: "System",
    description: "Follow your device",
    icon: Laptop,
    preview: "linear-gradient(135deg, #ffffff 50%, #0b1220 50%)",
  },
];

// Cycle order for the keyboard shortcut
const CYCLE = OPTIONS.map((option) => option.value);

const REVEAL_DURATION = 450; // ms for the circular theme reveal

/** Where the circular reveal starts: the toggle button, else the click, else the screen center. */
function getOrigin(trigger, event) {
  if (trigger) {
    const rect = trigger.getBoundingClientRect();
    if (rect.width > 0) {
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
  }
  if (event && event.clientX > 0) return { x: event.clientX, y: event.clientY };
  return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
}

export const ThemeToggle = memo(function ThemeToggle({
  className,
  align = "end",
  sideOffset = 10,
  showLabel = false,
  shortcut = true, // set to false to disable Alt + Shift + T
}) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const triggerRef = useRef(null);

  // The saved theme is only known on the client.
  useEffect(() => {
    setMounted(true);
    const platform =
      navigator.userAgentData?.platform ||
      navigator.platform ||
      navigator.userAgent;
    setIsMac(/Mac|iPhone|iPad/i.test(platform));
  }, []);

  const currentTheme = mounted ? (theme ?? "system") : "system";
  const current = OPTIONS.find((option) => option.value === currentTheme);
  const currentLabel = mounted ? (current?.label ?? "System") : "Theme";

  /* Switch theme. Browsers with the View Transitions API get a circular reveal
     from the button; everything else (and reduced-motion users) switch instantly. */
  const applyTheme = useCallback(
    (value, event) => {
      const label = OPTIONS.find((o) => o.value === value)?.label ?? value;
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (typeof document.startViewTransition !== "function" || reduce) {
        setTheme(value);
        setAnnouncement(`Theme changed to ${label}`);
        return;
      }

      const { x, y } = getOrigin(triggerRef.current, event);
      const radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );

      const transition = document.startViewTransition(() => {
        flushSync(() => setTheme(value));
      });

      transition.ready
        .then(() => {
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${radius}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration: REVEAL_DURATION,
              easing: "ease-in-out",
              pseudoElement: "::view-transition-new(root)",
            },
          );
        })
        .catch(() => {});

      setAnnouncement(`Theme changed to ${label}`);
    },
    [setTheme],
  );

  // Alt + Shift + T cycles Light → Dark → System from anywhere on the page.
  useEffect(() => {
    if (!shortcut || !mounted) return undefined;

    const onKeyDown = (event) => {
      if (
        event.code !== "KeyT" ||
        !event.altKey ||
        !event.shiftKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.isComposing ||
        event.defaultPrevented
      ) {
        return;
      }
      event.preventDefault();
      const next = CYCLE[(CYCLE.indexOf(currentTheme) + 1) % CYCLE.length];
      applyTheme(next);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shortcut, mounted, currentTheme, applyTheme]);

  const shortcutKeys = isMac ? ["⌥", "⇧", "T"] : ["Alt", "Shift", "T"];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          ref={triggerRef}
          type="button"
          aria-label={`Change appearance. Current theme: ${currentLabel}`}
          aria-keyshortcuts={shortcut ? "Alt+Shift+T" : undefined}
          title={`Theme: ${currentLabel}`}
          className={cn(
            buttonVariants({
              variant: "ghost",
              size: showLabel ? "default" : "icon",
            }),
            "group relative isolate shrink-0 cursor-pointer gap-2 overflow-hidden rounded-xl",
            "border border-transparent transition-all duration-200",
            "hover:border-border hover:bg-accent/70",
            "active:scale-95",
            "focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "motion-reduce:transform-none motion-reduce:transition-none",
            showLabel && "px-3",
            className,
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0 -z-10",
              "bg-gradient-to-br from-primary/10 via-transparent to-brand/15",
              "opacity-0 transition-opacity duration-200 group-hover:opacity-100",
              "motion-reduce:transition-none",
            )}
          />

          <span className="relative grid size-5 shrink-0 place-items-center">
            {mounted ? (
              <>
                <Sun
                  aria-hidden="true"
                  className={cn(
                    "absolute size-[18px] transition-all duration-300 motion-reduce:transition-none",
                    currentTheme === "light"
                      ? "rotate-0 scale-100 text-warning"
                      : "rotate-90 scale-0",
                  )}
                />
                <Moon
                  aria-hidden="true"
                  className={cn(
                    "absolute size-[18px] transition-all duration-300 motion-reduce:transition-none",
                    currentTheme === "dark"
                      ? "rotate-0 scale-100 text-primary"
                      : "rotate-90 scale-0",
                  )}
                />
                <Laptop
                  aria-hidden="true"
                  className={cn(
                    "absolute size-[18px] transition-all duration-300 motion-reduce:transition-none",
                    currentTheme === "system"
                      ? "rotate-0 scale-100 text-primary"
                      : "-rotate-90 scale-0",
                  )}
                />
              </>
            ) : (
              <Palette
                aria-hidden="true"
                className="size-[18px] text-muted-foreground"
              />
            )}
          </span>

          {showLabel ? (
            <span className="text-sm font-medium">{currentLabel}</span>
          ) : null}
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align={align}
          sideOffset={sideOffset}
          className={cn(
            "z-[100] w-[min(19rem,calc(100vw-1.5rem))] p-2",
            "rounded-2xl border border-border/80",
            "bg-popover/95 text-popover-foreground shadow-xl",
            "backdrop-blur-xl",
          )}
        >
          {/* Base UI: a label must live inside a group */}
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-3 pb-2 pt-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Palette aria-hidden="true" className="size-4 text-primary" />
                Appearance
              </span>
              <span className="mt-1 block text-xs font-normal text-muted-foreground">
                Choose how the site looks
              </span>
            </DropdownMenuLabel>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-1" />

          <DropdownMenuGroup className="space-y-1">
            {OPTIONS.map(
              ({ value, label, description, icon: Icon, preview }) => {
                const selected = mounted && currentTheme === value;

                return (
                  <DropdownMenuItem
                    key={value}
                    onClick={(event) => applyTheme(value, event)}
                    className={cn(
                      "group flex cursor-pointer items-center gap-3",
                      "rounded-xl px-3 py-2.5 outline-none",
                      "transition-colors duration-150",
                      selected && "bg-primary/10 text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-xl",
                        "border border-border/70 bg-muted/60",
                        "transition-all duration-200",
                        "group-hover:scale-105 group-hover:border-primary/30",
                        selected && "border-primary/30 bg-primary/10",
                        "motion-reduce:transform-none motion-reduce:transition-none",
                      )}
                    >
                      <Icon
                        aria-hidden="true"
                        className={cn(
                          "size-[18px] text-muted-foreground transition-colors",
                          "group-hover:text-primary",
                          selected && "text-primary",
                          value === "light" && selected && "text-warning",
                        )}
                      />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{label}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {description}
                      </span>
                    </span>

                    {/* Mini preview of the theme + selected check */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "size-4 shrink-0 rounded-full border border-border",
                        selected &&
                          "ring-2 ring-primary/60 ring-offset-1 ring-offset-popover",
                      )}
                      style={{ background: preview }}
                    />
                    <span className="grid size-5 shrink-0 place-items-center">
                      {selected ? (
                        <Check
                          aria-label="Selected"
                          className="size-4 text-primary"
                        />
                      ) : null}
                    </span>
                  </DropdownMenuItem>
                );
              },
            )}
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-2" />

          <div className="flex items-center justify-between gap-3 px-3 py-1">
            <span className="text-xs text-muted-foreground">
              Active appearance
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2 py-1 text-[11px] font-medium">
              <span
                aria-hidden="true"
                className={cn(
                  "size-1.5 rounded-full",
                  mounted ? "bg-success" : "bg-muted-foreground",
                )}
              />
              {mounted
                ? `${currentLabel}${
                    currentTheme === "system" && resolvedTheme
                      ? ` · ${resolvedTheme}`
                      : ""
                  }`
                : "Loading"}
            </span>
          </div>

          {shortcut ? (
            <div className="mt-1 flex items-center justify-between gap-3 px-3 py-1">
              <span className="text-xs text-muted-foreground">Cycle theme</span>
              <span className="flex items-center gap-1" aria-hidden="true">
                {shortcutKeys.map((key) => (
                  <kbd
                    key={key}
                    className="rounded border border-border bg-muted/50 px-1.5 py-0.5 font-sans text-[11px] font-medium leading-none text-muted-foreground"
                  >
                    {key}
                  </kbd>
                ))}
              </span>
            </div>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Announces keyboard / menu changes to screen readers */}
      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </>
  );
});

ThemeToggle.displayName = "ThemeToggle";

export default ThemeToggle;
