"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, LogOut, MonitorOff } from "lucide-react";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { notifyHint } from "@/lib/auth/auth-hint";
import { sendJson } from "@/lib/utils/submit-form";

/**
 * AccountActions
 *
 * @param {string} [email]  Optional. Shows "Signed in as …" above the actions so the
 *                          person can confirm which account they are about to sign out of.
 */
export function AccountActions({ email }) {
  const router = useRouter();
  const [pending, setPending] = useState(null);
  const [confirmAll, setConfirmAll] = useState(false);

  const busy = pending !== null;

  async function run(kind) {
    setPending(kind);
    try {
      await sendJson(
        kind === "all" ? "POST" : "DELETE",
        kind === "all" ? "/api/auth/revoke" : "/api/auth/session",
      );
      notifyHint();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      toast.error(error.message);
      setPending(null);
      setConfirmAll(false);
    }
  }

  return (
    <section
      aria-labelledby="account-actions-heading"
      className="flex flex-col gap-3"
    >
      <h2 id="account-actions-heading" className="sr-only">
        Session management
      </h2>

      {email ? (
        <p className="text-sm text-muted-foreground">
          Signed in as{" "}
          <span className="font-medium text-foreground">{email}</span>
        </p>
      ) : null}

      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        <li className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3.5">
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
            >
              <LogOut className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Sign out of this device
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                End your session here. Your other devices stay signed in.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={busy}
            aria-busy={pending === "this"}
            onClick={() => run("this")}
            className="h-10 w-full gap-2 sm:w-auto"
          >
            {pending === "this" ? (
              <>
                <Loader2
                  className="size-4 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
                Signing out…
              </>
            ) : (
              "Sign out"
            )}
          </Button>
        </li>

        <li className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3.5">
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive"
            >
              <MonitorOff className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Sign out of all devices
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Useful if you lost a device or suspect unauthorized access.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => setConfirmAll(true)}
            className="h-10 w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive sm:w-auto"
          >
            Sign out of all devices
          </Button>
        </li>
      </ul>

      <p className="text-xs text-muted-foreground">
        After signing out, you will be taken to the sign-in page.
      </p>

      <ConfirmDialog
        open={confirmAll}
        onOpenChange={setConfirmAll}
        title="Sign out everywhere?"
        description="You will be signed out on every device, including this one. You will need to sign in again."
        confirmLabel="Sign out everywhere"
        cancelLabel="Stay signed in"
        destructive
        pending={pending === "all"}
        onConfirm={() => run("all")}
      >
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          <li>Every active session ends, on phones, tablets, and computers.</li>
          <li>Unsaved changes on any open admin page will be lost.</li>
          <li>
            If you suspect unauthorized access, change your password after
            signing back in.
          </li>
        </ul>
      </ConfirmDialog>
    </section>
  );
}
