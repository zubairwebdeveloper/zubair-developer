"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/utils/dates";
import { postJson } from "@/lib/utils/submit-form";

const LONG_NOTE_LENGTH = 280;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function getInitials(name) {
  const parts = String(name ?? "")
    .split(/[\s@._-]+/)
    .filter(Boolean);
  const initials = `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  return initials || "?";
}

function NoteItem({ note }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const isLong = String(note.text ?? "").length > LONG_NOTE_LENGTH;

  async function copyNote() {
    try {
      await navigator.clipboard.writeText(note.text ?? "");
      setCopied(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(
        "Could not copy the note. Select the text and copy it manually.",
      );
    }
  }

  return (
    <li className="flex gap-3">
      <span
        aria-hidden="true"
        className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary ring-1 ring-primary/20"
      >
        {getInitials(note.authorName)}
      </span>

      <div className="min-w-0 flex-1 rounded-xl border border-border bg-muted/40 p-3 text-sm">
        <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <p className="font-medium">{note.authorName}</p>
          <time dateTime={note.at} className="text-xs text-muted-foreground">
            {formatDateTime(note.at)}
          </time>
        </div>

        <p
          className={`whitespace-pre-wrap break-words leading-relaxed ${
            isLong && !expanded ? "line-clamp-4" : ""
          }`}
        >
          {note.text}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-1">
          {isLong ? (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
              className={`rounded-md px-1.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground motion-reduce:transition-none ${focusRing}`}
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={copyNote}
            className={`rounded-md px-1.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground motion-reduce:transition-none ${focusRing}`}
          >
            {copied ? "Copied" : "Copy note"}
          </button>
        </div>
      </div>
    </li>
  );
}

export function LeadNotes({ leadId, notes, canManage }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef(null);

  const ordered = useMemo(
    () => [...notes].sort((a, b) => Date.parse(b.at) - Date.parse(a.at)),
    [notes],
  );

  const canAdd = !saving && text.trim().length > 0;

  async function onAdd() {
    if (!text.trim()) return;
    setSaving(true);
    try {
      await postJson(`/api/admin/leads/${leadId}/notes`, { text });
      setText("");
      toast.success("Note added");
      router.refresh();
      textareaRef.current?.focus();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  function onKeyDown(event) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && canAdd) {
      event.preventDefault();
      onAdd();
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {canManage ? (
        <Field>
          <FieldLabel htmlFor="lead-note">Internal note</FieldLabel>
          <Textarea
            id="lead-note"
            ref={textareaRef}
            rows={3}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="What does the client need, what did you agree, what happens next?"
          />
          <FieldDescription>
            Notes are internal and are never shown to visitors. Press Ctrl or ⌘
            + Enter to add.
          </FieldDescription>
          <Button
            type="button"
            onClick={onAdd}
            disabled={!canAdd}
            className="w-fit"
          >
            {saving ? "Adding…" : "Add note"}
          </Button>
        </Field>
      ) : null}

      <section
        aria-labelledby="lead-notes-heading"
        className="flex flex-col gap-3"
      >
        <div className="flex items-baseline justify-between gap-3">
          <h3 id="lead-notes-heading" className="text-sm font-semibold">
            Notes ({ordered.length})
          </h3>
          {ordered.length > 1 ? (
            <span className="text-xs text-muted-foreground">Newest first</span>
          ) : null}
        </div>

        {ordered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-5 text-center">
            <p className="text-sm font-medium">No notes yet</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              {canManage
                ? "Add what you learn about this lead, such as their goals, budget, or what you promised, so nothing gets lost between conversations."
                : "Notes added by your team will appear here."}
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {ordered.map((note) => (
              <NoteItem key={note.id} note={note} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
