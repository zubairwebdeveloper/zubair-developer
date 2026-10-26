"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiCopy,
  FiCpu,
  FiFileText,
  FiRefreshCw,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import { ChatComposer } from "@/components/chatbot/ChatComposer";
import { ChatMessage } from "@/components/chatbot/ChatMessage";
import { ProjectBriefReview } from "@/components/chatbot/ProjectBriefReview";
import { SuggestedPrompts } from "@/components/chatbot/SuggestedPrompts";
import { Button, buttonVariants } from "@/components/ui/button";
import { postJson } from "@/lib/utils/submit-form";

const MAX_HISTORY = 10;
const REVIEW_AFTER_USER_MESSAGES = 2;

async function streamChat({ history, sessionId, signal, onChunk }) {
  let response;
  try {
    response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history, sessionId }),
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(
      "Network error. Please check your connection and try again.",
    );
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      body?.error?.message ??
        "The assistant could not answer. Please try again.",
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }
}

const toHistory = (messages) =>
  messages
    .filter((message) => message.content)
    .slice(-MAX_HISTORY)
    .map(({ role, content }) => ({ role, content }));

export default function ChatPanel({ config, open, onClose }) {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | streaming
  const [error, setError] = useState("");
  const [mode, setMode] = useState("chat"); // chat | review | done
  const [review, setReview] = useState(null);
  const [preparing, setPreparing] = useState(false);
  const [reference, setReference] = useState(null);
  const [copied, setCopied] = useState(false);
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());

  const abortRef = useRef(null);
  const logRef = useRef(null);
  const inputRef = useRef(null);
  const copyTimerRef = useRef(null);

  const streaming = status === "streaming";
  const userCount = messages.filter(
    (message) => message.role === "user",
  ).length;

  useEffect(
    () => () => {
      abortRef.current?.abort();
      clearTimeout(copyTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (open && mode === "chat") inputRef.current?.focus();
  }, [open, mode]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages, mode]);

  const send = useCallback(
    async (text, base) => {
      const userMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
      };
      const assistantId = crypto.randomUUID();
      const next = [...base, userMessage];

      setMessages([
        ...next,
        { id: assistantId, role: "assistant", content: "" },
      ]);
      setStatus("streaming");
      setError("");

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await streamChat({
          history: toHistory(next),
          sessionId,
          signal: controller.signal,
          onChunk: (chunk) =>
            setMessages((current) =>
              current.map((message) =>
                message.id === assistantId
                  ? { ...message, content: message.content + chunk }
                  : message,
              ),
            ),
        });
      } catch (err) {
        if (err.name === "AbortError") return;
        setMessages((current) =>
          current.filter((m) => !(m.id === assistantId && m.content === "")),
        );
        setError(
          err instanceof TypeError
            ? "The connection was interrupted. Please retry."
            : err.message,
        );
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
          setStatus("idle");
        }
      }
    },
    [sessionId],
  );

  function retry() {
    const lastUser = messages.findLastIndex(
      (message) => message.role === "user",
    );
    if (lastUser === -1) return;
    send(messages[lastUser].content, messages.slice(0, lastUser));
  }

  function clearConversation() {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setStatus("idle");
    setError("");
    setMode("chat");
    setReview(null);
    setReference(null);
    setCopied(false);
    setSessionId(crypto.randomUUID());
  }

  async function startReview() {
    setPreparing(true);
    setError("");

    let result = { draft: {}, estimate: null };
    let notice = "";

    try {
      result = await postJson("/api/ai/brief", {
        messages: toHistory(messages),
      });
    } catch {
      // Prefill fail ho to bhi user manual brief bhar sakta hai.
      notice =
        "I couldn't pre-fill the brief automatically, so please fill in the details below.";
    }

    setReview({ ...result, notice });
    setMode("review");
    setPreparing(false);
  }

  async function copyReference() {
    if (!reference) return;
    try {
      await navigator.clipboard.writeText(String(reference));
      setCopied(true);
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard block ho to reference screen par visible rehta hai.
    }
  }

  return (
    <div
      id="ai-chat-panel"
      role="dialog"
      aria-label={`${config.name} chat`}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
      className="fixed right-4 bottom-[calc(max(1rem,env(safe-area-inset-bottom))+4rem)] z-50 flex h-[min(36rem,calc(100svh-7rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10 sm:right-6 sm:bottom-24 sm:w-[24rem] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border bg-gradient-to-b from-primary/10 to-transparent px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-primary/20 bg-primary/10 text-primary"
          >
            <FiCpu className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-heading text-sm leading-tight font-semibold">
              {config.name}
            </p>
            <p className="text-xs text-muted-foreground">AI assistant</p>
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Clear conversation"
            title="Clear conversation"
            onClick={clearConversation}
          >
            <FiTrash2 aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close chat"
            title="Close chat"
            onClick={onClose}
          >
            <FiX aria-hidden="true" />
          </Button>
        </div>
      </div>

      {mode === "review" && review ? (
        <div className="flex-1 overflow-y-auto overscroll-contain p-4">
          <ProjectBriefReview
            initial={review.draft}
            estimate={review.estimate}
            notice={review.notice}
            transcript={toHistory(messages)}
            onBack={() => setMode("chat")}
            onSubmitted={(ref) => {
              setReference(ref);
              setMode("done");
            }}
          />
        </div>
      ) : mode === "done" ? (
        <div
          role="status"
          className="flex flex-1 flex-col items-start justify-center gap-4 p-6"
        >
          <span
            aria-hidden="true"
            className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary"
          >
            <FiCheckCircle className="size-6" />
          </span>
          <div className="space-y-1.5">
            <h3 className="text-card-title">Your brief was submitted</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Thank you. I will review it and reply using your preferred contact
              method.
            </p>
          </div>
          {reference ? (
            <div className="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2">
              <p className="min-w-0 text-sm">
                <span className="text-muted-foreground">Reference: </span>
                <span className="font-mono break-all">{reference}</span>
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={copyReference}
                aria-label="Copy reference"
              >
                {copied ? (
                  <FiCheck aria-hidden="true" />
                ) : (
                  <FiCopy aria-hidden="true" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          ) : null}
          <Button type="button" variant="outline" onClick={clearConversation}>
            Start a new chat
          </Button>
        </div>
      ) : (
        <>
          <div
            ref={logRef}
            role="log"
            aria-live="polite"
            aria-label="Conversation"
            className="flex flex-1 flex-col gap-3 overflow-y-auto overscroll-contain p-4"
          >
            <ChatMessage
              message={{ role: "assistant", content: config.welcomeMessage }}
            />
            {messages.length === 0 ? (
              <SuggestedPrompts
                prompts={config.suggestedPrompts}
                disabled={streaming}
                onPick={(prompt) => send(prompt, [])}
              />
            ) : null}
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                streaming={streaming && index === messages.length - 1}
              />
            ))}
            {error ? (
              <div
                role="alert"
                className="flex flex-col gap-2.5 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
              >
                <p>{error}</p>
                <div className="flex flex-wrap gap-2">
                  {messages.length > 0 ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={retry}
                      disabled={streaming}
                    >
                      <FiRefreshCw aria-hidden="true" /> Retry
                    </Button>
                  ) : null}
                  <Link
                    href="/contact"
                    className={buttonVariants({
                      size: "sm",
                      variant: "outline",
                    })}
                  >
                    Use the contact form
                  </Link>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 border-t border-border bg-card p-3">
            {userCount >= REVIEW_AFTER_USER_MESSAGES ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="w-full"
                disabled={streaming || preparing}
                onClick={startReview}
              >
                <FiFileText aria-hidden="true" />
                {preparing ? "Preparing…" : "Review my brief"}
              </Button>
            ) : null}
            <ChatComposer
              onSend={(text) => send(text, messages)}
              disabled={streaming}
              inputRef={inputRef}
            />
            <p className="px-1 text-xs leading-relaxed text-muted-foreground">
              {config.handoffMessage}{" "}
              <Link
                href="/contact"
                className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
              >
                Contact form
              </Link>
            </p>
            <details className="group px-1 text-xs text-muted-foreground">
              <summary className="flex cursor-pointer list-none items-center gap-1 rounded-sm select-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none [&::-webkit-details-marker]:hidden">
                About this assistant
                <FiChevronDown
                  aria-hidden="true"
                  className="size-3.5 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                />
              </summary>
              <p className="mt-1.5 leading-relaxed">
                AI can make mistakes. Don&rsquo;t share passwords or payment
                details. Messages are sent to Google Gemini to generate replies.{" "}
                {config.storesConversations
                  ? "This site also stores conversations for a limited time."
                  : "This site does not store the conversation unless you submit a brief."}
              </p>
            </details>
          </div>
        </>
      )}
    </div>
  );
}
