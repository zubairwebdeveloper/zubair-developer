import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  CalendarClock,
  ClipboardList,
  FileSignature,
  FileText,
  Layers,
  Mail,
  Palette,
  Plug,
  Rocket,
  SearchCheck,
} from "lucide-react";

import { FaqAccordion } from "@/components/about/FaqAccordion";
import { PlanComparisonTable } from "@/components/pricing/PlanComparisonTable";
import { PricingTabs } from "@/components/pricing/PricingTabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { Section } from "@/components/shared/Section";
import { siteConfig } from "@/config/site";
import { getPlans } from "@/services/pricing.service";

export const metadata = {
  title: "Pricing",
  description:
    "Transparent starting prices for web development and chatbot automation.",
  alternates: { canonical: "/pricing" },
};

/** Generic factors, koi price ya percentage nahi. */
const factors = [
  {
    icon: Layers,
    title: "Scope",
    text: "The number of pages, features and user roles is the biggest driver of effort.",
  },
  {
    icon: Plug,
    title: "Integrations",
    text: "Connecting payments, email, a CRM or other tools adds work and testing.",
  },
  {
    icon: Palette,
    title: "Design",
    text: "A ready design speeds things up. Designing from scratch needs more time and feedback.",
  },
  {
    icon: FileText,
    title: "Content",
    text: "Text, images and brand material that is ready on time keeps the project on track.",
  },
  {
    icon: Boxes,
    title: "Existing systems",
    text: "Working with an existing website or database means checking what is already there.",
  },
  {
    icon: CalendarClock,
    title: "Timeline",
    text: "A fixed date can shape what goes into the first version. Features can follow later.",
  },
];

const steps = [
  {
    icon: SearchCheck,
    title: "Share your brief",
    text: "Tell me your goal, scope, budget and timeline.",
  },
  {
    icon: ClipboardList,
    title: "Discovery",
    text: "I ask clarifying questions so the scope is clear before any price is fixed.",
  },
  {
    icon: FileSignature,
    title: "Written proposal",
    text: "You receive a written proposal with scope and pricing to review.",
  },
  {
    icon: Rocket,
    title: "Work begins",
    text: "Only after the proposal is agreed, I start building with regular updates.",
  },
];

const faqs = [
  {
    question: "Are these the final prices?",
    answer:
      "No. They are starting points. The final price depends on scope, integrations and timeline, and is confirmed in a written proposal before any work begins.",
  },
  {
    question: "What if my project does not match a plan?",
    answer:
      "Larger or custom projects are quoted after discovery. Send a brief describing your goal and I will suggest an approach.",
  },
  {
    question: "Will I be charged for sending a brief?",
    answer:
      "No. Sending a brief only starts a conversation. Nothing is committed until you agree to a written proposal.",
  },
  {
    question: "Can I start small and add features later?",
    answer:
      "Yes. Many projects begin with a focused first version, and more features can follow once the foundation is in place.",
  },
  {
    question: "How do I choose the right plan?",
    answer:
      "Pick the one closest to your needs and mention it in your brief. If you are unsure, say so and we can talk through the options.",
  },
];

