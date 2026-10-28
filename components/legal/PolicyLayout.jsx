"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowUp,
  Check,
  ChevronDown,
  Link2,
  ListTree,
  Mail,
  Printer,
  Search,
  TriangleAlert,
  X,
} from "lucide-react";

import { Reveal } from "@/components/shared/Reveal";

const EASE = [0.22, 1, 0.36, 1];

const ghostButton =
  "border-border bg-background hover:bg-muted focus-visible:ring-ring inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none";

function Block({ block, showDraftNotes }) {
  if (block.type === "p") {
    return (
      <p className="text-foreground/85 max-w-[68ch] leading-7">{block.text}</p>
    );
  }
  if (block.type === "note") {
    return (
      <div
        role="note"
        className="border-border bg-muted/40 max-w-[68ch] rounded-xl border p-4 text-sm leading-6 text-muted-foreground"
      >
        {block.text}
      </div>
    );
  }
  if (block.type === "ul") {
    return (
      <ul className="flex max-w-[68ch] flex-col gap-2.5">
        {block.items.map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <span
              aria-hidden="true"
              className="bg-primary mt-2.5 size-1.5 shrink-0 rounded-full"
            />
            <span className="text-foreground/85 leading-7">{item}</span>
          </li>
        ))}
      </ul>
    );
  }
  if (block.type === "todo" && showDraftNotes) {
    return (
      <div
        role="note"
        className="border-border bg-muted/40 flex max-w-[68ch] items-start gap-3 rounded-xl border border-dashed p-4 print:hidden"
      >
        <TriangleAlert
          aria-hidden="true"
          className="text-muted-foreground mt-0.5 size-4 shrink-0"
        />
        <p className="text-muted-foreground text-sm leading-6">
          <span className="text-foreground font-medium">
            To be confirmed before publishing:{" "}
          </span>
          {block.text}
        </p>
      </div>
    );
  }
  return null;
}

