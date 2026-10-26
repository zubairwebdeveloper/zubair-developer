"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const EASE = [0.22, 1, 0.36, 1];

const SORTS = [
  { id: "updated", label: "Recently updated" },
  { id: "messages", label: "Most messages" },
  { id: "expiring", label: "Expiring soonest" },
];

function ExpiryBadge({ daysLeft }) {
  if (daysLeft == null) return <Badge variant="outline">Unknown</Badge>;
  const urgent = daysLeft <= 3;
  const text =
    daysLeft <= 0
      ? "Expiring now"
      : daysLeft === 1
        ? "1 day left"
        : `${daysLeft} days left`;
  return (
    <Badge
      variant="outline"
      className={urgent ? "border-primary/50 text-primary" : undefined}
    >
      {text}
    </Badge>
  );
}

/**
 * items: [{ id, preview, count, updatedAt, expiresAt, updatedLabel, expiresLabel, daysLeft }]
 * Dates server par format hoti hain, taake hydration mismatch na ho.
 * Search aur sort sirf is page par load hui conversations par kaam karte hain.
 */
export function ConversationsList({ items }) {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("updated");

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? items.filter((item) =>
          (item.preview || "").toLowerCase().includes(needle),
        )
      : items;

    const time = (value) => {
      const t = Date.parse(value);
      return Number.isNaN(t) ? 0 : t;
    };

    return [...filtered].sort((a, b) => {
      if (sort === "messages") return (b.count ?? 0) - (a.count ?? 0);
      if (sort === "expiring") return time(a.expiresAt) - time(b.expiresAt);
      return time(b.updatedAt) - time(a.updatedAt);
    });
  }, [items, query, sort]);

  const hasQuery = query.trim().length > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <label htmlFor="conv-search" className="sr-only">
            Search first messages on this page
          </label>
          <Search
            aria-hidden="true"
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          />
          <input
            id="conv-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search first messages"
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

        <div className="flex items-center gap-2 sm:ml-auto">
          <label htmlFor="conv-sort" className="text-muted-foreground text-sm">
            Sort
          </label>
          <select
            id="conv-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border-border bg-background focus-visible:ring-ring min-h-11 rounded-lg border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            {SORTS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p
        className="text-muted-foreground text-sm"
        role="status"
        aria-live="polite"
      >
        {hasQuery
          ? `${results.length} of ${items.length} on this page match “${query.trim()}”`
          : `${items.length} ${items.length === 1 ? "conversation" : "conversations"} on this page`}
      </p>

      {results.length === 0 ? (
        <div className="border-border bg-card flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-12 text-center">
          <span
            aria-hidden="true"
            className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-xl"
          >
            <Search className="size-5" />
          </span>
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            No matches on this page
          </h2>
          <p className="text-muted-foreground max-w-sm text-sm leading-6">
            Search covers only the conversations loaded here. Try another word,
            or open older conversations.
          </p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="border-border bg-background hover:bg-muted focus-visible:ring-ring inline-flex min-h-10 items-center rounded-lg border px-4 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none"
          >
            Clear search
          </button>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <ul className="flex flex-col gap-3 md:hidden">
            {results.map((item, index) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reduce ? 0.01 : 0.3,
                  ease: EASE,
                  delay: reduce ? 0 : Math.min(index, 8) * 0.04,
                }}
              >
                <Link
                  href={`/admin/ai-conversations/${item.id}`}
                  className="group border-border bg-card hover:border-primary/40 focus-visible:ring-ring flex flex-col gap-3 rounded-2xl border p-4 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none"
                >
                  <p className="line-clamp-2 font-medium break-words">
                    {item.preview || "(empty)"}
                  </p>
                  <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span>
                      {item.count} {item.count === 1 ? "message" : "messages"}
                    </span>
                    <span>Updated {item.updatedLabel}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <ExpiryBadge daysLeft={item.daysLeft} />
                    <ArrowRight
                      aria-hidden="true"
                      className="text-muted-foreground size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
                    />
                  </div>
                </Link>
              </motion.li>
            ))}
          </ul>

          {/* Desktop: table */}
          <div className="border-border bg-card hidden overflow-hidden rounded-2xl border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>First message</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Auto-deletes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/50">
                    <TableCell className="max-w-sm truncate">
                      <Link
                        href={`/admin/ai-conversations/${item.id}`}
                        className="focus-visible:ring-ring rounded-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-2"
                      >
                        {item.preview || "(empty)"}
                      </Link>
                    </TableCell>
                    <TableCell className="tabular-nums">{item.count}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {item.updatedLabel}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-start gap-1">
                        <span className="whitespace-nowrap">
                          {item.expiresLabel}
                        </span>
                        <ExpiryBadge daysLeft={item.daysLeft} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
