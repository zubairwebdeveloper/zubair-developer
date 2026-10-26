"use client";

import { useEffect, useState } from "react";

export function LegalToc({ items }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const targets = items
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [items]);

  const handleClick = (event, id) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    target.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
    window.history.replaceState(null, "", `#${id}`);
    setActive(id);
  };

  const links = (
    <ul className="flex flex-col border-l border-border">
      {items.map((item, index) => {
        const isActive = item.id === active;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={isActive ? "location" : undefined}
              onClick={(event) => handleClick(event, item.id)}
              className={`-ml-px flex min-h-10 items-center gap-2 border-l-2 py-2 pl-4 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isActive
                  ? "border-primary font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span aria-hidden="true" className="text-metric text-xs">
                {String(index + 1).padStart(2, "0")}
              </span>
              {item.title}
            </a>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Mobile: collapsible list */}
      <details className="group rounded-2xl border border-border bg-card lg:hidden print:hidden">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-3 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
          On this page
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-[[open]]:rotate-180"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m5 7.5 5 5 5-5" />
          </svg>
        </summary>
        <nav aria-label="On this page (mobile)" className="px-5 pb-4">
          {links}
        </nav>
      </details>

      {/* Desktop: always visible */}
      <nav aria-label="On this page" className="hidden lg:block">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          On this page
        </h2>
        {links}
      </nav>
    </>
  );
}
