"use client";

import { History, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { sendJson } from "@/lib/utils/submit-form";

export function RestoreVersionButton({ version, className }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function confirm() {
    setPending(true);
    try {
      const result = await sendJson("POST", "/api/admin/ai/settings/restore", {
        version,
      });
      toast.success(`Version ${version} restored as version ${result.version}`);
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        disabled={pending}
        aria-haspopup="dialog"
        aria-label={`Restore version ${version}`}
        className={cn(
          "gap-1.5 border-border/70 transition-colors hover:border-primary/40 hover:bg-primary/10",
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
          <History className="size-4" aria-hidden="true" />
        )}
        Restore
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Restore version ${version}?`}
        description="This version's settings will be saved as a new version, and the public assistant's replies will change immediately. The 'Enabled' switch stays as it is."
        confirmLabel="Restore"
        pending={pending}
        onConfirm={confirm}
      />
    </>
  );
}
