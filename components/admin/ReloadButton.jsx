"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ReloadButton({ label = "Reload page" }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      aria-busy={pending}
      onClick={() => startTransition(() => router.refresh())}
    >
      <RotateCw
        aria-hidden="true"
        className={`size-4 ${pending ? "motion-safe:animate-spin" : ""}`}
      />
      {pending ? "Reloading…" : label}
    </Button>
  );
}