export default async function PricingPage() {
  const plans = await getPlans();
  const email = siteConfig.contactEmail;

  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title="Simple starting prices for the work you need"
        description="All prices are starting points. Larger or custom projects are quoted after discovery so the scope stays honest and realistic."
      />

      <Section className="pt-0">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card/80 p-5 shadow-soft sm:p-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-grid-subtle opacity-60"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 top-0 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-12 bottom-0 h-44 w-44 rounded-full bg-violet/10 blur-3xl"
            />

            <div className="relative grid gap-4 md:grid-cols-3">
              {[
                "Clear starting prices instead of vague estimates",
                "Project scope clarified before work begins",
                "Final quote confirmed in writing before build starts",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-border bg-background/70 p-4 text-sm leading-relaxed text-muted-foreground shadow-sm transition-transform duration-300 motion-safe:hover:-translate-y-1"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </Section>

      {/* 1. Plans */}
      <Section>
        <div id="plans" className="scroll-mt-24">
          <Reveal direction="up" className="min-w-0">
            <PricingTabs plans={plans} />
          </Reveal>

          <p className="mt-8 max-w-2xl text-sm leading-6 text-muted-foreground">
            Starting prices; final quote after discovery. Final pricing depends on
            scope, integrations and timeline, and is confirmed in writing before any
            work begins.
          </p>
          <PlanComparisonTable plans={plans} />
        </div>

        <Reveal direction="up">
          <div className="mt-8 flex flex-col gap-4 rounded-[1.75rem] border border-border bg-card p-5 shadow-soft sm:p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-card-title">Need something custom?</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                If your project does not fit a plan, share a brief and I will
                suggest a scope.
              </p>
            </div>
            <Link
              href="/hire-me"
              className="group inline-flex min-h-11 w-fit shrink-0 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-safe:active:scale-[0.98]"
            >
              Discuss Your Project
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
              />
            </Link>
          </div>
        </Reveal>
      </Section>

      {/* 2. What affects the price */}
      <Section className="bg-muted/40">
        <div className="flex max-w-2xl flex-col gap-3">
          <h2 className="text-section-title">What affects the final price</h2>
          <p className="leading-7 text-muted-foreground">
            Every project is different, so I scope it with you first. These are
            the things that usually matter most.
          </p>
        </div>
        <ul className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {factors.map(({ icon: Icon, title, text }) => (
            <li key={title}>
              <Reveal direction="up" className="h-full">
                <div className="h-full rounded-[1.5rem] border border-border bg-card p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-md sm:p-6 motion-reduce:transition-none">
                  <span
                    aria-hidden="true"
                    className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"
                  >
                    <Icon className="size-5" />
                  </span>
                  <h3 className="text-card-title">{title}</h3>
                  <p className="mt-2 leading-7 text-muted-foreground">{text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      {/* 3. How a quote works */}
      <Section>
        <div className="flex max-w-2xl flex-col gap-3">
          <h2 className="text-section-title">How a quote works</h2>
          <p className="leading-7 text-muted-foreground">
            No surprises: the price is agreed in writing before work starts.
          </p>
        </div>
        <ol className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <li key={title}>
              <Reveal direction="up" className="h-full">
                <div className="h-full rounded-[1.5rem] border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-md sm:p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span
                      aria-hidden="true"
                      className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"
                    >
                      <Icon className="size-5" />
                    </span>
                    <span
                      aria-hidden="true"
                      className="font-heading text-2xl font-semibold tabular-nums text-muted-foreground/60"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-card-title">
                    <span className="sr-only">Step {index + 1}: </span>
                    {title}
                  </h3>
                  <p className="mt-2 leading-7 text-muted-foreground">{text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </Section>

      {/* 4. FAQ */}
      <Section className="bg-muted/40">
        <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-14">
          <div className="flex flex-col gap-3">
            <h2 className="text-section-title">Pricing questions</h2>
            <p className="leading-7 text-muted-foreground">
              Quick answers before you send a brief.
            </p>
            <Link
              href="/faq"
              className="w-fit rounded-sm text-sm text-muted-foreground underline underline-offset-4 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              See all FAQs
            </Link>
          </div>
          <Reveal direction="up" className="min-w-0">
            <FaqAccordion items={faqs} />
          </Reveal>
        </div>
      </Section>

      {/* 5. CTA */}
      <Section>
        <Reveal direction="up">
          <div className="relative isolate overflow-hidden rounded-[2rem] bg-foreground p-6 text-background shadow-soft sm:p-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-20 -z-10 size-64 rounded-full bg-primary/30 blur-3xl"
            />
            <div className="flex max-w-2xl flex-col gap-3">
              <h2 className="font-heading text-[clamp(1.5rem,3vw,2.25rem)] font-semibold leading-[1.15] tracking-tight text-balance">
                Get a clear quote for your project
              </h2>
              <p className="text-background/75 leading-7">
                Share your goal and timeline. You will get a written proposal
                before any work begins.
              </p>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/hire-me"
                  className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-foreground motion-safe:active:scale-[0.98]"
                >
                  Start a Project
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
                  />
                </Link>
                {email ? (
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-background/25 px-5 text-sm font-medium text-background outline-none transition-colors hover:bg-background/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-foreground motion-reduce:transition-none"
                  >
                    <Mail aria-hidden="true" className="size-4" />
                    Email instead
                  </a>
                ) : (
                  <Link
                    href="/contact"
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-background/25 px-5 text-sm font-medium text-background outline-none transition-colors hover:bg-background/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-foreground motion-reduce:transition-none"
                  >
                    Ask a question
                  </Link>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
