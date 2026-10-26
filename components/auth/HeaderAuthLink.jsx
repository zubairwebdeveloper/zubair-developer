"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { LogIn, UserRound } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { readHint, subscribeHint } from "@/lib/auth/auth-hint";
import { cn } from "@/lib/utils/cn";

export function HeaderAuthLink({ className, onNavigate }) {
  const pathname = usePathname();

  // Always false on the server, so pages stay static and hydration never mismatches.
  const signedIn = useSyncExternalStore(subscribeHint, readHint, () => false);

  const href = signedIn ? "/account" : "/login";
  const Icon = signedIn ? UserRound : LogIn;

  // Mark the link as current when you are on its page (or inside it, like /account/security).
  const isCurrent =
    pathname === href || Boolean(pathname?.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={isCurrent ? "page" : undefined}
      className={cn(
        buttonVariants({ variant: "ghost" }),
        // A minimum width keeps the header from jumping when "Log in" becomes "Account".
        "min-w-[6.5rem] justify-center gap-2 font-medium",
        isCurrent && "bg-accent text-accent-foreground",
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-4" />
      {signedIn ? "Account" : "Log in"}
    </Link>
  );
}
