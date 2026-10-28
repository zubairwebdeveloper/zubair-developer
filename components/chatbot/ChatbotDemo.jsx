"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { Bot, Check, Pause, Play, RotateCcw, User } from "lucide-react";

import { cn } from "@/lib/utils/cn";

const SCRIPT = [
  { from: "bot", text: "Hi. What would you like to build?" },
  {
    from: "bot",
    text: "Choose an option to get started.",
    replies: ["Business website", "Online store", "Web application"],
  },
  { from: "user", text: "Online store" },
  { from: "bot", text: "What name should I use for your project brief?" },
  { from: "user", text: "I'll share it in the project form." },
  { from: "bot", text: "Do you have a budget range in mind?" },
  { from: "user", text: "I haven't set one yet." },
  {
    from: "bot",
    text: "That's fine. The project form can capture the details and route them to your team.",
  },
];

function TypingIndicator() {
  return (
    <span className="inline-flex items-center gap-1 px-1" aria-hidden="true">
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          className="size-1.5 rounded-full bg-current opacity-50 motion-safe:animate-bounce"
          style={{ animationDelay: `${dot * 140}ms` }}
        />
      ))}
    </span>
  );
}

function Message({ message, typing }) {
  const isBot = message.from === "bot";

  return (
    <div
      className={cn(
        "flex items-end gap-2 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-300",
        isBot ? "justify-start" : "justify-end",
      )}
    >
      {isBot ? (
        <span
          aria-hidden="true"
          className="mb-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"
        >
          <Bot className="size-4" />
        </span>
      ) : null}
      <div
        className={cn(
          "max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          isBot
            ? "rounded-bl-sm bg-card text-foreground ring-1 ring-border"
            : "rounded-br-sm bg-primary text-primary-foreground",
        )}
      >
        {typing ? <TypingIndicator /> : message.text}
        {!typing && message.replies ? (
          <ul
            aria-label="Quick reply options"
            className="mt-3 flex flex-wrap gap-1.5"
          >
            {message.replies.map((reply) => (
              <li
                key={reply}
                className="rounded-full border border-primary/25 bg-background/70 px-2.5 py-1 text-xs text-foreground"
              >
                {reply}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {!isBot ? (
        <span
          aria-hidden="true"
          className="mb-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground"
        >
          <User className="size-4" />
        </span>
      ) : null}
    </div>
  );
}

function LeadPreview() {
  return (
    <div className="mx-4 mb-4 rounded-xl border border-border bg-card p-3">
      <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-foreground">
        <span
          aria-hidden="true"
          className="grid size-5 place-items-center rounded bg-emerald-500/10 text-emerald-600"
        >
          <Check className="size-3.5" />
        </span>
        Lead saved to Google Sheet
      </p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
        <dt className="text-muted-foreground">Name</dt>
        <dd className="text-foreground">Added in project form</dd>
        <dt className="text-muted-foreground">Need</dt>
        <dd className="text-foreground">Online store</dd>
        <dt className="text-muted-foreground">Budget</dt>
        <dd className="text-foreground">Not set yet</dd>
      </dl>
      <p className="mt-2 text-[10px] text-muted-foreground">
        Example record shown for this demo.
      </p>
    </div>
  );
}

export function ChatbotDemo() {
  const reduce = useReducedMotion();
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { once: true, margin: "-80px" });
  const [visibleCount, setVisibleCount] = useState(0);
  const [typingIndex, setTypingIndex] = useState(null);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef([]);
  const shownCount = reduce ? SCRIPT.length : visibleCount;
  const isComplete = shownCount >= SCRIPT.length;

  useEffect(() => {
    if (
      reduce ||
      !inView ||
      paused ||
      hovered ||
      visibleCount >= SCRIPT.length
    ) {
      return undefined;
    }

    const index = visibleCount;
    const typingTimer = window.setTimeout(() => setTypingIndex(index), 350);
    const messageTimer = window.setTimeout(() => {
      setTypingIndex(null);
      setVisibleCount((count) => count + 1);
    }, 1050);
    timerRef.current = [typingTimer, messageTimer];

    return () => {
      timerRef.current.forEach(window.clearTimeout);
      timerRef.current = [];
    };
  }, [hovered, inView, paused, reduce, visibleCount]);

  useEffect(
    () => () => timerRef.current.forEach(window.clearTimeout),
    [],
  );

  function replay() {
    timerRef.current.forEach(window.clearTimeout);
    timerRef.current = [];
    setTypingIndex(null);
    setVisibleCount(0);
    setPaused(false);
  }

  function togglePlayback() {
    if (isComplete) {
      replay();
      return;
    }
    setPaused((wasPaused) => !wasPaused);
  }

  return (
    <section
      aria-labelledby="chatbot-demo-heading"
      className="scroll-mt-28 py-16 md:py-24"
      ref={containerRef}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <div className="flex flex-col gap-5">
            <p className="text-eyebrow flex items-center gap-2 text-brand">
              <span
                aria-hidden="true"
                className="size-1 rounded-full bg-brand"
              />
              Chatbot automation
            </p>
            <h2
              id="chatbot-demo-heading"
              className="text-section-title text-balance"
            >
              Helpful conversations, with a clear handoff.
            </h2>
            <p className="text-body-lg max-w-prose text-pretty text-muted-foreground">
              A guided conversation can answer common questions, collect project
              details, and pass an enquiry to your team.
            </p>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              {[
                "Instagram DM and Messenger flows",
                "Lead capture and qualification",
                "FAQ automation and booking flows",
                "Google Sheets or CRM handoff",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-primary"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <span className="rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                Demo conversation
              </span>
              <button
                type="button"
                onClick={togglePlayback}
                disabled={Boolean(reduce)}
                aria-label={
                  isComplete
                    ? "Replay demo conversation"
                    : paused
                      ? "Play demo conversation"
                      : "Pause demo conversation"
                }
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isComplete ? (
                  <RotateCcw aria-hidden="true" className="size-4" />
                ) : paused ? (
                  <Play aria-hidden="true" className="size-4" />
                ) : (
                  <Pause aria-hidden="true" className="size-4" />
                )}
                {isComplete ? "Replay" : paused ? "Play" : "Pause"}
              </button>
            </div>

            <div
              className="overflow-hidden rounded-2xl border border-border bg-background shadow-md"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              onFocus={() => setHovered(true)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setHovered(false);
                }
              }}
            >
              <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
                <span
                  aria-hidden="true"
                  className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary"
                >
                  <Bot className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Project inquiry
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Conversation flow preview
                  </p>
                </div>
              </div>

              <div
                role="log"
                aria-live="off"
                aria-label="Scripted demo conversation"
                className="flex min-h-80 max-h-[34rem] flex-col gap-3 overflow-y-auto px-4 py-4"
              >
                {SCRIPT.slice(0, shownCount).map((message, index) => (
                  <Message key={index} message={message} typing={false} />
                ))}
                {typingIndex !== null && typingIndex === visibleCount ? (
                  <Message
                    message={SCRIPT[typingIndex]}
                    typing
                  />
                ) : null}
              </div>

              {isComplete ? <LeadPreview /> : null}

              <div
                aria-hidden="true"
                className="border-t border-border bg-card px-4 py-3"
              >
                <div className="rounded-full border border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
                  Message…
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Scripted example only. No real messages or lead records are sent.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
