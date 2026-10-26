"use client";

import { useMemo, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";
import { Search, X } from "lucide-react";

import { PostCard } from "@/components/blog/PostCard";

const EASE = [0.22, 1, 0.36, 1];

const SORTS = [
  { id: "newest", label: "Newest first" },
  { id: "oldest", label: "Oldest first" },
];

function toTime(value) {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

/**
 * posts: server se aaye serializable post objects (slug, title, excerpt, publishedAt ...)
 * Search sirf title aur excerpt ma hoti hai, kyun ke baqi fields ka mujhe pata nahi.
 */
export function BlogExplorer({ posts }) {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? posts.filter((post) =>
          `${post.title ?? ""} ${post.excerpt ?? ""}`
            .toLowerCase()
            .includes(needle),
        )
      : posts;

    return [...filtered].sort((a, b) =>
      sort === "newest"
        ? toTime(b.publishedAt) - toTime(a.publishedAt)
        : toTime(a.publishedAt) - toTime(b.publishedAt),
    );
  }, [posts, query, sort]);

  const hasQuery = query.trim().length > 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <label htmlFor="blog-search" className="sr-only">
            Search articles
          </label>
          <Search
            aria-hidden="true"
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          />
          <input
            id="blog-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search articles"
            autoComplete="off"
            className="border-border bg-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-11 w-full rounded-lg border pr-10 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 [&::-webkit-search-cancel-button]:hidden"
          />
          {hasQuery ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-md outline-none focus-visible:ring-2"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          ) : null}
        </div>

        <div
          role="group"
          aria-label="Sort articles"
          className="bg-muted inline-flex w-fit gap-1 rounded-xl p-1"
        >
          <LayoutGroup id="blog-sort">
            {SORTS.map((option) => {
              const selected = sort === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setSort(option.id)}
                  className={`focus-visible:ring-ring relative min-h-9 rounded-lg px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 motion-reduce:transition-none ${
                    selected
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {selected ? (
                    <motion.span
                      layoutId="blog-sort-indicator"
                      aria-hidden="true"
                      className="bg-background absolute inset-0 rounded-lg shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                      transition={
                        reduce
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 420, damping: 36 }
                      }
                    />
                  ) : null}
                  <span className="relative z-10">{option.label}</span>
                </button>
              );
            })}
          </LayoutGroup>
        </div>
      </div>

      {/* Result count (screen readers ko bhi announce hota hai) */}
      <p
        className="text-muted-foreground text-sm"
        role="status"
        aria-live="polite"
      >
        {hasQuery
          ? `${results.length} of ${posts.length} ${posts.length === 1 ? "article" : "articles"} match “${query.trim()}”`
          : `${posts.length} ${posts.length === 1 ? "article" : "articles"}`}
      </p>

      {/* Grid */}
      {results.length > 0 ? (
        <motion.ul
          layout={!reduce}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {results.map((post, index) => (
              <motion.li
                key={post.slug}
                layout={!reduce}
                initial={{ opacity: 0, y: reduce ? 0 : 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
                transition={{
                  duration: reduce ? 0.01 : 0.32,
                  ease: EASE,
                  delay: reduce ? 0 : Math.min(index, 8) * 0.04,
                }}
                className="min-w-0"
              >
                <PostCard post={post} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      ) : (
        <div className="border-border bg-card flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-14 text-center">
          <span
            aria-hidden="true"
            className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-xl"
          >
            <Search className="size-5" />
          </span>
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            No matching articles
          </h2>
          <p className="text-muted-foreground max-w-sm text-sm leading-6">
            Nothing matches “{query.trim()}”. Try a different word or clear the
            search.
          </p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="border-border bg-background hover:bg-muted focus-visible:ring-ring mt-1 inline-flex min-h-10 items-center rounded-lg border px-4 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
