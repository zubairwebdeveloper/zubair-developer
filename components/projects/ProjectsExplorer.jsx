"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { FiRotateCcw, FiSearch, FiX } from "react-icons/fi";

import { ProjectCard } from "@/components/projects/ProjectCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getProjectCategoryGroups,
  getProjectCategoryKey,
} from "@/lib/projects/category";
import { cn } from "@/lib/utils/cn";

const PAGE_SIZE = 9; // cards shown before "Show more"
const TOP_TECH = 8; // technology chips shown before "More"
const ABOVE_FOLD = 3; // first cards load their image with priority

const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "az", label: "A to Z" },
  { value: "za", label: "Z to A" },
];

const asArray = (value) => (Array.isArray(value) ? value : []);

const chipBase =
  "min-h-9 shrink-0 cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-medium outline-none transition-colors duration-200 motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-sm";

const chipOn = "border-foreground bg-foreground text-background";
const chipOff =
  "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground";

export function ProjectsExplorer({ projects: projectsProp }) {
  const projects = useMemo(() => asArray(projectsProp), [projectsProp]);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [tech, setTech] = useState("all");
  const [sort, setSort] = useState("default");
  const [limitState, setLimitState] = useState({
    filterKey: null,
    count: PAGE_SIZE,
  });
  const [showAllTech, setShowAllTech] = useState(false);
  const [ready, setReady] = useState(false);
  const searchRef = useRef(null);

  const deferredQuery = useDeferredValue(query);
  const filterKey = `${deferredQuery}\0${category}\0${tech}\0${sort}`;
  const limit =
    limitState.filterKey === filterKey ? limitState.count : PAGE_SIZE;

  /* ---------- Derived option lists ---------- */

  const categories = useMemo(() => {
    return [
      { value: "all", label: "All", count: projects.length },
      ...getProjectCategoryGroups(projects).map((group) => ({
        value: group.key,
        label: group.label,
        count: group.count,
      })),
    ];
  }, [projects]);

  // Technologies, most used first
  const technologies = useMemo(() => {
    const counts = new Map();
    projects.forEach((p) =>
      asArray(p.technologies)
        .filter(Boolean)
        .forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)),
    );
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name]) => name);
  }, [projects]);

  const visibleTech = showAllTech
    ? technologies
    : technologies.slice(0, TOP_TECH);

  /* ---------- Restore filters from the URL (e.g. /projects?category=Web&tech=React) ---------- */

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") ?? "";
    const c = params.get("category");
    const t = params.get("tech");
    const s = params.get("sort");

    // URL filters are only available client-side after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (q) setQuery(q);
    if (c && categories.some((item) => item.value === c)) setCategory(c);
    else if (
      c &&
      getProjectCategoryKey(c) &&
      categories.some((item) => item.value === getProjectCategoryKey(c))
    ) {
      setCategory(getProjectCategoryKey(c));
    }
    if (t && technologies.includes(t)) {
      setTech(t);
      if (technologies.indexOf(t) >= TOP_TECH) setShowAllTech(true);
    }
    if (s && SORT_OPTIONS.some((o) => o.value === s)) setSort(s);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Keep the URL in sync without adding history entries */
  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category !== "all") params.set("category", category);
    if (tech !== "all") params.set("tech", tech);
    if (sort !== "default") params.set("sort", sort);
    const qs = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`,
    );
  }, [ready, query, category, tech, sort]);

  /* ---------- Filtering + sorting ---------- */

  const filtered = useMemo(() => {
    const term = deferredQuery.trim().toLowerCase();

    const list = projects.filter((project) => {
      const matchesCategory =
        category === "all" ||
        getProjectCategoryKey(project.category) === category;
      const matchesTech =
        tech === "all" || asArray(project.technologies).includes(tech);
      const matchesQuery =
        !term ||
        `${project.title ?? ""} ${project.summary ?? ""} ${project.category ?? ""} ${asArray(
          project.technologies,
        ).join(" ")}`
          .toLowerCase()
          .includes(term);
      return matchesCategory && matchesTech && matchesQuery;
    });

    if (sort === "az") {
      return [...list].sort((a, b) =>
        String(a.title).localeCompare(String(b.title)),
      );
    }
    if (sort === "za") {
      return [...list].sort((a, b) =>
        String(b.title).localeCompare(String(a.title)),
      );
    }
    return list;
  }, [projects, deferredQuery, category, tech, sort]);

  const shown = filtered.slice(0, limit);
  const remaining = filtered.length - shown.length;

  const hasFilters =
    query.trim() !== "" ||
    category !== "all" ||
    tech !== "all" ||
    sort !== "default";

  const reset = () => {
    setQuery("");
    setCategory("all");
    setTech("all");
    setSort("default");
    searchRef.current?.focus();
  };

  /* ---------- Empty catalogue ---------- */

  if (projects.length === 0) {
    return (
      <EmptyState
        title="Projects are coming soon"
        description="Case studies will appear here once they are published."
        action={{ label: "Discuss your project", href: "/hire-me" }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <style>{`
        @keyframes project-rise {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .project-rise { animation: none !important; opacity: 1 !important; }
        }
      `}</style>

      {/* Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <FiSearch
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape" && query) {
                  event.preventDefault();
                  setQuery("");
                }
              }}
              placeholder="Search by name, topic or technology…"
              aria-label="Search projects"
              className="px-9 [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  searchRef.current?.focus();
                }}
                aria-label="Clear search"
                className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <FiX aria-hidden="true" className="size-4" />
              </button>
            ) : null}
          </div>

          {/* Category chips: one swipeable row on mobile, wrapped on sm+ */}
          <div
            data-no-snake=""
            role="group"
            aria-label="Filter by category"
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden"
          >
            {categories.map((item) => {
              const selected = category === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setCategory(item.value)}
                  className={cn(chipBase, selected ? chipOn : chipOff)}
                >
                  {item.label}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "ml-1.5 tabular-nums",
                      selected ? "opacity-70" : "text-muted-foreground/70",
                    )}
                  >
                    {item.count}
                  </span>
                  <span className="sr-only"> ({item.count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Technology filter */}
        {technologies.length > 1 ? (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Technology
            </p>
            <div
              role="group"
              aria-label="Filter by technology"
              className="flex flex-wrap gap-2"
            >
              {visibleTech.map((name) => {
                const selected = tech === name;
                return (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setTech(selected ? "all" : name)}
                    className={cn(
                      chipBase,
                      "min-h-8 px-3 py-1 text-xs",
                      selected ? chipOn : chipOff,
                    )}
                  >
                    {name}
                  </button>
                );
              })}
              {technologies.length > TOP_TECH ? (
                <button
                  type="button"
                  aria-expanded={showAllTech}
                  onClick={() => setShowAllTech((value) => !value)}
                  className="min-h-8 rounded-full px-3 py-1 text-xs font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {showAllTech
                    ? "Show fewer"
                    : `+${technologies.length - TOP_TECH} more`}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Result summary + sort + reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
          <p
            role="status"
            aria-live="polite"
            className="text-sm text-muted-foreground"
          >
            {filtered.length === projects.length
              ? `${filtered.length} ${filtered.length === 1 ? "project" : "projects"}`
              : `${filtered.length} of ${projects.length} projects`}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {hasFilters ? (
              <button
                type="button"
                onClick={reset}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-2 text-sm font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
              >
                <FiRotateCcw aria-hidden="true" className="size-3.5" />
                Reset filters
              </button>
            ) : null}

            <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              Sort
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="h-9 cursor-pointer rounded-lg border border-input bg-background px-2.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4">
          <EmptyState
            title="No projects match"
            description="Try another search, category or technology."
          />
          <Button type="button" variant="outline" onClick={reset}>
            <FiRotateCcw aria-hidden="true" className="size-4" />
            Reset filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((project, index) => (
              <div
                key={project.slug}
                className="project-rise h-full opacity-0"
                style={{
                  animation: "project-rise 0.45s ease-out forwards",
                  animationDelay: `${(index % PAGE_SIZE) * 50}ms`,
                }}
              >
                <ProjectCard project={project} priority={index < ABOVE_FOLD} />
              </div>
            ))}
          </div>

          {remaining > 0 ? (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() =>
                  setLimitState((current) => ({
                    filterKey,
                    count:
                      (current.filterKey === filterKey
                        ? current.count
                        : PAGE_SIZE) + PAGE_SIZE,
                  }))
                }
              >
                Show {Math.min(PAGE_SIZE, remaining)} more
                <span className="text-muted-foreground">
                  ({remaining} left)
                </span>
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
