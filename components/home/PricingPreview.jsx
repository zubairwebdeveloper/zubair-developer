// components/home/PricingPreview.jsx
import Link from "next/link";
import { ArrowRight, FileCheck2, MessageSquareText, Scale } from "lucide-react";

import { PricingTabs } from "@/components/pricing/PricingTabs";
import { Section } from "@/components/shared/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getPlans } from "@/services/pricing.service";

const ASSURANCES = [
  {
    icon: Scale,
    title: "Scope-based pricing",
    text: "Listed prices are starting points. The final quote reflects what your project actually needs.",
  },
  {
    icon: FileCheck2,
    title: "Confirmed in writing",
    text: "Scope and price are agreed in writing before any work begins, so there are no surprises.",
  },
  {
    icon: MessageSquareText,
    title: "Talk it through first",
    text: "Not sure which plan fits? Describe your project and I will recommend a sensible starting point.",
  },
];

const motionIn =
  "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-3 motion-safe:duration-700 motion-safe:fill-mode-both";

export async function PricingPreview() {
  const plans = await getPlans();
  const hasPlans = Array.isArray(plans) && plans.length > 0;

  return (
    <Section
      id="pricing"
      className="relative isolate overflow-hidden border-y border-border/60 bg-muted/40"
    >
      {/* Decorative background: subtle grid + soft accent glow (non-interactive) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.45)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.45)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
        <div className="absolute left-1/2 top-0 h-64 w-[min(60rem,90vw)] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className={motionIn}>
        <SectionHeading
          eyebrow="Pricing"
          title="Transparent starting prices"
          description="Prices are starting points. Final quotes depend on scope and are confirmed in writing before work begins."
        />
      </div>

      {/* Plans */}
      <div className={cn("mt-10 sm:mt-12 [animation-delay:120ms]", motionIn)}>
        {hasPlans ? (
          <PricingTabs plans={plans} />
        ) : (
          <div
            role="status"
            className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center"
          >
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              Pricing is being updated
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Plans are not available right now. Tell me about your project and
              I will send you a clear written quote.
            </p>
            <Link href="/hire-me" className={buttonVariants({ size: "lg" })}>
              Discuss your project
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>

      {/* Assurances */}
      <ul
        className={cn(
          "mt-12 grid gap-4 sm:mt-14 md:grid-cols-3 [animation-delay:200ms]",
          motionIn,
        )}
      >
        {ASSURANCES.map(({ icon: Icon, title, text }) => (
          <li
            key={title}
            className="group rounded-2xl border border-border/70 bg-card/70 p-5 transition-colors duration-200 hover:border-primary/40 hover:bg-card"
          >
            <span className="mb-4 inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20 transition-transform duration-200 motion-safe:group-hover:-translate-y-0.5">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <h3 className="text-base font-semibold tracking-tight text-foreground">
              {title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {text}
            </p>
          </li>
        ))}
      </ul>

      {/* Custom quote CTA */}
      <div
        className={cn(
          "mt-8 flex flex-col items-start justify-between gap-5 rounded-2xl border border-border/70 bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:p-8 [animation-delay:280ms]",
          motionIn,
        )}
      >
        <div className="max-w-xl">
          <h3 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            Need something bigger?
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            For larger SaaS builds, integrations, or AI chatbot automation,
            share your requirements and receive a custom quote.
          </p>
        </div>
        <Link
          href="/hire-me"
          className={cn(
            buttonVariants({ size: "lg" }),
            "group w-full shrink-0 sm:w-auto",
          )}
        >
          Request a custom quote
          <ArrowRight
            className="size-4 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
    </Section>
  );
}
