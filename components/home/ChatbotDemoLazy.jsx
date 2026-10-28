"use client";

import dynamic from "next/dynamic";

// ChatbotDemo is a heavyweight client component — lazy load it (client-only)
const ChatbotDemo = dynamic(
  () =>
    import("@/components/chatbot/ChatbotDemo").then((m) => ({
      default: m.ChatbotDemo,
    })),
  {
    ssr: false,
    loading: () => <div className="min-h-[480px]" aria-hidden="true" />,
  },
);

export function ChatbotDemoLazy() {
  return <ChatbotDemo />;
}
