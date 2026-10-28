"use client";

// components/home/WhatIDoShowcase.jsx
// Two interactive panels: Web Development vs Chatbot Automation.
// "use client" for animated hover/active states and keyboard nav.
// No fake metrics or invented numbers.

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  Globe,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { useState } from "react";

const EASE = [0.22, 1, 0.36, 1];

const PANELS = [
  {
    id: "web",
    label: "Full Stack Web",
    icon: Globe,
    headline: "From idea to a working product.",
    description:
      "Practical web products designed to help people find, use, and trust your business.",
    deliverables: [
      "Business websites and landing pages",
      "E-commerce stores and checkout",
      "SaaS apps, dashboards, and authentication",
      "APIs and third-party integrations",
      "SEO, performance, and ongoing maintenance",
    ],
    tech: ["Next.js", "React", "Tailwind CSS", "Firebase"],
    cta: { label: "Explore web services" },
  },
  {
    id: "automation",
    label: "Chatbot & Automation",
    icon: MessageSquare,
    headline: "Turn DMs and comments into conversations.",
    description:
      "Helpful conversation flows that make it easier to answer questions and collect useful enquiries.",
    deliverables: [
      "ManyChat flows for Instagram DMs and Messenger",
      "Comment-to-DM campaigns",
      "Lead capture, qualification, and FAQ automation",
      "Booking flows and Google Sheets / CRM handoff",
      "AI website assistants grounded in approved content",
    ],
    tech: ["ManyChat", "Google Sheets", "CRM integrations", "AI assistants"],
    cta: { label: "Explore automation services" },
  },
];

function DeliverableList({ items }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((text) => (
        <li key={text} className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground/90">
          <CheckCircle2 aria-hidden="true" className="size-4 shrink-0 text-primary" />
          {text}
        </li>
      ))}
    </ul>
  );
}

export function WhatIDoShowcase({ serviceLinks = {} }) {
  const [active, setActive] = useState(PANELS[0].id);
  const reduce = useReducedMotion();

  return (
    <section
      id="what-i-do"
      aria-labelledby="what-i-do-heading"
      className="scroll-mt-28 py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="flex max-w-2xl flex-col gap-3">
          <p className="text-eyebrow text-brand flex items-center gap-2">
            <span aria-hidden="true" className="bg-brand h-1 w-1 shrink-0 rounded-full" />
            What I build
          </p>
          <h2 id="what-i-do-heading" className="text-section-title text-balance">
            Two focused offerings. Pick yours.
          </h2>
          <p className="text-body-lg text-muted-foreground max-w-prose text-pretty">
            Full stack web development for businesses that need a real product, and chatbot
            automation for businesses that need faster, smarter customer conversations.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:flex lg:items-stretch">
          {PANELS.map((panel) => {
            const Icon = panel.icon;
            const selected = panel.id === active;
            const serviceSlug =
              panel.id === "web" ? serviceLinks.web : serviceLinks.automation;
            const href = serviceSlug ? `/services/${serviceSlug}` : "/services";

            return (
              <motion.article
                key={panel.id}
                onMouseEnter={() => setActive(panel.id)}
                data-active={selected}
                animate={{ flexGrow: selected ? 1.15 : 1 }}
                transition={reduce ? { duration: 0 } : { duration: 0.3, ease: EASE }}
                className={cn(
                  "relative min-w-0 overflow-hidden rounded-3xl border border-border bg-card p-6 transition-colors sm:p-8 lg:flex-1",
                  selected && "border-primary/40",
                )}
              >
                <button
                  type="button"
                  aria-expanded={selected}
                  aria-controls={`what-i-do-${panel.id}`}
                  onClick={() => setActive(selected ? "" : panel.id)}
                  onFocus={() => setActive(panel.id)}
                  className="flex min-h-11 w-full items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:pointer-events-none"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <span className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                    {panel.label}
                  </span>
                  <span className="ml-auto text-sm text-muted-foreground lg:hidden">
                    {selected ? "−" : "+"}
                  </span>
                </button>

                <div
                  id={`what-i-do-${panel.id}`}
                  aria-hidden={!selected}
                  inert={!selected}
                  className={cn(
                    "grid transition-[grid-template-rows,opacity] duration-300 motion-reduce:transition-none",
                    selected
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="flex flex-col gap-5 pt-5">
                      <p className="text-base leading-relaxed text-muted-foreground">
                        {panel.description}
                      </p>
                      <h3 className="text-card-title text-foreground">{panel.headline}</h3>
                      <DeliverableList items={panel.deliverables} />
                      <ul
                        aria-label={`${panel.label} technologies`}
                        className="flex flex-wrap gap-2"
                      >
                        {panel.tech.map((tech) => (
                          <li
                            key={tech}
                            className="rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground"
                          >
                            {tech}
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={href}
                        className={cn(buttonVariants(), "group w-fit gap-2")}
                      >
                        {panel.cta.label}
                        <ArrowRight
                          aria-hidden="true"
                          className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
