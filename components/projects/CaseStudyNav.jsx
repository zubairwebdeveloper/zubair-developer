"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const DEFAULT_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "challenge", label: "Challenge" },
  { id: "solution", label: "Solution" },
  { id: "outcome", label: "Outcome" },
];

/**
 * CaseStudyNav
 *
 * Sticky section navigation for a case study page, with scroll-spy and
 * optional previous / next project links.
 *
 * @param {Array}  [sections]   [{ id, label }]. Each id must match an element id on the page.
 * @param {string} [backHref]   Link for the back button. Default "/projects".
 * @param {string} [backLabel]  Label for the back button.
 * @param {object} [prev]       { href, title } for the previous project.
 * @param {object} [next]       { href, title } for the next project.
 * @param {string} [className]  Extra classes for the wrapper.
 */
export function CaseStudyNav({
  sections = DEFAULT_SECTIONS,
  backHref = "/projects",
  backLabel = "All projects",
  prev,
  next,
  className = "",
}) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  // Scroll-spy: highlight the section currently in view.
  useEffect(() => {
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter(Boolean);

    if (elements.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-25% 0px -65% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  function handleClick(event, id) {
    const target = document.getElementById(id);
    if (!target) return; // let the browser handle the hash normally
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
    setActiveId(id);
  }

  return (
    <nav
      aria-label="Case study"
      className={`sticky top-16 z-30 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70 ${className}`}
    >
      <div className="mx-auto flex w-full max-w-5xl items-center gap-4 px-4 py-2">
        <Link
          href={backHref}
          className="shrink-0 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <span aria-hidden="true">←</span> {backLabel}
        </Link>

        <ul className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sections.map((section) => {
            const isActive = activeId === section.id;
            return (
              <li key={section.id} className="shrink-0">
                <a
                  href={`#${section.id}`}
                  onClick={(event) => handleClick(event, section.id)}
                  aria-current={isActive ? "true" : undefined}
                  className={`block border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {section.label}
                </a>
              </li>
            );
          })}
        </ul>

        {(prev || next) && (
          <div className="hidden shrink-0 items-center gap-2 md:flex">
            {prev ? (
              <Link
                href={prev.href}
                title={prev.title}
                aria-label={`Previous project: ${prev.title}`}
                className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <span aria-hidden="true">←</span> Prev
              </Link>
            ) : null}
            {next ? (
              <Link
                href={next.href}
                title={next.title}
                aria-label={`Next project: ${next.title}`}
                className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Next <span aria-hidden="true">→</span>
              </Link>
            ) : null}
          </div>
        )}
      </div>
    </nav>
  );
}

export default CaseStudyNav;
