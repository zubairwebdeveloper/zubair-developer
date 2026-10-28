"use client";

import { motion } from "motion/react";

const MESSAGES = [
  { side: "left", text: "Hi, I need a new website." },
  { side: "right", text: "What kind of project do you need help with?" },
  { side: "left", text: "A website for my business." },
  { side: "right", text: "What name should I add to your enquiry?" },
];

export function ChatbotPanel({ reducedMotion, inView }) {
  const animateChat = inView && !reducedMotion;

  return (
    <div className="flex h-full min-h-0 flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-foreground sm:text-sm">
          Demo conversation
        </p>
        <span className="rounded-full border border-border bg-background/65 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          Instagram DM style
        </span>
      </div>
      <div
        className="flex min-h-0 flex-1 flex-col justify-between overflow-hidden rounded-xl border border-border/70 bg-background/75 p-2.5 sm:p-3"
        aria-label="Demo conversation showing a chatbot collecting a project need"
      >
        <div className="flex flex-col gap-1.5">
          {MESSAGES.map((message, index) => (
            <motion.div
              key={message.text}
              initial={animateChat ? { opacity: 0, y: 5 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: animateChat ? 0.25 + index * 0.5 : 0,
                duration: 0.28,
              }}
              className={
                message.side === "right"
                  ? "max-w-[84%] self-end rounded-2xl rounded-br-sm bg-primary/15 px-2.5 py-1.5 text-[10px] leading-snug text-foreground sm:text-xs"
                  : "max-w-[84%] self-start rounded-2xl rounded-bl-sm border border-border/60 bg-card px-2.5 py-1.5 text-[10px] leading-snug text-foreground sm:text-xs"
              }
            >
              {message.text}
            </motion.div>
          ))}
          {animateChat ? (
            <motion.div
              aria-label="Typing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.75, duration: 0.2 }}
              className="flex w-fit items-center gap-1 rounded-full border border-border/60 bg-card px-2.5 py-2"
            >
              {[0, 1, 2].map((dot) => (
                <motion.span
                  key={dot}
                  className="size-1 rounded-full bg-muted-foreground/60"
                  animate={{ y: [0, -2, 0] }}
                  transition={{
                    delay: dot * 0.12,
                    duration: 0.55,
                    repeat: Infinity,
                    repeatDelay: 0.2,
                  }}
                />
              ))}
            </motion.div>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5 pt-2">
          <div className="flex flex-wrap gap-1">
            <span className="rounded-full border border-primary/25 bg-primary/5 px-2 py-1 text-[9px] font-medium text-foreground sm:text-[10px]">
              Website
            </span>
            <span className="rounded-full border border-border bg-card px-2 py-1 text-[9px] font-medium text-muted-foreground sm:text-[10px]">
              E-commerce
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="rounded-lg border border-border/70 bg-card px-2 py-1">
              <span className="block text-[8px] font-medium text-muted-foreground">
                Name
              </span>
              <span className="text-[9px] text-foreground">Asked in chat</span>
            </div>
            <div className="rounded-lg border border-border/70 bg-card px-2 py-1">
              <span className="block text-[8px] font-medium text-muted-foreground">
                Project need
              </span>
              <span className="text-[9px] text-foreground">Website</span>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border/70 bg-card px-2.5 py-1.5">
            <span className="flex-1 text-[10px] text-muted-foreground sm:text-xs">
              Name and project need captured
            </span>
            <span
              aria-hidden="true"
              className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-xs text-primary"
            >
              &rarr;
            </span>
          </div>
        </div>
      </div>
      <p className="sr-only">
        This scripted example asks what the visitor wants to build and offers
        quick replies to capture the project need.
      </p>
    </div>
  );
}
