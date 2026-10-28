"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { buttonVariants } from "@/components/ui/button";
import { AutomationPanel } from "@/components/home/hero-visual/AutomationPanel";
import { BackendPanel } from "@/components/home/hero-visual/BackendPanel";
import { ChatbotPanel } from "@/components/home/hero-visual/ChatbotPanel";
import { ConnectionLines } from "@/components/home/hero-visual/ConnectionLines";
import { FloatingChips } from "@/components/home/hero-visual/FloatingChips";
import { FrontendPanel } from "@/components/home/hero-visual/FrontendPanel";
import { ShowcaseTabs } from "@/components/home/hero-visual/ShowcaseTabs";
import { canRenderHero3D } from "@/lib/hero/can-render-3d";
import {
  getNextTabIndex,
  SHOWCASE_TABS,
  shouldAutoCycle,
} from "@/lib/hero/showcase";
import { cn } from "@/lib/utils/cn";

const HeroScene = dynamic(() => import("@/components/home/HeroScene"), {
  ssr: false,
  loading: () => <div className="size-full" aria-hidden="true" />,
});

const SHOWCASE_PANELS = {
  frontend: FrontendPanel,
  backend: BackendPanel,
  chatbot: ChatbotPanel,
  automation: AutomationPanel,
};

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

let cachedDeviceCapabilities;

function getCanRender3D() {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  cachedDeviceCapabilities ??= {
    saveData: Boolean(navigator.connection?.saveData),
    deviceMemory: navigator.deviceMemory,
    hardwareConcurrency: navigator.hardwareConcurrency,
    hasWebGL: hasWebGL(),
  };
  return canRenderHero3D({
    ...cachedDeviceCapabilities,
    prefersReducedMotion: media.matches,
  });
}

function subscribeToMotionPreference(callback) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function subscribeToVisibility(callback) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}

function getPageHidden() {
  return document.visibilityState !== "visible";
}

function getServerPageHidden() {
  return true;
}

function cssVarToColor(varName) {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  if (!raw) return undefined;

  const hslParts = raw.match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
  if (hslParts) {
    const [, h, s, l] = hslParts;
    return `hsl(${h}, ${s}%, ${l}%)`;
  }
  return raw;
}

function readThemeColors() {
  return {
    primary: cssVarToColor("--highlight") ?? cssVarToColor("--primary"),
    secondary: cssVarToColor("--violet"),
    accent: cssVarToColor("--brand"),
    surface: cssVarToColor("--card"),
    foreground: cssVarToColor("--foreground"),
  };
}

function scheduleIdle(callback) {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(callback, { timeout: 1400 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(callback, 450);
  return () => window.clearTimeout(id);
}

function CssFallback() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-[inherit]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 78% 12%, color-mix(in srgb, var(--highlight) 18%, transparent), transparent 44%), radial-gradient(circle at 12% 84%, color-mix(in srgb, var(--violet) 12%, transparent), transparent 42%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in srgb, var(--border) 38%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--border) 38%, transparent) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          maskImage:
            "radial-gradient(ellipse at center, var(--foreground), transparent 78%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-card/40 via-transparent to-background/50" />
    </div>
  );
}

function PanelContent({ activeTab, inView, reducedMotion }) {
  const Panel = SHOWCASE_PANELS[activeTab.id];
  return <Panel inView={inView} reducedMotion={reducedMotion} />;
}

