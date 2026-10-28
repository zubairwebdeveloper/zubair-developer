"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Mail, MessageCircle } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const HIDDEN_ON = [
  "/hire-me",
  "/contact",
  "/admin",
  "/login",
  "/register",
  "/account",
  "/forgot-password",
];

export function MobileCTA({ quickContact, quickLabel, whatsapp }) {
  const pathname = usePathname();
  const [chatOpen, setChatOpen] = useState(false);

  // Listen for chat panel open/close events
  useEffect(() => {
    const checkChatOpen = () => {
      if (typeof document !== "undefined") {
        setChatOpen(document.documentElement.dataset.chatOpen === "true");
      }
    };

    checkChatOpen();
    window.addEventListener("chat-open-change", checkChatOpen);
    return () => window.removeEventListener("chat-open-change", checkChatOpen);
  }, []);

  // Hide on specific paths
  if (HIDDEN_ON.some((path) => pathname === path || pathname.startsWith(path))) {
    return null;
  }

  // Hide when chat panel is open
  if (chatOpen) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md gap-2">
        <Link
          href="/hire-me"
          className={cn(buttonVariants({ size: "lg" }), "flex-1 gap-2")}
        >
          Start a Project
        </Link>
        <a
          href={quickContact}
          {...(whatsapp
            ? { target: "_blank", rel: "noopener noreferrer" }
            : null)}
          className={cn(
            buttonVariants({ size: "lg", variant: "outline" }),
            "gap-2",
          )}
        >
          {whatsapp ? (
            <MessageCircle aria-hidden="true" className="size-4" />
          ) : (
            <Mail aria-hidden="true" className="size-4" />
          )}
          {quickLabel}
        </a>
      </div>
    </div>
  );
}
