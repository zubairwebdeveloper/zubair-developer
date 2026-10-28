import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  CalendarClock,
  FileText,
  Keyboard,
  Layers,
  Link2,
  Mail,
  Palette,
  Plug,
  Search,
} from "lucide-react";

import { CountUp } from "@/components/faq/CountUp";
import { FaqExplorer } from "@/components/faq/FaqExplorer";
import { FloatingAsk } from "@/components/faq/FloatingAsk";
import { Glossary } from "@/components/faq/Glossary";
import { ReadinessChecklist } from "@/components/faq/ReadinessChecklist";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { JsonLd } from "@/components/shared/JsonLd";
import { Section } from "@/components/shared/Section";
import { siteConfig } from "@/config/site";
import { getFaqs } from "@/services/content.service";

export const metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about services, pricing and process.",
  alternates: { canonical: "/faq" },
};

const tips = [
  {
    icon: Search,
    title: "Search or filter",
    text: "Type a keyword to narrow the list. Matching words are highlighted in the answers.",
  },
  {
    icon: Keyboard,
    title: "Keyboard shortcuts",
    text: "Press / to focus search and Esc to clear it. Use the arrow keys to move between questions.",
  },
  {
    icon: Link2,
    title: "Share an answer",
    text: "Open a question and use Copy link to send someone straight to it.",
  },
];

/** Generic factors, koi price ya timeline number nahi. */
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
    text: "A ready design speeds things up. Designing from scratch needs more time and feedback rounds.",
  },
  {
    icon: FileText,
    title: "Content",
    text: "Text, images and brand material that is ready on time keeps the project moving.",
  },
  {
    icon: Boxes,
    title: "Existing systems",
    text: "Working with an existing website or database means checking what is already there first.",
  },
  {
    icon: CalendarClock,
    title: "Deadline",
    text: "A fixed date can shape what goes into the first version. Features can follow later.",
  },
];

