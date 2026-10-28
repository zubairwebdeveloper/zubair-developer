"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
  Link2,
  Search,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];
const FEEDBACK_KEY = "zd-faq-feedback";

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const toAnchor = (key) => `faq-${String(key).replace(/[^a-zA-Z0-9_-]/g, "-")}`;

function Highlight({ text, query }) {
  const q = query.trim();
  if (!q) return text;
  const parts = text.split(new RegExp(`(${escapeRegExp(q)})`, "gi"));
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="bg-primary/20 text-foreground rounded-sm px-0.5">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

const pillButton =
  "border-border bg-background hover:bg-muted focus-visible:ring-ring inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none";

/**
 * faqs: [{ id?, question, answer, category? }]
 * Feedback sirf visitor ke apne browser (localStorage) ma save hota hai,
 * server ko kuch nahi bheja jata.
 */
export function FaqExplorer({ faqs }) {
  const reduce = useReducedMotion();
  const baseId = useId();
  const searchRef = useRef(null);
  const copyTimer = useRef(null);
  const questionRefs = useRef({});

  const items = useMemo(
    () =>
      faqs
        .filter((faq) => faq?.question && faq?.answer)
        .map((faq, index) => ({
          key: String(faq.id ?? index),
          question: faq.question,
          answer: faq.answer,
          category: faq.category ? String(faq.category).trim() : null,
        })),
    [faqs],
  );

  const categories = useMemo(
    () => [...new Set(items.map((i) => i.category).filter(Boolean))],
    [items],
  );

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [openKeys, setOpenKeys] = useState(() => new Set());
  const [copiedKey, setCopiedKey] = useState(null);
  const [copyError, setCopyError] = useState(false);
  const [feedback, setFeedback] = useState({});

  const needle = query.trim().toLowerCase();
  const results = useMemo(
    () =>
      items.filter((item) => {
        if (category !== "all" && item.category !== category) return false;
        if (!needle) return true;
        return `${item.question} ${item.answer} ${item.category ?? ""}`
          .toLowerCase()
          .includes(needle);
      }),
    [items, category, needle],
  );

  const allOpen =
    results.length > 0 && results.every((item) => openKeys.has(item.key));

  // Feedback wapas load karo (client par, hydration-safe)
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const raw = window.localStorage.getItem(FEEDBACK_KEY);
        if (raw) setFeedback(JSON.parse(raw) || {});
      } catch {
        // storage block ho to bhi page theek chalta hai
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  // Deep link: /faq#faq-3 seedha us sawal ko kholta hai
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const match = items.find((item) => toAnchor(item.key) === hash);
    if (!match) return;
    let timer;
    const frame = window.requestAnimationFrame(() => {
      setOpenKeys(new Set([match.key]));
      timer = window.setTimeout(
        () =>
          document.getElementById(hash)?.scrollIntoView({
            behavior: reduce ? "auto" : "smooth",
            block: "center",
          }),
        150,
      );
    });
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
    // sirf pehli dafa
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // "/" dabane se search focus
  useEffect(() => {
    function onKey(event) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey)
        return;
      const tag = event.target?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        event.target?.isContentEditable
      )
        return;
      event.preventDefault();
      searchRef.current?.focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  function toggle(key) {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleAll() {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      results.forEach((item) =>
        allOpen ? next.delete(item.key) : next.add(item.key),
      );
      return next;
    });
  }

  async function copyLink(key) {
    const anchor = toAnchor(key);
    const url = `${window.location.origin}${window.location.pathname}#${anchor}`;
    try {
      await navigator.clipboard.writeText(url);
      window.history.replaceState(null, "", `#${anchor}`);
      setCopyError(false);
      setCopiedKey(key);
    } catch {
      setCopyError(true);
      setCopiedKey(null);
    }
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => {
      setCopiedKey(null);
      setCopyError(false);
    }, 2000);
  }

  function vote(key, value) {
    const next = { ...feedback };
    if (next[key] === value) delete next[key];
    else next[key] = value;
    setFeedback(next);
    try {
      window.localStorage.setItem(FEEDBACK_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  // Arrow keys se questions ke beech move
  function onQuestionKeyDown(event, index) {
    let target;
    if (event.key === "ArrowDown") target = index + 1;
    else if (event.key === "ArrowUp") target = index - 1;
    else if (event.key === "Home") target = 0;
    else if (event.key === "End") target = results.length - 1;
    else return;
    event.preventDefault();
    const clamped = Math.max(0, Math.min(results.length - 1, target));
    questionRefs.current[results[clamped].key]?.focus();
  }

  function clearAll() {
    setQuery("");
    setCategory("all");
  }

  const filtersActive = needle.length > 0 || category !== "all";

  return (
    <div className="flex flex-col gap-6">
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-md">
          <label htmlFor={`${baseId}-search`} className="sr-only">
            Search questions
          </label>
          <Search
            aria-hidden="true"
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          />
          <input
            ref={searchRef}
            id={`${baseId}-search`}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setQuery("");
            }}
            placeholder="Search questions"
            autoComplete="off"
            className="border-border bg-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-11 w-full rounded-lg border pr-16 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                searchRef.current?.focus();
              }}
              aria-label="Clear search"
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-md outline-none focus-visible:ring-2"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          ) : (
            <kbd
              aria-hidden="true"
              className="border-border text-muted-foreground pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded border px-1.5 text-xs sm:block"
            >
              /
            </kbd>
          )}
        </div>

        <button
          type="button"
          onClick={toggleAll}
          disabled={results.length === 0}
          className={`${pillButton} sm:ml-auto`}
        >
          {allOpen ? (
            <ChevronsDownUp aria-hidden="true" className="size-4" />
          ) : (
            <ChevronsUpDown aria-hidden="true" className="size-4" />
          )}
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>

      {/* Category chips */}
      {categories.length > 1 ? (
        <div
          role="group"
          aria-label="Filter by category"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
        >
          {["all", ...categories].map((id) => {
            const selected = category === id;
            const count =
              id === "all"
                ? items.length
                : items.filter((i) => i.category === id).length;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={selected}
                onClick={() => setCategory(id)}
                className={`focus-visible:ring-ring inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {id === "all" ? "All" : id}
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

      <p
        className="text-muted-foreground text-sm"
        role="status"
        aria-live="polite"
      >
        {filtersActive
          ? `${results.length} of ${items.length} ${items.length === 1 ? "question" : "questions"} shown`
          : `${items.length} ${items.length === 1 ? "question" : "questions"}`}
        {openKeys.size > 0 ? ` · ${openKeys.size} open` : ""}
        {copiedKey ? " · Link copied" : ""}
        {copyError ? " · Could not copy the link" : ""}
      </p>

      {/* List */}
      {results.length > 0 ? (
        <motion.ul layout={!reduce} className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout" initial>
            {results.map((item, index) => {
              const open = openKeys.has(item.key);
              const anchor = toAnchor(item.key);
              const buttonId = `${baseId}-q-${anchor}`;
              const panelId = `${baseId}-a-${anchor}`;
              const voted = feedback[item.key];
              return (
                <motion.li
                  key={item.key}
                  id={anchor}
                  layout={reduce ? false : "position"}
                  initial={{ opacity: 0, y: reduce ? 0 : 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: reduce ? 1 : 0.97 }}
                  transition={{
                    duration: reduce ? 0.01 : 0.32,
                    ease: EASE,
                    delay: reduce ? 0 : Math.min(index, 8) * 0.04,
                  }}
                  className={`border-border bg-card scroll-mt-28 overflow-hidden rounded-2xl border transition-colors duration-200 motion-reduce:transition-none ${
                    open ? "border-primary/40" : "hover:border-primary/30"
                  }`}
                >
                  <h3>
                    <button
                      ref={(node) => {
                        questionRefs.current[item.key] = node;
                      }}
                      type="button"
                      id={buttonId}
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => toggle(item.key)}
                      onKeyDown={(e) => onQuestionKeyDown(e, index)}
                      className="focus-visible:ring-ring flex min-h-14 w-full items-start justify-between gap-4 px-5 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset"
                    >
                      <span className="flex min-w-0 flex-col gap-1">
                        {item.category ? (
                          <span className="text-primary text-xs font-medium">
                            {item.category}
                          </span>
                        ) : null}
                        <span className="text-base font-medium text-balance">
                          <Highlight text={item.question} query={query} />
                        </span>
                      </span>
                      <ChevronDown
                        aria-hidden="true"
                        className={`text-muted-foreground mt-1 size-5 shrink-0 transition-transform duration-200 motion-reduce:transition-none ${
                          open ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </h3>

                  <AnimatePresence initial={false}>
                    {open ? (
                      <motion.div
                        key="panel"
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: reduce ? 0.01 : 0.28,
                          ease: EASE,
                        }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col gap-5 px-5 pt-1 pb-5">
                          <p className="text-muted-foreground max-w-2xl leading-7 whitespace-pre-line">
                            <Highlight text={item.answer} query={query} />
                          </p>

                          <div className="border-border flex flex-col gap-3 border-t pt-4 sm:flex-row sm:flex-wrap sm:items-center">
                            <div
                              role="group"
                              aria-label="Was this answer helpful?"
                              className="flex flex-wrap items-center gap-2"
                            >
                              <span className="text-sm font-medium">
                                Was this helpful?
                              </span>
                              <button
                                type="button"
                                aria-pressed={voted === "yes"}
                                onClick={() => vote(item.key, "yes")}
                                className={`${pillButton} ${
                                  voted === "yes"
                                    ? "border-primary bg-primary/10 text-primary"
                                    : ""
                                }`}
                              >
                                <ThumbsUp
                                  aria-hidden="true"
                                  className="size-4"
                                />
                                Yes
                              </button>
                              <button
                                type="button"
                                aria-pressed={voted === "no"}
                                onClick={() => vote(item.key, "no")}
                                className={`${pillButton} ${
                                  voted === "no"
                                    ? "border-primary bg-primary/10 text-primary"
                                    : ""
                                }`}
                              >
                                <ThumbsDown
                                  aria-hidden="true"
                                  className="size-4"
                                />
                                No
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => copyLink(item.key)}
                              className={`${pillButton} w-fit sm:ml-auto`}
                            >
                              {copiedKey === item.key ? (
                                <Check
                                  aria-hidden="true"
                                  className="text-primary size-4"
                                />
                              ) : (
                                <Link2 aria-hidden="true" className="size-4" />
                              )}
                              {copiedKey === item.key
                                ? "Link copied"
                                : "Copy link"}
                            </button>
                          </div>

                          <AnimatePresence initial={false} mode="wait">
                            {voted ? (
                              <motion.p
                                key={voted}
                                role="status"
                                initial={{ opacity: 0, y: reduce ? 0 : 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: reduce ? 0.01 : 0.2 }}
                                className="text-muted-foreground text-sm leading-6"
                              >
                                {voted === "yes" ? (
                                  "Glad it helped. Your answer is saved on this device only."
                                ) : (
                                  <>
                                    Sorry about that.{" "}
                                    <Link
                                      href="/contact"
                                      className="text-foreground focus-visible:ring-ring rounded-sm underline underline-offset-4 outline-none focus-visible:ring-2"
                                    >
                                      Ask me directly
                                    </Link>{" "}
                                    and I will help.
                                  </>
                                )}
                              </motion.p>
                            ) : null}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.li>
              );
            })}
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
          <h3 className="font-heading text-lg font-semibold tracking-tight">
            No matching questions
          </h3>
          <p className="text-muted-foreground max-w-sm text-sm leading-6">
            Try a different word, or reset the filters. You can also send your
            question directly.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" onClick={clearAll} className={pillButton}>
              Reset filters
            </button>
            <Link href="/contact" className={pillButton}>
              Ask a question
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
