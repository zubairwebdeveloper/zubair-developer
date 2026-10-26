"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { FormError } from "@/components/forms/shared/FormStatus";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/cn";
import { postJson } from "@/lib/utils/submit-form";

const MAX_LENGTH = 1000;
const MAX_HISTORY = 5;

/** Common client questions worth testing. Selecting one only fills the box. */
const suggestedQuestions = [
  "How much is an e-commerce website?",
  "What services do you offer?",
  "How long does a SaaS project usually take?",
  "Can you build an AI chatbot for my business?",
  "How do I discuss my project with you?",
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function formatDuration(ms) {
  if (typeof ms !== "number") return null;
  return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(1)} s`;
}

function Spinner() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4 animate-spin motion-reduce:animate-none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ReplySkeleton() {
  return (
    <div className="flex flex-col gap-2.5" aria-hidden="true">
      <div className="h-3.5 w-11/12 animate-pulse rounded bg-muted motion-reduce:animate-none" />
      <div className="h-3.5 w-full animate-pulse rounded bg-muted motion-reduce:animate-none" />
      <div className="h-3.5 w-3/4 animate-pulse rounded bg-muted motion-reduce:animate-none" />
    </div>
  );
}

export function AiPlayground() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [duration, setDuration] = useState(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [history, setHistory] = useState([]);
  const [copyStatus, setCopyStatus] = useState("idle"); // idle | copied | error

  const nextId = useRef(0);
  const copyTimer = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const trimmed = message.trim();
  const canRun = !pending && trimmed.length > 0;
  const sources = Array.isArray(result?.sources) ? result.sources : [];
  const remaining = MAX_LENGTH - message.length;

  async function onRun() {
    if (!canRun) return;

    setPending(true);
    setError("");
    setResult(null);
    setDuration(null);
    setCopyStatus("idle");

    const startedAt = performance.now();
    try {
      const response = await postJson("/api/admin/ai/test", { message });
      const elapsed = performance.now() - startedAt;

      setResult(response);
      setDuration(elapsed);
      setHistory((items) =>
        [
          {
            id: nextId.current++,
            message,
            result: response,
            duration: elapsed,
          },
          ...items,
        ].slice(0, MAX_HISTORY),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  function onKeyDown(event) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      onRun();
    }
  }

  function applySuggestion(question) {
    setMessage(question);
    setError("");
    textareaRef.current?.focus();
  }

  function onClear() {
    setMessage("");
    setResult(null);
    setDuration(null);
    setError("");
    textareaRef.current?.focus();
  }

  function restore(entry) {
    setMessage(entry.message);
    setResult(entry.result);
    setDuration(entry.duration);
    setError("");
    setCopyStatus("idle");
  }

  async function copyReply() {
    try {
      await navigator.clipboard.writeText(result.reply ?? "");
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopyStatus("idle"), 2200);
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      {/* Input */}
      <section
        aria-labelledby="playground-heading"
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1">
          <h2 id="playground-heading" className="text-base font-semibold">
            Ask your assistant a question
          </h2>
          <p className="max-w-prose text-sm text-muted-foreground">
            Type what a visitor might ask. The reply uses your current assistant
            settings and knowledge entries, so you can check answers before
            clients see them.
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="playground-message">Test question</FieldLabel>
          <Textarea
            id="playground-message"
            ref={textareaRef}
            rows={4}
            maxLength={MAX_LENGTH}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={onKeyDown}
            aria-describedby="playground-hint"
            placeholder="e.g. How much is an e-commerce website?"
          />
          <div
            id="playground-hint"
            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground"
          >
            <span>Press Ctrl or ⌘ + Enter to run.</span>
            <span
              className={cn(remaining <= 100 && "font-medium text-foreground")}
            >
              {message.length} / {MAX_LENGTH}
            </span>
          </div>
        </Field>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Try a common question</p>
          <ul className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question) => (
              <li key={question}>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => applySuggestion(question)}
                  className={cn(
                    "rounded-full border border-border bg-card px-3 py-1.5 text-left text-sm text-muted-foreground transition-colors motion-reduce:transition-none",
                    "hover:border-primary/40 hover:bg-primary/5 hover:text-foreground",
                    "disabled:pointer-events-none disabled:opacity-50",
                    focusRing,
                  )}
                >
                  {question}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            onClick={onRun}
            disabled={!canRun}
            className="gap-2"
          >
            {pending ? <Spinner /> : null}
            <span>{pending ? "Thinking…" : "Run test"}</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onClear}
            disabled={pending || (!message && !result && !error)}
          >
            Clear
          </Button>
        </div>
      </section>

      <FormError message={error} />

      {/* Response */}
      <div role="status" aria-live="polite" aria-busy={pending}>
        {pending ? (
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5">
            <p className="text-sm font-medium text-muted-foreground">
              Generating a reply…
            </p>
            <ReplySkeleton />
          </div>
        ) : null}

        {!pending && result ? (
          <article className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 text-sm sm:p-5">
            <header className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-col">
                <h3 className="text-sm font-semibold">Assistant reply</h3>
                {formatDuration(duration) ? (
                  <p className="text-xs text-muted-foreground">
                    Answered in {formatDuration(duration)}
                  </p>
                ) : null}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyReply}
              >
                {copyStatus === "copied"
                  ? "Reply copied"
                  : copyStatus === "error"
                    ? "Copy failed"
                    : "Copy reply"}
              </Button>
            </header>

            <p className="max-w-prose whitespace-pre-wrap text-base leading-relaxed">
              {result.reply}
            </p>

            <footer className="flex flex-col gap-2 border-t border-border/60 pt-4">
              <p className="text-sm font-medium">Knowledge used</p>
              {sources.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {sources.map((source) => (
                    <li
                      key={source}
                      className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-foreground ring-1 ring-primary/20"
                    >
                      {source}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="max-w-prose text-muted-foreground">
                  No knowledge entries matched this question, so the assistant
                  answered without your saved information. If this answer is
                  wrong or vague,{" "}
                  <Link
                    href="/admin/ai-knowledge"
                    className={cn(
                      "rounded-sm text-foreground underline underline-offset-4",
                      focusRing,
                    )}
                  >
                    add an entry in AI knowledge
                  </Link>{" "}
                  and test again.
                </p>
              )}
            </footer>
          </article>
        ) : null}
      </div>

      {/* Session history */}
      {history.length > 0 ? (
        <section
          aria-labelledby="playground-history"
          className="flex flex-col gap-3"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 id="playground-history" className="text-sm font-semibold">
              Recent tests in this session
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => setHistory([])}
            >
              Clear history
            </Button>
          </div>
          <ul className="flex flex-col gap-2">
            {history.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => restore(entry)}
                  className={cn(
                    "flex w-full flex-col gap-0.5 rounded-lg border border-border bg-card px-3 py-2.5 text-left transition-colors motion-reduce:transition-none",
                    "hover:border-primary/40 hover:bg-primary/5 disabled:pointer-events-none disabled:opacity-50",
                    focusRing,
                  )}
                >
                  <span className="truncate text-sm font-medium">
                    {entry.message}
                  </span>
                  <span className="line-clamp-1 text-xs text-muted-foreground">
                    {entry.result?.reply}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            History is kept only until you leave or refresh this page.
          </p>
        </section>
      ) : null}
    </div>
  );
}
