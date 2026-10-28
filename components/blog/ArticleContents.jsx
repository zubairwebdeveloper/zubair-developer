"use client";

import { useEffect, useState } from "react";

export function ArticleContents({ items }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);
    if (!headings.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 },
    );
    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  const links = (
    <ol className="flex flex-col gap-1">
      {items.map((item, index) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            aria-current={active === item.id ? "location" : undefined}
            className={`flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${
              item.type === "subheading" ? "ml-4" : ""
            } ${
              active === item.id
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span
              aria-hidden="true"
              className="w-5 shrink-0 text-xs tabular-nums text-muted-foreground/70"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="line-clamp-2">{item.title}</span>
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <>
      <details className="rounded-2xl border border-border bg-card lg:hidden">
        <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-3 px-4 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring">
          In this article
          <span aria-hidden="true" className="text-muted-foreground">
            {items.length} sections
          </span>
        </summary>
        <nav aria-label="Article contents" className="px-2 pb-3">
          {links}
        </nav>
      </details>

      <nav
        aria-label="Article contents"
        className="sticky top-24 hidden h-fit rounded-2xl border border-border bg-card p-3 lg:block"
      >
        <h2 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          In this article
        </h2>
        {links}
      </nav>
    </>
  );
}
