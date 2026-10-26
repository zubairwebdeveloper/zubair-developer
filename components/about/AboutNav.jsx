"use client";

import { useEffect, useState } from "react";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";

/** items: [{ id, label }]. Scroll karte waqt active section highlight hota hai. */
export function AboutNav({ items }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const els = items
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  return (
    <div className="border-border bg-background/80 sticky top-[var(--header-height,4rem)] z-30 border-b backdrop-blur">
      <nav
        aria-label="On this page"
        className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 sm:px-6"
      >
        <LayoutGroup id="about-nav">
          {items.map((item) => {
            const selected = active === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={selected ? "location" : undefined}
                className={`focus-visible:ring-ring relative inline-flex min-h-9 shrink-0 items-center rounded-full px-3.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 motion-reduce:transition-none ${
                  selected
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {selected ? (
                  <motion.span
                    layoutId="about-nav-pill"
                    aria-hidden="true"
                    className="bg-primary absolute inset-0 rounded-full"
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 36 }
                    }
                  />
                ) : null}
                <span className="relative z-10">{item.label}</span>
              </a>
            );
          })}
        </LayoutGroup>
      </nav>
    </div>
  );
}
