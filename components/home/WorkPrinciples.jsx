import { FiCheckCircle, FiFileText, FiTag } from "react-icons/fi";

import { Reveal } from "@/components/shared/Reveal";
import { Section } from "@/components/shared/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";

// Editable content: keep these in line with how you actually work.
const PRINCIPLES = [
  {
    icon: FiFileText,
    title: "Agreed in writing first",
    description:
      "Final scope, price and timeline are agreed in a written proposal before any work begins.",
  },
  {
    icon: FiTag,
    title: "Starting prices up front",
    description:
      "Services list a starting price, so you know where the conversation begins before you reach out.",
  },
  {
    icon: FiCheckCircle,
    title: "A workflow you can follow",
    description:
      "Every project follows the same clear stages, so you always know what happens next.",
  },
];

export function WorkPrinciples() {
  return (
    <Section>
      <SectionHeading
        eyebrow="How I work"
        title="Clear from the first message"
        description="Simple ground rules that keep projects predictable."
      />

      <ul className="mt-10 grid gap-4 sm:mt-12 md:grid-cols-3">
        {PRINCIPLES.map((item, index) => {
          const Icon = item.icon;
          return (
            <li key={item.title} className="grid">
              <Reveal delay={index * 0.06}>
                <article className="group flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-md motion-safe:hover:-translate-y-0.5 sm:p-6">
                  <span
                    aria-hidden="true"
                    className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-brand ring-1 ring-inset ring-primary/20 transition-colors duration-200 group-hover:bg-primary/15"
                  >
                    <Icon className="size-5" />
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-card-title text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </article>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
