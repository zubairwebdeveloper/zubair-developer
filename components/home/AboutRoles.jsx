"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bot, ChevronDown, Code2, Layers } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

// Editable content: worded from your hero text.
const ROLES = [
  {
    id: "fullstack",
    icon: Code2,
    title: "Full Stack Web Developer",
    description:
      "High-performance websites and web applications, built from the interface through to the data behind it.",
  },
  {
    id: "saas",
    icon: Layers,
    title: "SaaS Solutions Specialist",
    description:
      "Scalable web applications and SaaS products designed to grow with your business.",
  },
  {
    id: "ai",
    icon: Bot,
    title: "AI Chatbot Automation Expert",
    description:
      "Chatbots, website AI assistants and automation that take care of repeat work.",
  },
];

export function AboutRoles() {
  const uid = useId();
  const reduceMotion = useReducedMotion();
  const [openId, setOpenId] = useState(ROLES[0].id);

  return (
    <ul className="flex flex-col gap-2">
      {ROLES.map((role) => {
        const Icon = role.icon;
        const open = openId === role.id;
        const panelId = `${uid}-${role.id}-panel`;
        const buttonId = `${uid}-${role.id}-button`;

        return (
          <li
            key={role.id}
            className={`rounded-xl border transition-colors duration-200 ${
              open
                ? "border-primary/30 bg-primary/5"
                : "border-border hover:border-primary/30"
            }`}
          >
            <h4>
              <button
                id={buttonId}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenId(open ? "" : role.id)}
                className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  aria-hidden="true"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                >
                  <Icon className="size-4" />
                </span>
                <span className="flex-1">{role.title}</span>
                <ChevronDown
                  aria-hidden="true"
                  className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </button>
            </h4>

            <AnimatePresence initial={false}>
              {open ? (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={
                    reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }
                  }
                  transition={{ duration: reduceMotion ? 0 : 0.25, ease: EASE }}
                  className="overflow-hidden"
                >
                  <p className="px-3.5 pb-3.5 pl-[3.75rem] text-sm leading-relaxed text-muted-foreground">
                    {role.description}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
