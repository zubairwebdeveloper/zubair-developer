import { FiCpu } from "react-icons/fi";

import { cn } from "@/lib/utils/cn";

/** Content plain text ki tarah render hota hai (React escape karta hai), HTML kabhi nahi. */
export function ChatMessage({ message, streaming = false }) {
  const isUser = message.role === "user";
  const waiting = streaming && !message.content;

  return (
    <div
      className={cn(
        "flex items-end gap-2 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-200",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser ? (
        <span
          aria-hidden="true"
          className="mb-0.5 grid size-7 shrink-0 place-items-center rounded-full border border-primary/20 bg-primary/10 text-primary"
        >
          <FiCpu className="size-3.5" />
        </span>
      ) : null}

      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere] sm:max-w-[80%]",
          isUser
            ? "rounded-br-md bg-primary text-primary-foreground shadow-sm"
            : "rounded-bl-md border border-border/60 bg-muted text-foreground",
        )}
      >
        {waiting ? (
          <span role="status" className="flex gap-1 py-1">
            <span className="sr-only">Assistant is typing</span>
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-muted-foreground motion-safe:animate-pulse"
            />
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-muted-foreground motion-safe:animate-pulse [animation-delay:150ms]"
            />
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-muted-foreground motion-safe:animate-pulse [animation-delay:300ms]"
            />
          </span>
        ) : (
          <>
            <span className="sr-only">{isUser ? "You: " : "Assistant: "}</span>
            {message.content}
            {streaming && !isUser ? (
              <span
                aria-hidden="true"
                className="ml-0.5 inline-block h-3.5 w-0.5 translate-y-0.5 rounded-full bg-muted-foreground motion-safe:animate-pulse"
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
