"use client";

import { Fragment, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, Copy, Search, X } from "lucide-react";

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

const field =
  "border-border bg-background focus-visible:ring-ring min-h-11 rounded-lg border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

const smallButton =
  "border-border bg-background hover:bg-muted focus-visible:ring-ring inline-flex min-h-9 items-center gap-2 rounded-lg border px-3 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none";

/**
 * items: [{ id, action, entityType, entityId, actorLabel, whenLabel, metaText, risky }]
 * Dates server par format hoti hain, taake hydration mismatch na ho.
 * Search aur filters sirf is page par load hui entries par kaam karte hain.
 */
export function AuditLogList({ items }) {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [entity, setEntity] = useState("all");
  const [actor, setActor] = useState("all");
  const [open, setOpen] = useState(() => new Set());
  const [copied, setCopied] = useState(null);

  const entityTypes = useMemo(
    () => [...new Set(items.map((i) => i.entityType).filter(Boolean))].sort(),
    [items],
  );
  const actors = useMemo(
    () => [...new Set(items.map((i) => i.actorLabel))].sort(),
    [items],
  );

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      if (entity !== "all" && item.entityType !== entity) return false;
      if (actor !== "all" && item.actorLabel !== actor) return false;
      if (!needle) return true;
      return `${item.action} ${item.entityType} ${item.entityId} ${item.actorLabel} ${item.metaText ?? ""}`
        .toLowerCase()
        .includes(needle);
    });
  }, [items, query, entity, actor]);

  const filtersActive = query.trim() || entity !== "all" || actor !== "all";

  function toggle(id) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function reset() {
    setQuery("");
    setEntity("all");
    setActor("all");
  }

  async function copy(id, text) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 2000);
    } catch {
      setCopied(null);
    }
  }

  function Details({ item }) {
    return (
      <motion.div
        initial={{ opacity: 0, y: reduce ? 0 : -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0.01 : 0.22, ease: EASE }}
        className="flex flex-col gap-3"
      >
        <dl className="grid gap-3 text-xs sm:grid-cols-2">
          <div className="min-w-0">
            <dt className="text-muted-foreground">Entity ID</dt>
            <dd className="font-mono break-all">{item.entityId || "—"}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-muted-foreground">Log ID</dt>
            <dd className="font-mono break-all">{item.id}</dd>
          </div>
        </dl>
        <div className="min-w-0">
          <p className="text-muted-foreground mb-1 text-xs">Details</p>
          {item.metaText ? (
            <pre className="border-border bg-muted/40 max-h-64 overflow-auto rounded-lg border p-3 font-mono text-xs leading-5 break-words whitespace-pre-wrap">
              {item.metaText}
            </pre>
          ) : (
            <p className="text-muted-foreground text-sm">No extra details.</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {item.entityId ? (
            <button
              type="button"
              onClick={() => copy(`${item.id}-eid`, item.entityId)}
              className={smallButton}
            >
              {copied === `${item.id}-eid` ? (
                <Check aria-hidden="true" className="text-primary size-3.5" />
              ) : (
                <Copy aria-hidden="true" className="size-3.5" />
              )}
              {copied === `${item.id}-eid` ? "Copied" : "Copy entity ID"}
            </button>
          ) : null}
          {item.metaText ? (
            <button
              type="button"
              onClick={() => copy(`${item.id}-meta`, item.metaText)}
              className={smallButton}
            >
              {copied === `${item.id}-meta` ? (
                <Check aria-hidden="true" className="text-primary size-3.5" />
              ) : (
                <Copy aria-hidden="true" className="size-3.5" />
              )}
              {copied === `${item.id}-meta` ? "Copied" : "Copy details"}
            </button>
          ) : null}
        </div>
      </motion.div>
    );
  }

  const Toggle = ({ item }) => {
    const isOpen = open.has(item.id);
    return (
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={`audit-${item.id}`}
        onClick={() => toggle(item.id)}
        className={smallButton}
      >
        {isOpen ? "Hide" : "Details"}
        <ChevronDown
          aria-hidden="true"
          className={`size-3.5 transition-transform duration-200 motion-reduce:transition-none ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
        <div className="relative">
          <label htmlFor="audit-search" className="sr-only">
            Search audit entries on this page
          </label>
          <Search
            aria-hidden="true"
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          />
          <input
            id="audit-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search action, entity, person or details"
            autoComplete="off"
            className={`${field} w-full pr-10 pl-9 [&::-webkit-search-cancel-button]:hidden`}
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

        <div>
          <label htmlFor="audit-entity" className="sr-only">
            Filter by entity type
          </label>
          <select
            id="audit-entity"
            value={entity}
            onChange={(e) => setEntity(e.target.value)}
            className={`${field} w-full`}
          >
            <option value="all">All entities</option>
            {entityTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="audit-actor" className="sr-only">
            Filter by person
          </label>
          <select
            id="audit-actor"
            value={actor}
            onChange={(e) => setActor(e.target.value)}
            className={`${field} w-full`}
          >
            <option value="all">Everyone</option>
            {actors.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p
          className="text-muted-foreground text-sm"
          role="status"
          aria-live="polite"
        >
          {filtersActive
            ? `${results.length} of ${items.length} entries on this page`
            : `${items.length} ${items.length === 1 ? "entry" : "entries"} on this page`}
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
            No matching entries on this page
          </h2>
          <p className="text-muted-foreground max-w-sm text-sm leading-6">
            Filters cover only the entries loaded here. Reset them, or open
            older entries.
          </p>
          <button type="button" onClick={reset} className={smallButton}>
            Reset filters
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
                className="border-border bg-card flex flex-col gap-3 rounded-2xl border p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`font-mono text-xs ${
                      item.risky ? "border-primary/50 text-primary" : ""
                    }`}
                  >
                    {item.action}
                  </Badge>
                  <span className="text-muted-foreground text-xs">
                    {item.whenLabel}
                  </span>
                </div>
                <p className="text-sm break-words">
                  <span className="font-medium">{item.entityType}</span>
                  {item.entityId ? (
                    <span className="text-muted-foreground">
                      {" "}
                      · {item.entityId.slice(0, 12)}
                    </span>
                  ) : null}
                </p>
                <p className="text-muted-foreground text-xs">
                  By {item.actorLabel}
                </p>
                <div>
                  <Toggle item={item} />
                </div>
                {open.has(item.id) ? (
                  <div id={`audit-${item.id}`}>
                    <Details item={item} />
                  </div>
                ) : null}
              </motion.li>
            ))}
          </ul>

          {/* Desktop: table */}
          <div className="border-border bg-card hidden overflow-x-auto rounded-2xl border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>By</TableHead>
                  <TableHead>
                    <span className="sr-only">Details</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((item) => (
                  <Fragment key={item.id}>
                    <TableRow className="hover:bg-muted/50">
                      <TableCell className="whitespace-nowrap">
                        {item.whenLabel}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`font-mono text-xs ${
                            item.risky ? "border-primary/50 text-primary" : ""
                          }`}
                        >
                          {item.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.entityType}
                        {item.entityId ? (
                          <span className="text-muted-foreground">
                            {" "}
                            · {item.entityId.slice(0, 12)}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell>{item.actorLabel}</TableCell>
                      <TableCell className="text-right">
                        <Toggle item={item} />
                      </TableCell>
                    </TableRow>
                    {open.has(item.id) ? (
                      <TableRow>
                        <TableCell colSpan={5} className="bg-muted/20">
                          <div id={`audit-${item.id}`}>
                            <Details item={item} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
