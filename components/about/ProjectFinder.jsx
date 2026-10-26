"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Bot, Globe, LayoutDashboard } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

// Copy yahan edit karein: apni asal services ke hisab se.
const NEEDS = [
  {
    id: "website",
    icon: Globe,
    label: "A website for my business",
    service: "Website development",
    text: "A fast, clear website that explains what you do and makes it easy for customers to contact you.",
    typical: "Usually: design, build, launch",
  },
  {
    id: "app",
    icon: LayoutDashboard,
    label: "A web app or SaaS product",
    service: "Web app / SaaS development",
    text: "Login, dashboards, payments and admin tools, built so the product can grow after launch.",
    typical: "Usually: scope, build in stages, handover",
  },
  {
    id: "ai",
    icon: Bot,
    label: "An AI chatbot or automation",
    service: "AI chatbot automation",
    text: "A chatbot or workflow that answers questions and handles repeat tasks for your team.",
    typical: "Usually: plan the flows, build, test, connect",
  },
];

export function ProjectFinder() {
  const [selected, setSelected] = useState(NEEDS[0].id);
  const current = NEEDS.find((need) => need.id === selected) ?? NEEDS[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
      <div
        role="group"
        aria-label="What do you need?"
        className="flex flex-col gap-3"
      >
        {NEEDS.map(({ id, icon: Icon, label }) => {
          const active = id === selected;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => setSelected(id)}
              className={cn(
                "flex min-h-14 items-center gap-3 rounded-2xl border px-4 text-left text-sm font-medium outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none",
                active
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "inline-flex size-9 shrink-0 items-center justify-center rounded-lg",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 text-primary",
                )}
              >
                <Icon className="size-[18px]" />
              </span>
              {label}
            </button>
          );
        })}
      </div>

      <div
        aria-live="polite"
        className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-6"
      >
        <p className="text-sm font-medium text-primary">Best fit</p>
        <h3 className="text-card-title text-foreground">{current.service}</h3>
        <p className="max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
          {current.text}
        </p>
        <p className="text-xs text-muted-foreground">{current.typical}</p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href={`/hire-me?service=${current.id}`}
            className={cn(buttonVariants({ size: "lg" }), "group gap-2")}
          >
            Get a quote for this
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
            />
          </Link>
          <Link
            href="/services"
            className={buttonVariants({ size: "lg", variant: "outline" })}
          >
            See all services
          </Link>
        </div>
      </div>
    </div>
  );
}
