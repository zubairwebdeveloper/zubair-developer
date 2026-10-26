"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const HeroScene = dynamic(() => import("@/components/home/HeroScene"), {
  ssr: false,
  // Shows the simple shapes while the 3D code downloads, so the area is never blank.
  loading: () => <CssFallback />,
});

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function isLowPowerDevice() {
  const memory = navigator.deviceMemory;
  const cores = navigator.hardwareConcurrency;
  return (memory && memory <= 2) || (cores && cores <= 2);
}

/** True when the visitor turned on Data Saver, so the 3D code should not be downloaded. */
function prefersSavedData() {
  return Boolean(navigator.connection?.saveData);
}

let cachedCapability;

function getCanRender3D() {
  cachedCapability ??=
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    !prefersSavedData() &&
    !isLowPowerDevice() &&
    hasWebGL();
  return cachedCapability;
}

const subscribe = () => () => {};

/**
 * Reads a shadcn/Tailwind CSS custom property (stored as "H S% L%", no
 * hsl() wrapper) and returns a CSS color string three.js's Color can parse.
 * Falls back to returning the raw value if it isn't in that format, and to
 * undefined if the variable isn't set, so callers can fall back to a default.
 */
function cssVarToThreeColor(varName) {
  if (typeof window === "undefined") return undefined;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  if (!raw) return undefined;

  const hslParts = raw.match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
  if (hslParts) {
    const [, h, s, l] = hslParts;
    return `hsl(${h}, ${s}%, ${l}%)`;
  }
  // Already a usable CSS color (hex, rgb(), oklch() with its own hsl fallback, etc).
  return raw;
}

/** Resolves the scene's palette from your theme tokens instead of hardcoding colors. */
function readThemeColors() {
  const primary = cssVarToThreeColor("--primary");
  const brand = cssVarToThreeColor("--brand");
  const ring = cssVarToThreeColor("--ring");

  return {
    primary,
    secondary: brand ?? primary,
    accent: ring ?? brand ?? primary,
  };
}

function CssFallback() {
  return (
    <div className="relative size-full" aria-hidden="true">
      <div className="absolute top-[12%] left-[18%] size-40 rotate-12 rounded-3xl bg-primary/90 shadow-xl" />
      <div className="absolute right-[14%] bottom-[16%] size-28 -rotate-6 rounded-full border-[14px] border-brand" />
      <div className="absolute top-[18%] right-[22%] size-16 rotate-45 rounded-lg border-2 border-brand/60" />
    </div>
  );
}

/**
 * HeroVisual
 *
 * @param {object} [colors]  Optional { primary, secondary, accent } for the 3D scene.
 *   When omitted, colors are read from your --primary/--brand/--ring theme
 *   tokens at mount (and re-read on theme changes), so the scene follows
 *   light/dark mode automatically without hardcoded hex values.
 */
export function HeroVisual({ colors }) {
  const containerRef = useRef(null);
  const [inView, setInView] = useState(true);
  const [themeColors, setThemeColors] = useState(undefined);

  const canRender3D = useSyncExternalStore(
    subscribe,
    getCanRender3D,
    () => false,
  );

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) =>
      setInView(entry.isIntersecting),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // An explicit colors prop always wins; nothing to resolve from the theme.
    if (colors) return;

    const sync = () => setThemeColors(readThemeColors());
    sync();

    // Re-read whenever the theme toggles (class or data-theme attribute change).
    const root = document.documentElement;
    const observer = new MutationObserver(sync);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    return () => observer.disconnect();
  }, [colors]);

  return (
    // Purely decorative, so assistive technology skips it instead of reading a label.
    <div
      ref={containerRef}
      aria-hidden="true"
      className="relative aspect-square w-full max-w-md"
    >
      {canRender3D ? (
        <div className="size-full motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700">
          <HeroScene active={inView} colors={colors ?? themeColors} />
        </div>
      ) : (
        <CssFallback />
      )}
    </div>
  );
}
