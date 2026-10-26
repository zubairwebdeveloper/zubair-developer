import Link from "next/link";
import { ProcessExplorer } from "@/components/home/ProcessExplorer";
import { Reveal } from "@/components/shared/Reveal";
import { Section } from "@/components/shared/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { getProcessSteps } from "@/services/content.service";

// Editable content: adjust these answers so they match how you actually work.
const FAQ_ITEMS = [
  {
    question: "How will I know what happens next?",
    answer:
      "Each step above explains what that stage covers, and the walkthrough always shows the stage that follows it, so the order of work is clear at any point.",
  },
  {
    question: "Can the process be adapted to my project?",
    answer:
      "Projects differ in size and scope. Tell us about yours and we can discuss which stages apply and how they fit your needs.",
  },
  {
    question: "What should I prepare before the first conversation?",
    answer:
      "A short description of the problem you want to solve, who will use the result, and any existing systems or content involved. Rough notes are fine.",
  },
  {
    question: "How do I get started?",
    answer:
      "Use the contact page to describe your project. The first conversation is where the process above begins.",
  },
];

function normalizeStep(step, index) {
  return {
    id: String(step?.id ?? step?.title ?? index),
    title: step?.title ?? `Step ${index + 1}`,
    description: step?.description ?? "",
    duration: typeof step?.duration === "string" ? step.duration : null,
    outcome: typeof step?.outcome === "string" ? step.outcome : null,
    deliverables: Array.isArray(step?.deliverables)
      ? step.deliverables.filter((item) => typeof item === "string")
      : [],
  };
}

export async function ProcessSection({ showHeading = true }) {
  const rawSteps = await getProcessSteps();

  if (!Array.isArray(rawSteps) || rawSteps.length === 0) return null;

  // Plain, serializable objects only, since they cross the server/client boundary.
  const steps = rawSteps.map(normalizeStep);

  return (
    <Section>
      {showHeading ? (
        <SectionHeading
          eyebrow="Process"
          title="From first conversation to launch"
          description="A clear workflow so you always know what happens next."
        />
      ) : null}

      <div className="mt-10 sm:mt-12">
        <ProcessExplorer steps={steps} />
      </div>

      <Reveal delay={0.1}>
        <div className="mt-14 grid gap-8 sm:mt-20 lg:grid-cols-[1fr_1.2fr] lg:gap-12">
          <div className="flex flex-col items-start gap-4">
            <h3 className="text-card-title text-foreground">
              Common questions
            </h3>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Short answers about how the work is organised. Anything else, just
              ask.
            </p>
            <Link
              href="/contact"
              className="mt-2 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-all duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-safe:active:scale-[0.98]"
            >
              Discuss Your Project
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.question}
                className="group rounded-2xl border border-border bg-card transition-colors duration-200 open:border-primary/30 hover:border-primary/30"
              >
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-3.5 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-[[open]]:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m5 7.5 5 5 5-5" />
                  </svg>
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
