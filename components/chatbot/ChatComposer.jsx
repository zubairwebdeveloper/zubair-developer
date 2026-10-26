"use client";

import { useId, useState } from "react";
import { FiSend } from "react-icons/fi";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const MAX_LENGTH = 1000;
const COUNTER_THRESHOLD = 800;

export function ChatComposer({ onSend, disabled, inputRef }) {
  const [value, setValue] = useState("");
  const hintId = useId();

  const canSend = !disabled && value.trim().length > 0;
  const showCounter = value.length >= COUNTER_THRESHOLD;

  function submit() {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="space-y-1.5"
    >
      <div
        className={`flex items-end gap-2 rounded-2xl border border-border bg-background p-1.5 shadow-sm transition-colors duration-200 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/40 motion-reduce:transition-none ${
          disabled ? "opacity-70" : ""
        }`}
      >
        <Textarea
          ref={inputRef}
          value={value}
          rows={1}
          maxLength={MAX_LENGTH}
          aria-label="Your message"
          aria-describedby={hintId}
          placeholder="Type your question…"
          className="max-h-28 min-h-10 flex-1 resize-none border-0 bg-transparent px-3 py-2 text-base shadow-none [field-sizing:content] focus-visible:ring-0 sm:text-sm"
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            // IME composition ke dauran Enter send na kare.
            if (event.nativeEvent.isComposing) return;
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
        />
        <Button
          type="submit"
          size="icon"
          aria-label="Send message"
          disabled={!canSend}
          className="size-10 shrink-0 rounded-xl transition-all duration-200 enabled:hover:-translate-y-0.5 enabled:active:scale-95 motion-reduce:transition-none motion-reduce:enabled:hover:translate-y-0 motion-reduce:enabled:active:scale-100"
        >
          <FiSend aria-hidden="true" />
        </Button>
      </div>

      <div className="flex items-center justify-between gap-3 px-2 text-xs text-muted-foreground">
        <p id={hintId} className="hidden sm:block">
          Enter to send · Shift+Enter for a new line
        </p>
        {showCounter ? (
          <p
            role="status"
            className={`ml-auto tabular-nums ${
              value.length >= MAX_LENGTH ? "text-destructive" : ""
            }`}
          >
            {value.length}/{MAX_LENGTH}
          </p>
        ) : null}
      </div>
    </form>
  );
}
