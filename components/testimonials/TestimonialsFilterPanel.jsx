"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Star, X } from "lucide-react";

import { TiltCard } from "@/components/motion/TiltCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Reveal } from "@/components/shared/Reveal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

function getInitials(name = "") {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function TestimonialsFilterPanel({ items = [] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [rating, setRating] = useState("all");

  const availableCategories = useMemo(() => {
    const values = new Set();
    items.forEach((item) => {
      const value = String(item?.projectCategory || "").trim();
      if (value) values.add(value);
    });
    return [...values].sort((a, b) => a.localeCompare(b));
  }, [items]);

  const availableRatings = useMemo(() => {
    const values = new Set();
    items.forEach((item) => {
      const numeric = Number(item?.rating);
      if (Number.isFinite(numeric) && numeric >= 1 && numeric <= 5) {
        values.add(String(numeric));
      }
    });
    return [...values].sort((a, b) => Number(a) - Number(b));
  }, [items]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((item) => {
      if (
        normalizedQuery &&
        ![
          item?.quote,
          item?.authorName,
          item?.company,
          item?.authorRole,
          item?.projectCategory,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      ) {
        return false;
      }

      if (category !== "all") {
        const itemCategory = String(item?.projectCategory || "").trim();
        if (itemCategory.toLowerCase() !== category.toLowerCase()) {
          return false;
        }
      }

      if (rating !== "all") {
        const itemRating = Number(item?.rating);
        if (!Number.isFinite(itemRating) || String(itemRating) !== rating) {
          return false;
        }
      }

      return true;
    });
  }, [category, items, query, rating]);

  const clearFilters = () => {
    setQuery("");
    setCategory("all");
    setRating("all");
  };

  const hasFilters = query.trim() || category !== "all" || rating !== "all";

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <label className="relative block w-full">
            <span className="sr-only">Search testimonials</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by quote, client, or company"
              className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-primary/70"
            />
          </label>

          {availableCategories.length > 0 ? (
            <label className="flex min-w-0 flex-col gap-1.5 text-sm text-muted-foreground lg:w-48">
              <span className="font-medium text-foreground">Category</span>
              <div className="relative">
                <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="h-11 w-full appearance-none rounded-xl border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition focus:border-primary/70"
                >
                  <option value="all">All categories</option>
                  {availableCategories.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          ) : null}

          {availableRatings.length > 0 ? (
            <label className="flex min-w-0 flex-col gap-1.5 text-sm text-muted-foreground lg:w-40">
              <span className="font-medium text-foreground">Rating</span>
              <select
                value={rating}
                onChange={(event) => setRating(event.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary/70"
              >
                <option value="all">All ratings</option>
                {availableRatings.map((value) => (
                  <option key={value} value={value}>
                    {value} stars
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>

        <div className="mt-4 flex flex-col items-start justify-between gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredItems.length}</span> of {items.length} testimonials
          </p>

          {hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "gap-2",
              )}
            >
              <X className="size-3.5" />
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <Reveal as="div" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item, index) => {
            const meta = [item?.authorRole, item?.company].filter(Boolean).join(" • ");
            const authorName = item?.authorName || "Client";
            const ratingValue = Number(item?.rating);
            const hasRating = Number.isFinite(ratingValue) && ratingValue >= 1 && ratingValue <= 5;

            return (
              <TiltCard key={item?.id ?? `${authorName}-${index}`}>
                <figure className="group flex h-full flex-col gap-5 rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex rounded-full border border-primary/20 bg-primary/5 p-2 text-primary">
                      <Star className="size-4 fill-current" />
                    </span>

                    {hasRating ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-600">
                        <Star className="size-3.5 fill-current" />
                        {ratingValue.toFixed(1)}
                      </span>
                    ) : null}
                  </div>

                  <blockquote className="text-base leading-relaxed text-foreground/90">
                    <p className="text-pretty">“{item?.quote || ""}”</p>
                  </blockquote>

                  <div className="mt-auto flex items-center gap-3 border-t border-border/70 pt-4">
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/20">
                      {getInitials(authorName)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{authorName}</p>
                      {meta ? <p className="truncate text-xs text-muted-foreground">{meta}</p> : null}
                      {item?.projectCategory ? (
                        <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-primary/80">
                          {item.projectCategory}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </figure>
              </TiltCard>
            );
          })}
        </Reveal>
      ) : (
        <EmptyState
          title="No testimonials match your filters"
          description="Try a different keyword, switch categories, or reset the search to browse more real client feedback."
          action={{ label: "Reset filters", onClick: clearFilters }}
        />
      )}
    </div>
  );
}
