import Link from "next/link";
import {
  ArrowRight,
  FileCheck2,
  MessageCircle,
  Tag,
  Timer,
} from "lucide-react";

import { Stagger } from "@/components/motion/Stagger";
import { Section } from "@/components/shared/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";

const REASONS = [
  {
    icon: FileCheck2,
    title: "Transparent process",
    description:
      "The steps, responsibilities, and decisions are clear before work moves ahead.",
  },
  {
    icon: Tag,
    title: "Clear pricing",
    description:
      "Published starting prices give you a useful reference. The written quote confirms your project’s scope and cost.",
  },
  {
    icon: MessageCircle,
    title: "Direct communication",
    description:
      "You speak directly with the person planning and building your project.",
  },
  {
    icon: Timer,
    title: "Fast replies",
    description:
      "I aim to respond as soon as I can. Reply timing can vary with workload and project commitments.",
  },
];

export function WhyWorkWithMe() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Why work with me"
        title="Clear expectations, from the first message."
        description="A straightforward working relationship built around clarity and direct contact."
      />

      <Stagger
        className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4"
        staggerDelay={0.07}
      >
        {REASONS.map(({ icon: Icon, title, description }) => (
          <article
            key={title}
            className="group flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-5 transition-[border-color,box-shadow,transform] duration-200 hover:border-primary/40 hover:shadow-md motion-safe:hover:-translate-y-0.5 sm:p-6 motion-reduce:transition-none"
          >
            <span
              aria-hidden="true"
              className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20 transition-colors duration-200 group-hover:bg-primary/15"
            >
              <Icon className="size-5" />
            </span>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-card-title text-foreground">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          </article>
        ))}
      </Stagger>

      <div className="mt-10 flex flex-wrap items-center gap-4 sm:mt-12">
        <Link
          href="/hire-me"
          className="group inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-safe:active:scale-[0.98]"
        >
          Start a project
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5"
          />
        </Link>
        <Link
          href="/process"
          className="inline-flex min-h-11 items-center text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          See the full process
        </Link>
      </div>
    </Section>
  );
}
