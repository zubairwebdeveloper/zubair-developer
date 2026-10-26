"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";
import { ArrowRight, Bot, Check, Copy, Globe, Workflow } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];
const OFFSET = 40;

const BRIEFS = [
  {
    id: "web",
    label: "Web development",
    icon: Globe,
    subject: "Web development project",
    intro: "Best for business websites, web apps, dashboards and portfolios.",
    questions: [
      "What is the main goal of the website or app?",
      "Who will use it, and what should they be able to do?",
      "Which pages or features do you need first?",
      "Do you have a design, brand guide or examples you like?",
      "Is there an existing website or system to connect with?",
      "Your deadline and budget range (optional)",
    ],
  },
  {
    id: "saas",
    label: "SaaS product",
    icon: Workflow,
    subject: "SaaS product project",
    intro: "Best for software you want to offer to customers as a service.",
    questions: [
      "What problem does your product solve, and for whom?",
      "What should the first usable version (MVP) include?",
      "Do users need accounts, roles or subscriptions?",
      "Which tools or services must it integrate with?",
      "Is this a new product or a rebuild of an existing one?",
      "Your deadline and budget range (optional)",
    ],
  },
  {
    id: "chatbot",
    label: "AI chatbot",
    icon: Bot,
    subject: "AI chatbot automation project",
    intro: "Best for support bots, FAQ bots and lead capture automation.",
    questions: [
      "What should the chatbot do (support, FAQs, lead capture)?",
      "Where should it run (website, WhatsApp, other)?",
      "What information should it answer from (docs, FAQs, website)?",
      "When should it hand over to a real person?",
      "Which tools should it connect to (CRM, email, helpdesk)?",
      "Your deadline and budget range (optional)",
    ],
  },
];

const IDS = BRIEFS.map((b) => b.id);

function buildTemplate(brief) {
  const lines = brief.questions.map((q, i) => `${i + 1}. ${q}\n   Answer: `);
  return `Hi, I would like to discuss a project.\n\nProject type: ${brief.label}\n\n${lines.join("\n\n")}\n\nThank you!`;
}

export function BriefHelper({ email }) {
  const reduce = useReducedMotion();
  const [view, setView] = useState({ id: "web", dir: 1 });
  const [status, setStatus] = useState("idle"); // idle | copied | error
  const timer = useRef(null);
  const tabRefs = useRef({});

  useEffect(() => () => clearTimeout(timer.current), []);

  const index = IDS.indexOf(view.id);
  const brief = BRIEFS[index];
  const template = buildTemplate(brief);

  function go(id, focus = false) {
    if (id === view.id) return;
    setView({ id, dir: IDS.indexOf(id) > index ? 1 : -1 });
    setStatus("idle");
    if (focus) tabRefs.current[id]?.focus();
  }

  function onKeyDown(event) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % BRIEFS.length;
    else if (event.key === "ArrowLeft")
      next = (index - 1 + BRIEFS.length) % BRIEFS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = BRIEFS.length - 1;
    else return;
    event.preventDefault();
    go(IDS[next], true);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(template);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2200);
  }

  const mailto = email
    ? `mailto:${email}?subject=${encodeURIComponent(brief.subject)}&body=${encodeURIComponent(template)}`
    : null;

  const custom = { dir: view.dir, reduce: Boolean(reduce) };
  const variants = {
    enter: ({ dir, reduce: r }) => ({ opacity: 0, x: r ? 0 : dir * OFFSET }),
    center: { opacity: 1, x: 0 },
    exit: ({ dir, reduce: r }) => ({ opacity: 0, x: r ? 0 : -dir * OFFSET }),
  };

  return (
    <div className="border-border bg-card flex min-w-0 flex-col gap-6 rounded-2xl border p-4 sm:p-6 lg:p-8">
      <LayoutGroup id="brief-tabs">
        <div
          role="tablist"
          aria-label="Project type"
          onKeyDown={onKeyDown}
          className="bg-muted -mx-1 flex gap-1 overflow-x-auto rounded-xl p-1"
        >
          {BRIEFS.map(({ id, label, icon: Icon }) => {
            const selected = view.id === id;
            return (
              <button
                key={id}
                ref={(node) => {
                  tabRefs.current[id] = node;
                }}
                type="button"
                role="tab"
                id={`brief-tab-${id}`}
                aria-selected={selected}
                aria-controls={`brief-panel-${id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => go(id)}
                className={`focus-visible:ring-ring relative flex min-h-11 flex-1 shrink-0 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium whitespace-nowrap outline-none transition-colors focus-visible:ring-2 motion-reduce:transition-none ${
                  selected
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {selected ? (
                  <motion.span
                    layoutId="brief-tab-indicator"
                    aria-hidden="true"
                    className="bg-background absolute inset-0 rounded-lg shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 36 }
                    }
                  />
                ) : null}
                <Icon aria-hidden="true" className="relative z-10 size-4" />
                <span className="relative z-10">{label}</span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>

      <div className="overflow-x-clip">
        <AnimatePresence mode="wait" initial={false} custom={custom}>
          <motion.div
            key={view.id}
            custom={custom}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduce ? 0.01 : 0.3, ease: EASE }}
            role="tabpanel"
            id={`brief-panel-${view.id}`}
            aria-labelledby={`brief-tab-${view.id}`}
            className="flex flex-col gap-5"
          >
            <p className="text-muted-foreground leading-7">{brief.intro}</p>
            <ol className="grid gap-3 md:grid-cols-2">
              {brief.questions.map((q, i) => (
                <li
                  key={q}
                  className="border-border bg-background flex items-start gap-3 rounded-xl border p-4 text-sm"
                >
                  <span
                    aria-hidden="true"
                    className="bg-primary/10 text-primary flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold tabular-nums"
                  >
                    {i + 1}
                  </span>
                  <span className="leading-6">{q}</span>
                </li>
              ))}
            </ol>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="border-border flex flex-col gap-3 border-t pt-5 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={copy}
          className="border-border bg-background hover:bg-muted focus-visible:ring-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none"
        >
          {status === "copied" ? (
            <Check aria-hidden="true" className="text-primary size-4" />
          ) : (
            <Copy aria-hidden="true" className="size-4" />
          )}
          {status === "copied"
            ? "Template copied"
            : status === "error"
              ? "Copy failed"
              : "Copy brief template"}
        </button>

        {mailto ? (
          <a
            href={mailto}
            className="group bg-primary text-primary-foreground focus-visible:ring-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 motion-safe:active:scale-[0.98]"
          >
            Open in mail app
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
            />
          </a>
        ) : null}

        <a
          href="#contact-form"
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex min-h-11 items-center justify-center rounded-lg px-2 text-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-2 sm:ml-auto"
        >
          Or use the form above
        </a>

        <span className="sr-only" role="status" aria-live="polite">
          {status === "copied" ? "Brief template copied to clipboard" : ""}
          {status === "error" ? "Could not copy the template" : ""}
        </span>
      </div>
    </div>
  );
}
