"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FiMessageCircle, FiX } from "react-icons/fi";

import { Button } from "@/components/ui/button";

const ChatPanel = dynamic(() => import("@/components/chatbot/ChatPanel"), {
  ssr: false,
});

const HIDDEN_ON = ["/contact", "/hire-me"];
const LAUNCHER_ID = "ai-chat-launcher";

export function AIChatWidget({ config, className = "ai-chat-slot" }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const hidden = !config || HIDDEN_ON.includes(pathname);

  function toggle(next) {
    setOpen(next);
    if (next) setLoaded(true);
  }

  useEffect(() => {
    if (!open && loaded && !hidden) {
      document.getElementById(LAUNCHER_ID)?.focus();
    }
  }, [open, loaded, hidden]);

  useEffect(() => {
    const isOpen = open && !hidden;
    document.documentElement.dataset.chatOpen = String(isOpen);
    window.dispatchEvent(new Event("chat-open-change"));

    return () => {
      delete document.documentElement.dataset.chatOpen;
      window.dispatchEvent(new Event("chat-open-change"));
    };
  }, [open, hidden]);

  if (hidden) return null;

  return (
    <>
      {/* Mounted rehta hai taake band karne par conversation na khoye. */}
      {loaded ? (
        <div hidden={!open}>
          <ChatPanel
            config={config}
            open={open}
            onClose={() => toggle(false)}
          />
        </div>
      ) : null}

      <Button
        id={LAUNCHER_ID}
        type="button"
        size="lg"
        aria-expanded={open}
        aria-controls={loaded ? "ai-chat-panel" : undefined}
        aria-hidden={open}
        tabIndex={open ? -1 : undefined}
        onClick={() => toggle(!open)}
        className={`group fixed right-4 z-50 h-12 gap-2.5 rounded-full md:bottom-5 px-5 text-sm font-medium shadow-lg shadow-primary/25 ring-1 ring-primary/20 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 active:translate-y-0 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 sm:right-6 ${className} ${
          open ? "pointer-events-none opacity-0" : ""
        }`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute -inset-1 rounded-full border border-primary/50 motion-safe:animate-ping motion-reduce:animate-none ${
            open ? "hidden" : ""
          }`}
        />
        <span
          className="relative grid size-5 place-items-center"
          aria-hidden="true"
        >
          <FiMessageCircle
            className={`absolute size-5 transition-all duration-300 motion-reduce:transition-none ${
              open
                ? "scale-50 rotate-90 opacity-0"
                : "scale-100 rotate-0 opacity-100"
            }`}
          />
          <FiX
            className={`absolute size-5 transition-all duration-300 motion-reduce:transition-none ${
              open
                ? "scale-100 rotate-0 opacity-100"
                : "scale-50 -rotate-90 opacity-0"
            }`}
          />
        </span>
        {open ? "Close chat" : "Ask AI"}
      </Button>
    </>
  );
}
