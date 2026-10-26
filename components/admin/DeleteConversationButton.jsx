"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { sendJson } from "@/lib/utils/submit-form";

/**
 * DeleteConversationButton
 *
 * @param {string} id            The conversation to delete.
 * @param {string} [redirectTo]  Where to go after deleting.
 *                               Defaults to the conversations list.
 */
export function DeleteConversationButton({
  id,
  redirectTo = "/admin/ai-conversations",
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function confirm() {
    setPending(true);
    try {
      await sendJson("DELETE", `/api/admin/ai/conversations/${id}`);
      toast.success("Conversation deleted");
      router.replace(redirectTo);
      router.refresh();
    } catch (error) {
      toast.error(error.message);
      setPending(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <FiTrash2 aria-hidden="true" className="h-4 w-4" />
        <span>Delete conversation</span>
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete this conversation?"
        description="The full message history will be permanently removed. This cannot be undone."
        confirmLabel="Delete conversation"
        cancelLabel="Keep conversation"
        destructive
        pending={pending}
        onConfirm={confirm}
      >
        <p className="text-muted-foreground">
          If you want to keep anything from this chat, such as a question your
          assistant answered poorly, copy it before deleting.
        </p>
      </ConfirmDialog>
    </>
  );
}
