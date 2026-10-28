import Link from "next/link";

import { ProcessStory } from "@/components/home/ProcessStory";
import { Reveal } from "@/components/shared/Reveal";
import { Section } from "@/components/shared/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";

const STEPS = [
  {
    id: "discovery",
    title: "Discovery",
    description:
      "We discuss your goals, audience, current situation, and constraints to understand what the project needs to solve.",
    deliverable: "A shared understanding of the goal and project requirements.",
    fromYou: "Your idea, priorities, audience, and any known constraints.",
    duration: "Depends on scope",
  },
  {
    id: "proposal",
    title: "Proposal & Fixed Quote",
    description:
      "I turn the agreed requirements into a written scope, quote, and delivery plan before work begins.",
    deliverable: "A written proposal with scope, price, and timeline.",
    fromYou: "Review and approval of the proposal before work starts.",
    duration: "Depends on scope",
  },
  {
    id: "design",
    title: "Design",
    description:
      "We shape the structure and visual direction around your users and the agreed scope.",
    deliverable: "A reviewed design direction and page or screen structure.",
    fromYou: "Brand assets, content, and feedback on the proposed direction.",
    duration: "Depends on scope",
  },
  {
    id: "build",
    title: "Build",
    description:
      "I implement the agreed experience and connect the required features and services.",
    deliverable: "A working implementation of the approved scope.",
    fromYou: "Required content, access to agreed systems, and timely decisions.",
    duration: "Depends on scope",
  },
  {
    id: "review",
    title: "Review",
    description:
      "We check the work against the agreed requirements and address feedback within scope.",
    deliverable: "A tested build with agreed review feedback addressed.",
    fromYou: "Feedback and approval against the agreed requirements.",
    duration: "Depends on scope",
  },
  {
    id: "launch",
    title: "Launch",
    description:
      "I prepare the approved work for release and hand over the agreed project materials.",
    deliverable: "The launched project and an agreed handover.",
    fromYou: "Final approval and any account or domain access needed.",
    duration: "Depends on scope",
  },
  {
    id: "support",
    title: "Support",
    description:
      "After launch, support or maintenance can continue if it is included in the agreed engagement.",
    deliverable: "The support or maintenance outlined in the proposal.",
    fromYou: "Any issues or follow-up work you want to discuss.",
    duration: "Depends on scope",
  },
];

const FAQ_ITEMS = [
  {
    question: "What happens after I contact you?",
    answer:
      "I review the details you share and use them to start a conversation about your goals, requirements, and constraints. If the project is a fit, we clarify the scope and next steps before I prepare a written proposal.",
  },
  {
    question: "Do I need a detailed specification to get started?",
    answer:
      "No. A short description of the problem, who the project is for, and what you hope to achieve is enough to begin. We can clarify details together during discovery.",
  },
  {
    question: "When do work and payment terms begin?",
    answer:
      "The proposal documents the agreed scope, price, timeline, and terms. Work begins after you review and approve that proposal.",
  },
  {
    question: "How long does a project take?",
    answer:
      "Timing depends on the agreed scope, required integrations, and how quickly content, access, and feedback are available. The proposal sets out the timeline for your project.",
  },
  {
    question: "Can the scope change after work begins?",
    answer:
      "If requirements change, we discuss the impact on scope, cost, and timeline and agree on any changes before proceeding with them.",
  },
  {
    question: "Is ongoing support included?",
    answer:
      "Support or maintenance is included only when it is part of the written proposal. It can be discussed as an additional engagement.",
  },
];

export function ProcessSection({ showHeading = true, detailed = false }) {
  return (
    <Section id="process">
      {showHeading ? (
        <SectionHeading
          eyebrow="Process"
          title="From discovery to ongoing support."
          description="A clear sequence of decisions and deliverables, with project timing agreed to match the scope."
        />
      ) : null}

      <div className={showHeading ? "mt-10 sm:mt-12" : ""}>
        <ProcessStory steps={STEPS} />
      </div>

      {detailed ? (
        <Reveal delay={0.1}>
          <div className="mt-16 grid gap-8 sm:mt-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
            <div className="flex flex-col items-start gap-4">
              <p className="text-eyebrow text-brand">Before we begin</p>
              <h2 className="text-section-title text-balance">
                What happens after I contact you?
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                There is no commitment in asking a question. We first clarify
                what you need; a written proposal defines the work before it
                starts.
              </p>
              <Link
                href="/hire-me"
                className="mt-2 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Start a project
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
                      className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
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
      ) : null}
    </Section>
  );
}
