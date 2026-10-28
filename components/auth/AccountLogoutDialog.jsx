"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, LogOut, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { sendJson } from "@/lib/utils/submit-form";

export function AccountLogoutDialog({ email }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);

    try {
      await sendJson("DELETE", "/api/auth/session");
      toast.success("Signed out successfully");
      router.replace("/login");
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Could not sign you out right now.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant="outline"
            size="lg"
            className="group w-full gap-2 border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 sm:w-auto"
          >
            <LogOut className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Log out
          </Button>
        }
      />

      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <ShieldAlert className="size-5 text-destructive" aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>Log out of your account?</AlertDialogTitle>
          <AlertDialogDescription>
            You will be signed out from this device. {email ? `Signed in as ${email}.` : ""}
            Your other sessions remain unchanged unless you choose to sign out everywhere.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Stay signed in</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={handleSignOut}
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Logging out…
              </>
            ) : (
              <>
                <LogOut className="size-4" aria-hidden="true" />
                Log out
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