function Toc({ sections, active, onPick, reduce }) {
  return (
    <LayoutGroup id="policy-toc">
      <ol className="flex flex-col gap-0.5">
        {sections.map((section, index) => {
          const selected = active === section.id;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={selected ? "location" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  onPick(section.id);
                }}
                className={`focus-visible:ring-ring relative flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm outline-none transition-colors focus-visible:ring-2 motion-reduce:transition-none ${
                  selected
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {selected ? (
                  <motion.span
                    layoutId="policy-toc-indicator"
                    aria-hidden="true"
                    className="bg-muted absolute inset-0 rounded-lg"
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 36 }
                    }
                  />
                ) : null}
                <span
                  aria-hidden="true"
                  className="text-muted-foreground/70 relative z-10 w-5 text-xs tabular-nums"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="relative z-10">{section.title}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </LayoutGroup>
  );
}

/**
 * sections: [{ id, title, summary?, blocks: [{type:"p"|"ul"|"todo", ...}] }]
 * highlights: [{ title, text }]
 * lastUpdated: string | null (sirf tab dikhti hai jab aap real date dein)
 */
export function PolicyLayout({
  sections,
  highlights = [],
  email = "",
  lastUpdated = null,
  showDraftNotes = true,
  showDataRequest = true,
  draftNote = "",
}) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const [tocOpen, setTocOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [copyError, setCopyError] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [query, setQuery] = useState("");
  const timer = useRef(null);
  const visibleSections = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return sections;
    return sections.filter((section) => {
      const content = [
        section.title,
        section.summary,
        ...(section.blocks ?? []).flatMap((block) => [
          block.text,
          ...(block.items ?? []),
        ]),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return content.includes(needle);
    });
  }, [sections, query]);
  const activeSection = visibleSections.some((section) => section.id === active)
    ? active
    : (visibleSections[0]?.id ?? "");

  // Scroll-spy: jo section screen ke upar hissay ma ho wo active
  useEffect(() => {
    const els = visibleSections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [visibleSections]);

  // Back-to-top button
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setShowTop(window.scrollY > 800);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  function goTo(id) {
    document.getElementById(id)?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
    window.history.replaceState(null, "", `#${id}`);
    setActive(id);
    setTocOpen(false);
  }

  async function copyLink(id) {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    try {
      await navigator.clipboard.writeText(url);
      window.history.replaceState(null, "", `#${id}`);
      setCopyError(false);
      setCopiedId(id);
    } catch {
      setCopyError(true);
      setCopiedId(null);
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setCopiedId(null);
      setCopyError(false);
    }, 2000);
  }

  const mailto = email
    ? `mailto:${email}?subject=${encodeURIComponent("Data request")}&body=${encodeURIComponent(
        "Hello,\n\nI would like to request:\n[ ] Access to my personal data\n[ ] Deletion of my personal data\n\nThe email address I used: \n\nThank you.",
      )}`
    : null;

  const activeTitle = visibleSections.find(
    (section) => section.id === activeSection,
  )?.title;

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-14">
      {/* Contents */}
      {visibleSections.length > 0 ? (
      <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start print:hidden">
        {/* Mobile: collapsible */}
        <div className="border-border bg-card rounded-2xl border lg:hidden">
          <button
            type="button"
            aria-expanded={tocOpen}
            aria-controls="policy-toc-mobile"
            onClick={() => setTocOpen((v) => !v)}
            className="focus-visible:ring-ring flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl px-4 text-left text-sm font-medium outline-none focus-visible:ring-2"
          >
            <span className="flex min-w-0 items-center gap-2">
              <ListTree
                aria-hidden="true"
                className="text-primary size-4 shrink-0"
              />
              <span className="truncate">{activeTitle ?? "On this page"}</span>
            </span>
            <ChevronDown
              aria-hidden="true"
              className={`text-muted-foreground size-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none ${
                tocOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          <AnimatePresence initial={false}>
            {tocOpen ? (
              <motion.div
                id="policy-toc-mobile"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: reduce ? 0.01 : 0.28, ease: EASE }}
                className="overflow-hidden"
              >
                <nav aria-label="Policy contents" className="px-2 pb-3">
                  <Toc
                    sections={visibleSections}
                    active={activeSection}
                    reduce={reduce}
                    onPick={goTo}
                  />
                </nav>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Desktop */}
        <nav aria-label="Policy contents" className="hidden lg:block">
          <p className="text-muted-foreground mb-3 px-3 text-xs font-medium">
            On this page
          </p>
          <Toc
            sections={visibleSections}
            active={activeSection}
            reduce={reduce}
            onPick={goTo}
          />
        </nav>
      </aside>
      ) : null}

      {/* Content */}
      <div className="flex min-w-0 flex-col gap-10">
        {/* Meta + tools */}
        <div className="flex flex-col gap-4 print:hidden">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-sm">
              {lastUpdated
                ? `Last updated: ${lastUpdated}`
                : "Plain-language policy"}
            </p>
            <button
              type="button"
              onClick={() => window.print()}
              className={ghostButton}
            >
              <Printer aria-hidden="true" className="size-4" />
              Print or save as PDF
            </button>
          </div>
          <div className="relative w-full sm:max-w-md">
            <label htmlFor="legal-search" className="sr-only">
              Search this document
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              id="legal-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search this document"
              className="min-h-11 w-full rounded-lg border border-border bg-background pl-9 pr-10 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
            {query ? (
              <button
                type="button"
                aria-label="Clear document search"
                onClick={() => setQuery("")}
                className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            ) : null}
          </div>
        </div>

        {draftNote ? (
          <div
            role="note"
            className="border-border bg-muted/40 rounded-xl border p-4 text-sm leading-6 text-muted-foreground"
          >
            {draftNote}
          </div>
        ) : null}

        {visibleSections.length === 0 ? (
          <div
            className="border-border bg-card flex flex-col items-start gap-3 rounded-2xl border border-dashed p-6 sm:p-8"
            role="status"
            aria-live="polite"
          >
            <h2 className="font-heading text-lg font-semibold">
              No matching sections
            </h2>
            <p className="text-muted-foreground text-sm leading-6">
              Try another word or clear your search to read the full document.
            </p>
            <button
              type="button"
              onClick={() => setQuery("")}
              className={ghostButton}
            >
              Clear search
            </button>
          </div>
        ) : (
          <p className="sr-only" role="status" aria-live="polite">
            Showing {visibleSections.length} of {sections.length} sections
          </p>
        )}

        {/* Highlights */}
        {highlights.length > 0 && !query.trim() ? (
          <ul aria-label="Key points" className="grid gap-4 md:grid-cols-3">
            {highlights.map((item) => (
              <li key={item.title}>
                <Reveal direction="up" className="h-full">
                  <div className="border-border bg-card hover:border-primary/40 h-full rounded-2xl border p-5 transition-colors duration-200 motion-reduce:transition-none">
                    <span
                      aria-hidden="true"
                      className="bg-primary/10 text-primary mb-3 flex size-9 items-center justify-center rounded-lg"
                    >
                      <Check className="size-[18px]" />
                    </span>
                    <h2 className="text-card-title">{item.title}</h2>
                    <p className="text-muted-foreground mt-2 text-sm leading-6">
                      {item.text}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        ) : null}

        {/* Sections */}
        <div id="policy-content" className="flex flex-col gap-10">
          {visibleSections.map((section, index) => (
            <Reveal key={section.id} direction="up">
              <section
                id={section.id}
                aria-labelledby={`${section.id}-title`}
                className="border-border flex scroll-mt-28 flex-col gap-4 border-t pt-8 first:border-t-0 first:pt-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span
                      aria-hidden="true"
                      className="text-muted-foreground/70 text-xs tabular-nums"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h2
                      id={`${section.id}-title`}
                      className="font-heading text-[clamp(1.25rem,2.4vw,1.625rem)] font-semibold tracking-tight text-balance"
                    >
                      {section.title}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyLink(section.id)}
                    aria-label={`Copy link to ${section.title}`}
                    className="border-border text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-ring flex size-10 shrink-0 items-center justify-center rounded-lg border outline-none transition-colors focus-visible:ring-2 motion-reduce:transition-none print:hidden"
                  >
                    {copiedId === section.id ? (
                      <Check
                        aria-hidden="true"
                        className="text-primary size-4"
                      />
                    ) : (
                      <Link2 aria-hidden="true" className="size-4" />
                    )}
                  </button>
                </div>

                {section.summary ? (
                  <p className="text-muted-foreground max-w-[68ch] leading-7">
                    {section.summary}
                  </p>
                ) : null}

                {section.blocks.map((block, i) => (
                  <Block
                    key={i}
                    block={block}
                    showDraftNotes={showDraftNotes}
                  />
                ))}
              </section>
            </Reveal>
          ))}
        </div>

        {/* Data request */}
        {showDataRequest && visibleSections.length > 0 ? (
          <Reveal direction="up">
            <div className="bg-foreground text-background relative isolate overflow-hidden rounded-3xl p-6 sm:p-10 print:hidden">
              <div
                aria-hidden="true"
                className="bg-primary/30 pointer-events-none absolute -top-20 -right-20 -z-10 size-64 rounded-full blur-3xl"
              />
              <div className="flex max-w-2xl flex-col gap-3">
                <h2 className="font-heading text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.15] font-semibold tracking-tight text-balance">
                  Want to access or delete your data?
                </h2>
                <p className="text-background/75 leading-7">
                  Send a request and say which one you need. Use the email address
                  you used on this website so it can be matched.
                </p>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  {mailto ? (
                    <a
                      href={mailto}
                      className="group bg-primary text-primary-foreground focus-visible:ring-primary focus-visible:ring-offset-foreground inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-medium outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 motion-safe:active:scale-[0.98]"
                    >
                      <Mail aria-hidden="true" className="size-4" />
                      Email a data request
                    </a>
                  ) : null}
                  <a
                    href="/contact"
                    className="border-background/25 hover:bg-background/10 focus-visible:ring-primary focus-visible:ring-offset-foreground inline-flex min-h-11 items-center justify-center rounded-lg border px-5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none"
                  >
                    Use the contact form
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        ) : null}
      </div>

      <span className="sr-only" role="status" aria-live="polite">
        {copiedId ? "Section link copied" : ""}
        {copyError ? "Could not copy the link" : ""}
      </span>

      {/* Back to top */}
      <AnimatePresence>
        {showTop ? (
          <motion.button
            type="button"
            aria-label="Back to top"
            onClick={() =>
              window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })
            }
            initial={{ opacity: 0, y: reduce ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : 16 }}
            transition={{ duration: reduce ? 0.01 : 0.25 }}
            className="bg-primary text-primary-foreground focus-visible:ring-ring fixed right-4 bottom-4 z-40 flex size-12 items-center justify-center rounded-full shadow-lg outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 sm:right-6 sm:bottom-6 print:hidden"
          >
            <ArrowUp aria-hidden="true" className="size-5" />
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