export function HeroVisual({ colors }) {
  const containerRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [idle, setIdle] = useState(false);
  const [themeColors, setThemeColors] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [userSelected, setUserSelected] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeToMotionPreference,
    getReducedMotion,
    () => true,
  );
  const pageHidden = useSyncExternalStore(
    subscribeToVisibility,
    getPageHidden,
    getServerPageHidden,
  );

  const tiltX = useSpring(useMotionValue(0), {
    stiffness: 170,
    damping: 24,
    mass: 0.45,
  });
  const tiltY = useSpring(useMotionValue(0), {
    stiffness: 170,
    damping: 24,
    mass: 0.45,
  });

  const capable = useSyncExternalStore(
    subscribeToMotionPreference,
    getCanRender3D,
    () => false,
  );

  const activeTab = SHOWCASE_TABS[activeIndex];
  const cycling = shouldAutoCycle({
    reducedMotion,
    hovered,
    focused,
    hidden: pageHidden,
    inView,
    userSelected,
  });
  const resolvedColors = themeColors;
  const showScene = Boolean(capable && idle && inView && resolvedColors);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.15 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => scheduleIdle(() => setIdle(true)), []);

  useEffect(() => {
    let frame = 0;
    const syncColors = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setThemeColors(colors ?? readThemeColors());
      });
    };

    syncColors();
    if (colors) return () => cancelAnimationFrame(frame);

    const observer = new MutationObserver(syncColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [colors]);

  useEffect(() => {
    if (!cycling) return undefined;
    const timer = window.setTimeout(() => {
      setActiveIndex((current) =>
        getNextTabIndex(current, SHOWCASE_TABS.length),
      );
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [activeIndex, cycling]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || reducedMotion) return undefined;

    const finePointer = window.matchMedia("(pointer: fine)");
    if (!finePointer.matches) return undefined;

    const onPointerMove = (event) => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
      const y = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
      tiltX.set(Math.max(-6, Math.min(6, y * -8)));
      tiltY.set(Math.max(-6, Math.min(6, x * 8)));
    };
    const resetTilt = () => {
      tiltX.set(0);
      tiltY.set(0);
    };

    element.addEventListener("pointermove", onPointerMove);
    element.addEventListener("pointerleave", resetTilt);
    finePointer.addEventListener("change", resetTilt);
    return () => {
      element.removeEventListener("pointermove", onPointerMove);
      element.removeEventListener("pointerleave", resetTilt);
      finePointer.removeEventListener("change", resetTilt);
      resetTilt();
    };
  }, [reducedMotion, tiltX, tiltY]);

  function selectTab(index, { user = false } = {}) {
    setActiveIndex(index);
    if (user) setUserSelected(true);
  }

  const tabPanel = (
    <div
      id="hero-showcase-panel"
      role="tabpanel"
      aria-labelledby={`hero-showcase-tab-${activeIndex}`}
      tabIndex={0}
      className="relative min-h-0 flex-1 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
    >
      <ul className="sr-only" aria-label={`${activeTab.label} technologies`}>
        {activeTab.technologies.map((technology) => (
          <li key={technology}>{technology}</li>
        ))}
      </ul>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeTab.id}
          initial={
            reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 6 }
          }
          animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
          exit={
            reducedMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.985, y: -4, filter: "blur(3px)" }
          }
          transition={{ duration: reducedMotion ? 0.12 : 0.28 }}
          className="absolute inset-0"
        >
          <PanelContent
            activeTab={activeTab}
            inView={inView}
            reducedMotion={reducedMotion}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );

  return (
    <section
      role="group"
      aria-label="Showcase of what I build: frontend, backend, chatbots and automation"
      className="w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => {
        setFocused(true);
        tiltX.set(0);
        tiltY.set(0);
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocused(false);
        }
      }}
    >
      <motion.div
        ref={containerRef}
        style={{
          rotateX: tiltX,
          rotateY: tiltY,
          transformPerspective: 1100,
        }}
        className="relative isolate aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] shadow-soft md:aspect-[5/6]"
      >
        <CssFallback />
        {showScene ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[1] opacity-35"
          >
            <HeroScene
              active={inView && !pageHidden}
              activeTab={activeTab.id}
              colors={resolvedColors}
            />
          </div>
        ) : null}

        <motion.div
          aria-hidden="true"
          animate={
            !reducedMotion && inView
              ? { rotate: 360 }
              : { rotate: 0 }
          }
          transition={
            !reducedMotion && inView
              ? { duration: 32, repeat: Infinity, ease: "linear" }
              : { duration: 0 }
          }
          className="pointer-events-none absolute -inset-[45%] z-[2] rounded-[2rem] opacity-55"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, var(--highlight) 55deg, transparent 105deg, var(--violet) 210deg, transparent 270deg, var(--highlight) 330deg, transparent 360deg)",
          }}
        />
        <div className="absolute inset-px z-[3] overflow-hidden rounded-[calc(1.75rem-1px)] border border-border/70 bg-card/80 backdrop-blur-xl">
          <ConnectionLines
            reducedMotion={reducedMotion}
            inView={inView}
          />
          <div className="relative z-10 flex h-full flex-col gap-2.5 p-3 sm:gap-3 sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary sm:text-xs">
                  What I build
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">
                  Frontend to backend, plus automation
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/70 bg-background/70 px-2 py-1 text-[9px] font-medium text-muted-foreground sm:text-[10px]">
                <span className="size-1.5 rounded-full bg-success" />
                Full stack + automation
              </span>
            </div>

            <ShowcaseTabs
              activeIndex={activeIndex}
              onSelect={selectTab}
              reducedMotion={reducedMotion}
              cycling={cycling}
            />

            {tabPanel}
          </div>
          <FloatingChips
            technologies={activeTab.technologies}
            reducedMotion={reducedMotion}
            inView={inView}
          />
        </div>
      </motion.div>

      <div className="mt-4 flex flex-col gap-3 sm:mt-5 sm:flex-row sm:items-center sm:justify-between">
        <p
          key={activeTab.id}
          className="text-pretty text-sm font-medium leading-relaxed text-foreground sm:max-w-[23ch]"
        >
          {activeTab.caption}
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/services"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "group gap-1.5",
            )}
          >
            See services
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none">
              &rarr;
            </span>
          </Link>
          <Link
            href="/hire-me"
            className={cn(
              buttonVariants({ size: "sm" }),
              "group gap-1.5",
            )}
          >
            Start a project
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none">
              &rarr;
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
