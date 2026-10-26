"use client";

import { Check, Link2, Search, X } from "lucide-react";
import NextLink from "next/link";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Wraps the searched words in <mark> so people can see why a question matched. */
function Highlight({ text, term }) {
  const value = String(text ?? "");
  if (!term) return value;

  const parts = value.split(new RegExp(`(${escapeRegExp(term)})`, "gi"));
  return parts.map((part, index) => (
    <Fragment key={index}>
      {part.toLowerCase() === term.toLowerCase() ? (
        <mark className="rounded bg-primary/15 px-0.5 text-foreground">
          {part}
        </mark>
      ) : (
        part
      )}
    </Fragment>
  ));
}

function CopyQuestionLink({ id }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  async function copy() {
    const url = `${window.location.origin}${window.location.pathname}#faq-${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Copying can be blocked. The question is still reachable, so fail quietly.
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={copy}
      className="mt-3 h-8 gap-1.5 px-2 text-muted-foreground"
    >
      {copied ? (
        <Check aria-hidden="true" className="size-3.5" />
      ) : (
        <Link2 aria-hidden="true" className="size-3.5" />
      )}
      {copied ? "Link copied" : "Copy link to this question"}
    </Button>
  );
}

/**
 * FaqAccordion
 *
 * @param {Array}   faqs                 Items with id, question, answer (and optionally category).
 * @param {boolean} [searchable]         Shows the search box.
 * @param {boolean} [showCta]            Shows the "Still have a question?" block.
 * @param {string}  [contactHref]        Where the call to action links to.
 * @param {boolean} [structuredData]     Adds FAQ structured data for search engines.
 *                                       Use it on one FAQ per page.
 */
export function FaqAccordion({
  faqs,
  searchable = false,
  showCta = true,
  contactHref = "/contact",
  structuredData = false,
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [open, setOpen] = useState("");

  const term = query.trim();

  const categories = useMemo(
    () => Array.from(new Set(faqs.map((faq) => faq.category).filter(Boolean))),
    [faqs],
  );

  const matches = (list, nextTerm, nextCategory) => {
    const lower = nextTerm.toLowerCase();
    return list.filter((faq) => {
      const inCategory =
        nextCategory === "all" || faq.category === nextCategory;
      const inText =
        !lower || `${faq.question} ${faq.answer}`.toLowerCase().includes(lower);
      return inCategory && inText;
    });
  };

  const filtered = useMemo(
    () => matches(faqs, term, category),
    [faqs, term, category],
  );

  const isFiltering = term.length > 0 || category !== "all";

  // Open a question straight from a link such as /faq#faq-123.
  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (!hash.startsWith("faq-")) return;
    const id = hash.slice(4);
    if (!faqs.some((faq) => String(faq.id) === id)) return;

    setOpen(id);
    requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ block: "start" });
    });
  }, [faqs]);

  function changeQuery(next) {
    setQuery(next);
    // With a single result, open it so the matching answer is visible right away.
    const results = matches(faqs, next.trim(), category);
    if (next.trim() && results.length === 1) setOpen(String(results[0].id));
  }

  function clearFilters() {
    setQuery("");
    setCategory("all");
  }

  const jsonLd = structuredData
    ? JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      }).replace(/</g, "\\u003c")
    : null;

  return (
    <div className="flex flex-col gap-6">
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      ) : null}

      {searchable ? (
        <div className="flex flex-col gap-3">
          <div className="relative max-w-md">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => changeQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setQuery("");
              }}
              placeholder="Search questions…"
              aria-label="Search frequently asked questions"
              className="h-11 rounded-xl pr-10 pl-9 [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="absolute top-1/2 right-1 size-8 -translate-y-1/2 rounded-lg"
              >
                <X aria-hidden="true" />
              </Button>
            ) : null}
          </div>

          {categories.length > 1 ? (
            <div
              role="group"
              aria-label="Filter by topic"
              className="flex flex-wrap gap-2"
            >
              {["all", ...categories].map((item) => (
                <Button
                  key={item}
                  type="button"
                  size="sm"
                  variant={category === item ? "default" : "outline"}
                  aria-pressed={category === item}
                  onClick={() => setCategory(item)}
                >
                  {item === "all" ? "All topics" : item}
                </Button>
              ))}
            </div>
          ) : null}

          <p
            role="status"
            aria-live="polite"
            className={cn(
              isFiltering ? "px-1 text-sm text-muted-foreground" : "sr-only",
            )}
          >
            {isFiltering
              ? `${filtered.length} of ${faqs.length} ${
                  faqs.length === 1 ? "question" : "questions"
                }`
              : ""}
          </p>
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3">
          <EmptyState
            title="No matching questions"
            description="Try a different keyword, or send me your question directly."
          />
          <div className="flex flex-wrap items-center justify-center gap-2">
            {isFiltering ? (
              <Button type="button" variant="outline" onClick={clearFilters}>
                Clear search
              </Button>
            ) : null}
            {showCta ? (
              <Button>
                <NextLink href={contactHref}>Ask your question</NextLink>
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        <Accordion multiple={false} defaultValue={["faq-1"]} className="...">
          {filtered.map((faq) => (
            <AccordionItem
              key={faq.id}
              id={`faq-${faq.id}`}
              value={String(faq.id)}
              className="scroll-mt-24 rounded-xl border border-border/60 bg-card px-5 shadow-sm transition-colors duration-200 last:border-b hover:border-primary/30 data-[state=open]:border-primary/40 motion-reduce:transition-none"
            >
              <AccordionTrigger className="gap-4 py-4 text-left text-base font-medium leading-snug hover:no-underline focus-visible:ring-primary/40">
                <span>
                  <Highlight text={faq.question} term={term} />
                </span>
              </AccordionTrigger>
              <AccordionContent className="leading-relaxed text-muted-foreground">
                <p className="whitespace-pre-line">
                  <Highlight text={faq.answer} term={term} />
                </p>
                <CopyQuestionLink id={faq.id} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {showCta && filtered.length > 0 ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-muted/30 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex flex-col gap-1">
            <p className="text-base font-semibold tracking-tight">
              Still have a question?
            </p>
            <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
              Tell me about your project and I will reply to your email.
            </p>
          </div>
          <Button size="lg" className="w-full sm:w-auto">
            <NextLink href={contactHref}>Discuss your project</NextLink>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
