"use client";

import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LogoutButton({ className, redirectTo = "/login" }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onLogout() {
    if (pending) return;
    setPending(true);
    try {
      const response = await fetch("/api/admin/session", { method: "DELETE" });
      if (!response.ok) throw new Error("Logout failed");
      router.replace(redirectTo);
      router.refresh();
    } catch {
      toast.error("Could not sign out. Please try again.");
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onLogout}
      disabled={pending}
      aria-busy={pending}
      className={cn(
        "group h-9 gap-2 rounded-lg border-border/70 bg-card/60 px-3.5 text-sm font-medium text-muted-foreground",
        "transition-colors duration-200 hover:border-primary/40 hover:bg-primary/10 hover:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
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
        <LogOut
          className="size-4 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      )}
      <span>{pending ? "Signing out…" : "Sign out"}</span>
    </Button>
  );
}
