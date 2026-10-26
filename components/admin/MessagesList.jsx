"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, Copy, Mail, Search, X } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];
const CLAMP_AT = 280;

const smallButton =
  "border-border bg-background hover:bg-muted focus-visible:ring-ring inline-flex min-h-9 items-center gap-2 rounded-lg border px-3 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none";

/**
 * items: [{ id, subject, name, email, company, serviceLabel, whenLabel,
 *           status, message, badge, actions }]
 * badge / actions server se aaye React nodes hain. Dates server par format hoti hain.
 * Search aur filter sirf is page par load hui messages par kaam karte hain.
 */
export function MessagesList({ items }) {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [expanded, setExpanded] = useState(() => new Set());
  const [copied, setCopied] = useState(null);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const statuses = useMemo(
    () => [...new Set(items.map((i) => i.status).filter(Boolean))],
    [items],
  );

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      if (status !== "all" && item.status !== status) return false;
      if (!needle) return true;
      return `${item.subject} ${item.name} ${item.email} ${item.company} ${item.message}`
        .toLowerCase()
        .includes(needle);
    });
  }, [items, query, status]);

  const filtersActive = query.trim() !== "" || status !== "all";

  function reset() {
    setQuery("");
    setStatus("all");
  }

  function toggle(id) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function copyEmail(id, email) {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(id);
    } catch {
      setCopied(null);
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-4 sm:p-5">
        <div className="relative w-full sm:max-w-md">
          <label htmlFor="msg-search" className="sr-only">
            Search messages on this page
          </label>
          <Search
            aria-hidden="true"
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          />
          <input
            id="msg-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, subject or message"
            autoComplete="off"
            className="border-border bg-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-11 w-full rounded-lg border pr-10 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
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

        {statuses.length > 1 ? (
          <div
            role="group"
            aria-label="Filter by status"
            className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0"
          >
            {["all", ...statuses].map((id) => {
              const selected = status === id;
              const count =
                id === "all"
                  ? items.length
                  : items.filter((i) => i.status === id).length;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setStatus(id)}
                  className={`focus-visible:ring-ring inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full border px-3 text-sm font-medium capitalize outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none ${
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {id === "all" ? "All" : String(id).replace(/[-_]/g, " ")}
                  <span
                    aria-hidden="true"
                    className={`rounded-full px-1.5 text-xs tabular-nums ${
                      selected ? "bg-primary-foreground/20" : "bg-muted"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p
          className="text-muted-foreground text-sm"
          role="status"
          aria-live="polite"
        >
          {filtersActive
            ? `${results.length} of ${items.length} messages on this page`
            : `${items.length} ${items.length === 1 ? "message" : "messages"} on this page`}
        </p>
        {filtersActive ? (
          <button type="button" onClick={reset} className={smallButton}>
            Reset filters
          </button>
        ) : null}
      </div>

      {results.length === 0 ? (
        <div className="border-border bg-card flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-12 text-center">
          <span
            aria-hidden="true"
            className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-xl"
          >
            <Search className="size-5" />
          </span>
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            No matching messages
          </h2>
          <p className="text-muted-foreground max-w-sm text-sm leading-6">
            Search and filters cover only the messages loaded here.
          </p>
          <button type="button" onClick={reset} className={smallButton}>
            Reset filters
          </button>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {results.map((item, index) => {
            const long = item.message.length > CLAMP_AT;
            const open = expanded.has(item.id);
            const replyHref = `mailto:${item.email}?subject=${encodeURIComponent(
              `Re: ${item.subject}`,
            )}`;
            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, y: reduce ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reduce ? 0.01 : 0.3,
                  ease: EASE,
                  delay: reduce ? 0 : Math.min(index, 8) * 0.04,
                }}
                className="border-border bg-card hover:border-primary/30 flex min-w-0 flex-col gap-4 rounded-2xl border p-4 transition-colors sm:p-5 motion-reduce:transition-none"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="text-card-title min-w-0 break-words">
                    {item.subject}
                  </h2>
                  {item.badge}
                </div>

                <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <span className="text-foreground font-medium">
                    {item.name}
                  </span>
                  <a
                    href={`mailto:${item.email}`}
                    className="focus-visible:ring-ring rounded-sm break-all underline underline-offset-4 outline-none focus-visible:ring-2"
                  >
                    {item.email}
                  </a>
                  {item.company ? <span>{item.company}</span> : null}
                  {item.serviceLabel ? <span>{item.serviceLabel}</span> : null}
                  <span>{item.whenLabel}</span>
                </div>

                <div className="flex flex-col gap-2">
                  <p
                    className={`text-sm leading-6 break-words whitespace-pre-wrap ${
                      long && !open ? "line-clamp-4" : ""
                    }`}
                  >
                    {item.message}
                  </p>
                  {long ? (
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => toggle(item.id)}
                      className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex min-h-9 w-fit items-center gap-1.5 rounded-md text-xs font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-2"
                    >
                      {open ? "Show less" : "Show more"}
                      <ChevronDown
                        aria-hidden="true"
                        className={`size-3.5 transition-transform duration-200 motion-reduce:transition-none ${
                          open ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  ) : null}
                </div>

                <div className="border-border flex flex-col gap-3 border-t pt-4 sm:flex-row sm:flex-wrap sm:items-center">
                  <div className="flex flex-wrap gap-2">
                    <a href={replyHref} className={smallButton}>
                      <Mail aria-hidden="true" className="size-3.5" />
                      Reply by email
                    </a>
                    <button
                      type="button"
                      onClick={() => copyEmail(item.id, item.email)}
                      className={smallButton}
                    >
                      {copied === item.id ? (
                        <Check
                          aria-hidden="true"
                          className="text-primary size-3.5"
                        />
                      ) : (
                        <Copy aria-hidden="true" className="size-3.5" />
                      )}
                      {copied === item.id ? "Copied" : "Copy email"}
                    </button>
                  </div>
                  {item.actions ? (
                    <div className="sm:ml-auto">{item.actions}</div>
                  ) : null}
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}

      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "Email copied to clipboard" : ""}
      </span>
    </div>
  );
}