export default async function FaqPage() {
  const faqs = await getFaqs();
  const email = siteConfig.contactEmail;

  const valid = faqs.filter((faq) => faq?.question && faq?.answer);
  const categoryCount = new Set(
    valid.map((faq) => faq.category).filter(Boolean),
  ).size;

  // Sirf real data se numbers
  const stats = [
    { label: "Questions answered", value: valid.length },
    { label: "Topics", value: categoryCount },
  ].filter((stat) => stat.value > 0);

  const jsonLd =
    valid.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: valid.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }
      : null;

  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}

      <PageHeader
        eyebrow="FAQ"
        title="Frequently asked questions"
        description="Answers about services, pricing and the way we work together."
      />

      {/* 1. Questions */}
      <Section>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-12">
          <div className="min-w-0">
            {valid.length > 0 ? (
              <FaqExplorer faqs={valid} />
            ) : (
              <div className="border-border bg-card rounded-2xl border border-dashed px-6 py-14 text-center">
                <h2 className="font-heading text-lg font-semibold">
                  No questions yet
                </h2>
                <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm leading-6">
                  Answers will appear here once they are published. In the
                  meantime, feel free to ask directly.
                </p>
              </div>
            )}
          </div>

          <aside
            aria-label="About this page"
            className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-24 lg:self-start"
          >
            {stats.length > 0 ? (
              <Reveal direction="up">
                <dl className="border-border bg-card grid grid-cols-2 gap-4 rounded-2xl border p-5">
                  {stats.map((stat) => (
                    <div key={stat.label} className="flex flex-col gap-1">
                      <dd className="font-heading text-3xl font-semibold tracking-tight">
                        <CountUp value={stat.value} />
                      </dd>
                      <dt className="text-muted-foreground text-xs">
                        {stat.label}
                      </dt>
                    </div>
                  ))}
                </dl>
              </Reveal>
            ) : null}

            <Reveal direction="up">
              <div className="border-border bg-card flex flex-col gap-3 rounded-2xl border p-5">
                <h2 className="text-card-title">Cannot find your answer?</h2>
                <p className="text-muted-foreground text-sm leading-6">
                  Send your question and I will get back to you.
                </p>
                <Link
                  href="/contact"
                  className="group bg-primary text-primary-foreground focus-visible:ring-ring inline-flex min-h-11 w-fit items-center gap-2 rounded-lg px-4 text-sm font-medium outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 motion-safe:active:scale-[0.98]"
                >
                  Ask a question
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
                  />
                </Link>
              </div>
            </Reveal>
          </aside>
        </div>
      </Section>

      {/* 2. Readiness checklist */}
      <Section className="bg-muted/40">
        <div className="flex max-w-2xl flex-col gap-3">
          <h2 className="text-section-title">Are you ready to start?</h2>
          <p className="text-muted-foreground leading-7">
            A quick self-check before you write. You do not need everything
            ticked. It only helps you prepare a clearer message.
          </p>
        </div>
        <div className="mt-6 sm:mt-8">
          <Reveal direction="up" className="min-w-0">
            <ReadinessChecklist />
          </Reveal>
        </div>
      </Section>

      {/* 3. Cost and timeline factors */}
      <Section>
        <div className="flex max-w-2xl flex-col gap-3">
          <h2 className="text-section-title">What affects cost and timeline</h2>
          <p className="text-muted-foreground leading-7">
            Every project is different, so I scope it with you first. These are
            the things that usually matter most.
          </p>
        </div>
        <ul className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {factors.map(({ icon: Icon, title, text }) => (
            <li key={title}>
              <Reveal direction="up" className="h-full">
                <div className="border-border bg-card hover:border-primary/40 h-full rounded-2xl border p-5 transition-colors duration-200 sm:p-6 motion-reduce:transition-none">
                  <span
                    aria-hidden="true"
                    className="bg-primary/10 text-primary mb-4 flex size-10 items-center justify-center rounded-lg"
                  >
                    <Icon className="size-5" />
                  </span>
                  <h3 className="text-card-title">{title}</h3>
                  <p className="text-muted-foreground mt-2 leading-7">{text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      {/* 4. Glossary */}
      <Section className="bg-muted/40">
        <div className="flex max-w-2xl flex-col gap-3">
          <h2 className="text-section-title">Plain-language glossary</h2>
          <p className="text-muted-foreground leading-7">
            Technical words explained simply, so every conversation is easy to
            follow.
          </p>
        </div>
        <div className="mt-6 sm:mt-8">
          <Glossary />
        </div>
      </Section>

      {/* 5. Tips */}
      <Section>
        <div className="flex max-w-2xl flex-col gap-3">
          <h2 className="text-section-title">Find answers faster</h2>
          <p className="text-muted-foreground leading-7">
            A few ways to get around this page quickly.
          </p>
        </div>
        <ul className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 md:grid-cols-3">
          {tips.map(({ icon: Icon, title, text }) => (
            <li key={title}>
              <Reveal direction="up" className="h-full">
                <div className="border-border bg-card hover:border-primary/40 h-full rounded-2xl border p-5 transition-colors duration-200 sm:p-6 motion-reduce:transition-none">
                  <span
                    aria-hidden="true"
                    className="bg-primary/10 text-primary mb-4 flex size-10 items-center justify-center rounded-lg"
                  >
                    <Icon className="size-5" />
                  </span>
                  <h3 className="text-card-title">{title}</h3>
                  <p className="text-muted-foreground mt-2 leading-7">{text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      {/* 6. CTA */}
      <Section className="bg-muted/40">
        <Reveal direction="up">
          <div className="bg-foreground text-background relative isolate overflow-hidden rounded-3xl p-6 sm:p-10">
            <div
              aria-hidden="true"
              className="bg-primary/30 pointer-events-none absolute -top-20 -right-20 -z-10 size-64 rounded-full blur-3xl"
            />
            <div className="flex max-w-2xl flex-col gap-3">
              <h2 className="font-heading text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.15] font-semibold tracking-tight text-balance">
                Still have a question?
              </h2>
              <p className="text-background/75 leading-7">
                Tell me about your project or ask anything about how I work.
              </p>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Link
                  href="/contact"
                  className="group bg-primary text-primary-foreground focus-visible:ring-primary focus-visible:ring-offset-foreground inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-medium outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 motion-safe:active:scale-[0.98]"
                >
                  Contact Me
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
                  />
                </Link>
                {email ? (
                  <a
                    href={`mailto:${email}`}
                    className="border-background/25 hover:bg-background/10 focus-visible:ring-primary focus-visible:ring-offset-foreground inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none"
                  >
                    <Mail aria-hidden="true" className="size-4" />
                    Email instead
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </Reveal>
      </Section>

      <FloatingAsk />
    </>
  );
}
