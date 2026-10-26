"use client";

import { useId, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Search, X } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

const TERMS = [
  {
    term: "API",
    text: "A set of rules that lets one piece of software talk to another, for example your website fetching data from a server.",
  },
  {
    term: "Authentication",
    text: "Checking who a user is, for example with an email and password or Google sign-in.",
  },
  {
    term: "CMS",
    text: "A content management system. It lets you edit pages and posts without changing code.",
  },
  {
    term: "Deployment",
    text: "Publishing your app to a server so real users can open and use it.",
  },
  {
    term: "Integration",
    text: "Connecting your product with another tool, such as email, payments or a CRM.",
  },
  {
    term: "MVP",
    text: "Minimum viable product. A first usable version with only the core features, used to test an idea before building more.",
  },
  {
    term: "Responsive design",
    text: "A layout that adapts to phones, tablets and desktops so the site works well on every screen.",
  },
  {
    term: "SaaS",
    text: "Software as a service. Software that customers use online, usually on a subscription, without installing anything.",
  },
  {
    term: "SEO",
    text: "Search engine optimization. Making a website easy for search engines to find and understand.",
  },
  {
    term: "AI chatbot",
    text: "A program that answers messages in natural language. It can be connected to your documents and tools to handle common questions.",
  },
];

export function Glossary() {
  const reduce = useReducedMotion();
  const id = useId();
  const [query, setQuery] = useState("");

  const needle = query.trim().toLowerCase();
  const results = useMemo(
    () =>
      TERMS.filter(
        (t) =>
          !needle ||
          t.term.toLowerCase().includes(needle) ||
          t.text.toLowerCase().includes(needle),
      ),
    [needle],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="relative w-full sm:max-w-sm">
        <label htmlFor={`${id}-glossary`} className="sr-only">
          Search terms
        </label>
        <Search
          aria-hidden="true"
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
        />
        <input
          id={`${id}-glossary`}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search terms"
          autoComplete="off"
          className="border-border bg-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-11 w-full rounded-lg border pr-10 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 [&::-webkit-search-cancel-button]:hidden"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear term search"
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-md outline-none focus-visible:ring-2"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        ) : null}
      </div>

      <p
        className="text-muted-foreground text-sm"
        role="status"
        aria-live="polite"
      >
        {needle
          ? `${results.length} of ${TERMS.length} terms shown`
          : `${TERMS.length} terms`}
      </p>

      {results.length > 0 ? (
        <motion.dl
          layout={!reduce}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {results.map((item) => (
              <motion.div
                key={item.term}
                layout={!reduce}
                initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
                transition={{ duration: reduce ? 0.01 : 0.25, ease: EASE }}
                className="border-border bg-card hover:border-primary/40 flex min-w-0 flex-col gap-2 rounded-2xl border p-5 transition-colors duration-200 motion-reduce:transition-none"
              >
                <dt className="font-heading text-base font-semibold tracking-tight">
                  {item.term}
                </dt>
                <dd className="text-muted-foreground text-sm leading-6">
                  {item.text}
                </dd>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.dl>
      ) : (
        <p className="border-border bg-card text-muted-foreground rounded-2xl border border-dashed px-6 py-10 text-center text-sm">
          No terms match “{query.trim()}”.
        </p>
      )}
    </div>
  );
}
