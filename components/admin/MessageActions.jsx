"use client";

import {
  Archive,
  ArchiveRestore,
  CheckCheck,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { sendJson } from "@/lib/utils/submit-form";

const SUCCESS_MESSAGES = {
  new: "Message reopened",
  handled: "Marked as handled",
  archived: "Message archived",
};

function ActionIcon({ active, icon: Icon }) {
  return active ? (
    <Loader2 className="size-4 motion-safe:animate-spin" aria-hidden="true" />
  ) : (
    <Icon className="size-4" aria-hidden="true" />
  );
}

export function MessageActions({ id, status }) {
  const router = useRouter();
  // Konsa action chal raha hai, taake sirf usi button par spinner aaye.
  const [pendingStatus, setPendingStatus] = useState(null);
  const pending = pendingStatus !== null;

  async function updateStatus(next, { silent = false } = {}) {
    setPendingStatus(next);
    try {
      await sendJson("PATCH", `/api/admin/messages/${id}`, { status: next });
      router.refresh();
      return true;
    } catch (error) {
      toast.error(error.message);
      return false;
    } finally {
      setPendingStatus(null);
    }
  }

  async function onChange(next) {
    const previous = status;
    const ok = await updateStatus(next);
    if (!ok) return;

    // Archive reversible hai, isliye Undo ka option dete hain.
    if (next === "archived") {
      toast.success(SUCCESS_MESSAGES[next], {
        action: {
          label: "Undo",
          onClick: () => updateStatus(previous),
        },
      });
    } else {
      toast.success(SUCCESS_MESSAGES[next]);
    }
  }

  const isHandled = status === "handled";
  const isArchived = status === "archived";

  return (
    <div
      role="group"
      aria-label="Message actions"
      className="flex flex-wrap items-center gap-2"
    >
      {isHandled ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          aria-busy={pendingStatus === "new"}
          onClick={() => onChange("new")}
          className="gap-1.5 transition-colors hover:border-primary/40 hover:bg-primary/10 motion-safe:active:scale-[0.98]"
        >
          <ActionIcon active={pendingStatus === "new"} icon={RotateCcw} />
          {pendingStatus === "new" ? "Reopening…" : "Reopen"}
        </Button>
      ) : (
        <Button
          type="button"
          size="sm"
          disabled={pending}
          aria-busy={pendingStatus === "handled"}
          onClick={() => onChange("handled")}
          className="gap-1.5 motion-safe:active:scale-[0.98]"
        >
          <ActionIcon active={pendingStatus === "handled"} icon={CheckCheck} />
          {pendingStatus === "handled" ? "Saving…" : "Mark handled"}
        </Button>
      )}

      {isArchived ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={pending}
          aria-busy={pendingStatus === "new"}
          onClick={() => onChange("new")}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ActionIcon active={pendingStatus === "new"} icon={ArchiveRestore} />
          {pendingStatus === "new" ? "Restoring…" : "Restore"}
        </Button>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={pending}
          aria-busy={pendingStatus === "archived"}
          onClick={() => onChange("archived")}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ActionIcon active={pendingStatus === "archived"} icon={Archive} />
          {pendingStatus === "archived" ? "Archiving…" : "Archive"}
        </Button>
      )}
    </div>
  );
}
