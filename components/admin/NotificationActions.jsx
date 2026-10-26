"use client";

import { Check, CheckCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { sendJson } from "@/lib/utils/submit-form";

function useMarkRead() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function mark(body, successMessage) {
    setPending(true);
    try {
      await sendJson("PATCH", "/api/admin/notifications", body);
      if (successMessage) toast.success(successMessage);
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPending(false);
    }
  }

  return { pending, mark };
}

export function MarkReadButton({ id, className }) {
  const { pending, mark } = useMarkRead();

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      disabled={pending}
      aria-busy={pending}
      onClick={() => mark({ ids: [id] })}
      className={cn(
        "h-8 gap-1.5 px-2.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground",
        "motion-safe:active:scale-[0.98]",
        className,
      )}
    >
      {pending ? (
        <Loader2
          className="size-4 motion-safe:animate-spin"
          aria-hidden="true"
        />
      ) : (
        <Check className="size-4" aria-hidden="true" />
      )}
      {pending ? "Marking…" : "Mark read"}
    </Button>
  );
}

export function MarkAllReadButton({ className, disabled = false }) {
  const { pending, mark } = useMarkRead();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending || disabled}
      aria-busy={pending}
      onClick={() => mark({ all: true }, "All notifications marked as read")}
      className={cn(
        "gap-2 border-border/70 transition-colors hover:border-primary/40 hover:bg-primary/10",
        "motion-safe:active:scale-[0.98]",
        className,
      )}
    >
      {pending ? (
        <Loader2
          className="size-4 motion-safe:animate-spin"
          aria-hidden="true"
        />
      ) : (
        <CheckCheck className="size-4" aria-hidden="true" />
      )}
      {pending ? "Marking all…" : "Mark all as read"}
    </Button>
  );
}
