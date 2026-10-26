"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bot, CheckCircle2, Database, LayoutTemplate } from "lucide-react";

import { cn } from "@/lib/utils/cn";

const TABS = [
  { id: "frontend", label: "Frontend", icon: LayoutTemplate },
  { id: "backend", label: "Backend", icon: Database },
  { id: "ai", label: "AI chatbot", icon: Bot },
];

const CAPTIONS = {
  frontend: "A responsive interface assembled from reusable components.",
  backend: "A validated request, an auth check and a database write.",
  ai: "A website assistant guiding a visitor to the right service.",
};

const STACK = ["Next.js", "React", "Tailwind CSS", "Firebase", "Zod"];

const CHAT = [
  { from: "visitor", text: "Can you help me choose a service?" },
  { from: "assistant", text: "Absolutely. What are you looking to build?" },
  { from: "visitor", text: "A website for my business." },
  {
    from: "assistant",
    text: "Great! Let's explore the features and approach that fit your needs.",
  },
];

const API_STEPS = [
  "POST /api/inquiry",
  "Validate input with Zod",
  "Verify session",
  "Save to Firestore",
];

function Dots() {
  return (
    <span aria-hidden="true" className="flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-2.5 rounded-full bg-muted-foreground/30"
        />
      ))}
    </span>
  );
}

function FrontendPanel({ reduce }) {
  const rise = (i) => ({
    initial: reduce ? false : { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: reduce ? 0 : 0.15 + i * 0.12, duration: 0.3 },
  });

  return (
    <div className="grid h-full gap-3 sm:grid-cols-[1.5fr_1fr]">
      <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-background">
        <div className="flex items-center gap-3 border-b border-border px-3 py-2">
          <Dots />
          <span className="truncate rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
            yourbusiness.com
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-3">
          <motion.div {...rise(0)} className="h-2 w-1/3 rounded bg-muted" />
          <motion.div
            {...rise(1)}
            className="h-4 w-4/5 rounded bg-foreground/80"
          />
          <motion.div
            {...rise(2)}
            className="h-4 w-3/5 rounded bg-foreground/80"
          />
          <motion.div {...rise(3)} className="h-7 w-24 rounded-md bg-primary" />
          <div className="mt-auto grid grid-cols-3 gap-2">
            {[4, 5, 6].map((i) => (
              <motion.div
                key={i}
                {...rise(i)}
                className="h-14 rounded-lg border border-border bg-card"
              />
            ))}
          </div>
        </div>
      </div>

      <pre
        aria-label="Component structure"
        className="hidden overflow-hidden rounded-xl border border-border bg-muted/50 p-3 font-mono text-[11px] leading-5 text-muted-foreground sm:block"
      >
        {`<Layout>
  <Header />
  <Hero />
  <Services />
  <Projects />
  <ContactForm />
</Layout>`}
      </pre>
    </div>
  );
}

function BackendPanel({ reduce }) {
  return (
    <div className="grid h-full gap-3 sm:grid-cols-2">
      <ol className="flex flex-col gap-2">
        {API_STEPS.map((step, i) => (
          <motion.li
            key={step}
            initial={reduce ? false : { opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: reduce ? 0 : 0.15 + i * 0.35, duration: 0.3 }}
            className="flex items-center gap-2.5 rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-medium text-foreground"
          >
            <CheckCircle2
              aria-hidden="true"
              className="size-4 shrink-0 text-primary"
            />
            <span className="font-mono">{step}</span>
          </motion.li>
        ))}
      </ol>
      <pre
        aria-label="Example API route"
        className="overflow-hidden rounded-xl border border-border bg-muted/50 p-3 font-mono text-[11px] leading-5 text-muted-foreground"
      >
        {`export async function POST(req) {
  const data = schema.parse(
    await req.json()
  );
  await db
    .collection("inquiries")
    .add(data);
  return Response.json({ ok: true });
}`}
      </pre>
    </div>
  );
}

function AiPanel({ reduce }) {
  return (
    <div className="flex h-full flex-col gap-2.5 overflow-hidden rounded-xl border border-border bg-background p-3">
      {CHAT.map((message, i) => (
        <motion.p
          key={message.text}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduce ? 0 : 0.2 + i * 0.9, duration: 0.3 }}
          className={cn(
            "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-snug",
            message.from === "visitor"
              ? "self-end rounded-br-sm bg-primary text-primary-foreground"
              : "self-start rounded-bl-sm bg-muted text-foreground",
          )}
        >
          <span className="sr-only">
            {message.from === "visitor" ? "Visitor: " : "Assistant: "}
          </span>
          {message.text}
        </motion.p>
      ))}
    </div>
  );
}

const PANELS = { frontend: FrontendPanel, backend: BackendPanel, ai: AiPanel };

export function HeroWorkspace() {
  const reduce = Boolean(useReducedMotion());
  const [active, setActive] = useState("frontend");
  const [paused, setPaused] = useState(false);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (reduce || paused || manual) return undefined;
    const timer = setInterval(() => {
      setActive((current) => {
        const index = TABS.findIndex((tab) => tab.id === current);
        return TABS[(index + 1) % TABS.length].id;
      });
    }, 7000);
    return () => clearInterval(timer);
  }, [reduce, paused, manual]);

  const choose = (id) => {
    setManual(true);
    setActive(id);
  };

  const onKeyDown = (event) => {
    const step =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const index = TABS.findIndex((tab) => tab.id === active);
    const next = TABS[(index + step + TABS.length) % TABS.length];
    choose(next.id);
    document.getElementById(`workspace-tab-${next.id}`)?.focus();
  };

  const Panel = PANELS[active];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="flex w-full flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-4"
    >
      <div
        role="tablist"
        aria-label="How a digital product fits together"
        onKeyDown={onKeyDown}
        className="flex gap-1 rounded-xl bg-muted p-1"
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const selected = id === active;
          return (
            <button
              key={id}
              id={`workspace-tab-${id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="workspace-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => choose(id)}
              className={cn(
                "flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg px-2 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none sm:text-sm",
                selected
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon aria-hidden="true" className="size-4 shrink-0" />
              {label}
            </button>
          );
        })}
      </div>

      <div
        id="workspace-panel"
        role="tabpanel"
        aria-labelledby={`workspace-tab-${active}`}
        className="h-[19rem] sm:h-[20rem]"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduce ? 0 : 0.22 }}
            className="h-full"
          >
            <Panel reduce={reduce} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-3">
        <p aria-live="polite" className="text-sm text-foreground">
          {CAPTIONS[active]}
        </p>
        <ul aria-label="Technologies" className="flex flex-wrap gap-1.5">
          {STACK.map((item) => (
            <li
              key={item}
              className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              {item}
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">
          Illustrative preview. Not a live AI model or a real request.
        </p>
      </div>
    </div>
  );
}
