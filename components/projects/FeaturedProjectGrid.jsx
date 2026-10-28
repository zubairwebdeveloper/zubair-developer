"use client";

import { useMemo, useState } from "react";

import { ProjectCard } from "@/components/projects/ProjectCard";
import { getProjectCategoryGroups, getProjectCategoryKey } from "@/lib/projects/category";
import { cn } from "@/lib/utils/cn";

export function FeaturedProjectGrid({ projects }) {
  const [category, setCategory] = useState("all");
  const groups = useMemo(() => getProjectCategoryGroups(projects), [projects]);
  const filtered = useMemo(
    () =>
      category === "all"
        ? projects
        : projects.filter(
            (project) => getProjectCategoryKey(project.category) === category,
          ),
    [category, projects],
  );

  const chipClass =
    "inline-flex min-h-9 items-center rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="mt-8">
      {groups.length > 0 ? (
        <div
          role="group"
          aria-label="Filter featured projects by category"
          className="mb-6 flex flex-wrap gap-2"
        >
          {[{ key: "all", label: "All" }, ...groups].map((item) => {
            const selected = category === item.key;
            return (
              <button
                key={item.key}
                type="button"
                aria-pressed={selected}
                onClick={() => setCategory(item.key)}
                className={cn(
                  chipClass,
                  selected
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                )}
              >
                {item.label}
                <span aria-hidden="true" className="ml-1.5 tabular-nums opacity-70">
                  {item.key === "all" ? projects.length : item.count}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      <ul
        className={cn(
          "grid gap-6 md:grid-cols-2 lg:grid-cols-3",
          filtered.length === 1 && "mx-auto max-w-3xl lg:grid-cols-1",
        )}
      >
        {filtered.map((project, index) => (
          <li
            key={project.slug}
            className={cn(
              "grid min-w-0 [&>*]:h-full",
              index === 0 && filtered.length > 1 && "md:col-span-2 lg:col-span-2",
            )}
          >
            <ProjectCard project={project} priority={index === 0} featured={index === 0} />
          </li>
        ))}
      </ul>
      {filtered.length === 0 ? (
        <p role="status" className="py-8 text-center text-sm text-muted-foreground">
          No featured projects in this category yet.
        </p>
      ) : null}
    </div>
  );
}
