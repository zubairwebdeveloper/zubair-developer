import Link from "next/link";

import { ProcessSection } from "@/components/home/ProcessSection";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { Section } from "@/components/shared/Section";

export const metadata = {
  title: "Process",
  description: "How a project goes from discovery to delivery.",
  alternates: { canonical: "/process" },
};

const PROCESS_VALUES = [
  {
    label: "Clear scope",
    text: "No vague hand-waving. The project goals, deliverables, and next steps are agreed before work starts.",
  },
  {
    label: "Transparent timeline",
    text: "Timing is tied to the agreed scope and dependencies, so delivery expectations stay realistic.",
  },
  {
    label: "Practical feedback",
    text: "Progress is reviewed in stages so the build stays aligned without unnecessary churn.",
  },
];

export default function ProcessPage() {
  return (
    <>
      <PageHeader
        eyebrow="Process"
        title="A clear process from discovery to launch"
        description="From your first message through the agreed build, review, launch, and any optional ongoing support."
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
              {PROCESS_VALUES.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-border bg-background/70 p-4 text-sm leading-relaxed text-muted-foreground shadow-sm transition-transform duration-300 motion-safe:hover:-translate-y-1"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
                    {item.label}
                  </p>
                  <p className="mt-3">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </Section>

      <ProcessSection showHeading={false} detailed />

      <Section>
        <Reveal>
          <div className="flex flex-col items-start gap-4 rounded-[1.75rem] border border-border bg-card p-6 shadow-soft sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Ready when you are
            </p>
            <h2 className="text-card-title text-foreground">
              Want to move from idea to a working project?
            </h2>
            <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
              Share the goal, the audience, and the problem you want to solve. We can talk through the scope and next steps before any work begins.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/hire-me"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-all duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-safe:active:scale-[0.98]"
              >
                Start a project
              </Link>
              <Link
                href="/services"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-background px-5 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Explore services
              </Link>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
