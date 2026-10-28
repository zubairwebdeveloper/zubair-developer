// components/home/FinalCTA.jsx
// Redesigned: richer gradient, animated glow, dual CTA.
import Link from "next/link";

import { Section } from "@/components/shared/Section";
import { buttonVariants } from "@/components/ui/button";
import { primaryCta } from "@/config/site";
import { cn } from "@/lib/utils/cn";

const secondaryCta = { href: "/projects", label: "View my work" };

const expertise = [
  "Full stack web development",
  "SaaS & web applications",
  "AI chatbot automation",
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-foreground";

export function FinalCTA() {
  return (
    <Section>
      <div className="relative isolate overflow-hidden rounded-2xl bg-foreground px-6 py-14 text-background md:px-12 md:py-20">
        {/* Background decorations */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklab,var(--background)_6%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--background)_6%,transparent)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_top_right,black_20%,transparent_75%)]" />
          <div className="absolute -right-20 -top-24 size-80 rounded-full bg-primary/25 blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 size-64 rounded-full bg-violet/15 blur-3xl" />
        </div>

        <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-2xl flex-col gap-5">
            <h2 className="text-section-title max-w-xl text-balance">
              Have a project in mind? Let&rsquo;s talk.
            </h2>
            <p className="text-body-lg max-w-lg text-pretty text-background/80">
              Tell me what you want to build. You will get a clear written next step — not a
              sales pitch.
            </p>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <Link
                href={primaryCta.href}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full sm:w-auto",
                  focusRing,
                )}
              >
                {primaryCta.label}
              </Link>
              <Link
                href={secondaryCta.href}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "w-full border-background/30 bg-transparent text-background hover:bg-background/10 hover:text-background sm:w-auto",
                  focusRing,
                )}
              >
                {secondaryCta.label}
              </Link>
            </div>
          </div>

          <ul
            aria-label="What I work on"
            className="flex flex-wrap gap-2 lg:max-w-xs lg:flex-col"
          >
            {expertise.map((item) => (
              <li
                key={item}
                className="rounded-full border border-background/15 bg-background/5 px-3 py-1.5 text-xs font-medium text-background/80"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
