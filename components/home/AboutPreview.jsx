import Link from "next/link";
import { ArrowRight, FileText, MessageSquare, Rocket } from "lucide-react";

import { AboutRoles } from "@/components/home/AboutRoles";
import { Reveal } from "@/components/shared/Reveal";
import { Section } from "@/components/shared/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

// Editable content: keep this in line with your /about page.
const TECHNOLOGIES = ["Next.js", "React", "Firebase", "Tailwind CSS"];

const START_STEPS = [
  {
    icon: MessageSquare,
    title: "You send a message",
    description: "Describe what you want to build and where you are today.",
  },
  {
    icon: FileText,
    title: "A written proposal",
    description:
      "Final scope, price and timeline are agreed in writing before work begins.",
  },
  {
    icon: Rocket,
    title: "The project begins",
    description:
      "Work follows a clear workflow, so you know what happens next.",
  },
];

const QUICK_LINKS = [
  {
    href: "/services",
    title: "Services",
    description: "What can be built, with clear deliverables.",
  },
  {
    href: "/projects",
    title: "Projects",
    description: "Case studies: the problem, the solution, the outcome.",
  },
  {
    href: "/process",
    title: "Process",
    description: "How a project goes from discovery to delivery.",
  },
];

export function AboutPreview() {
  return (
    <Section className="relative overflow-hidden">
      {/* Soft static glow: decorative only */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-0 size-72 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative">
        <SectionHeading
          eyebrow="About"
          title="Hi, I'm Zubair"
          description="The person behind Zubair Developer."
        />

        <div className="mt-10 grid gap-8 sm:mt-12 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
          <Reveal>
            <div className="flex max-w-prose flex-col gap-5">
              <p className="text-base leading-relaxed text-muted-foreground">
                I am a full stack web developer. I help businesses build
                high-performance websites, scalable web applications and
                AI-powered automation systems.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                My focus is on practical solutions: clear scope, honest starting
                prices and direct communication from the first message to
                handover.
              </p>

              <div className="flex flex-col gap-2.5 pt-1">
                <p className="text-sm text-muted-foreground">
                  Technologies I work with
                </p>
                <ul className="flex flex-wrap gap-2">
                  {TECHNOLOGIES.map((tech) => (
                    <li
                      key={tech}
                      className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground transition-colors duration-200 hover:border-primary/40"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/about"
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "group gap-2 motion-safe:active:scale-[0.98]",
                  )}
                >
                  Read more about me
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                  />
                </Link>
                <Link
                  href="/contact"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "motion-safe:active:scale-[0.98]",
                  )}
                >
                  Discuss Your Project
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                At a glance
              </h3>
              <AboutRoles />
              <p className="border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
                Work is agreed in writing before it begins.
              </p>
            </div>
          </Reveal>
        </div>

        {/* How we start */}
        <div className="mt-14 sm:mt-20">
          <Reveal>
            <h3 className="text-card-title text-foreground">How we start</h3>
          </Reveal>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {START_STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="grid">
                  <Reveal delay={index * 0.08}>
                    <div className="group relative flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-md motion-safe:hover:-translate-y-0.5">
                      <div className="flex items-center justify-between">
                        <span
                          aria-hidden="true"
                          className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20 transition-colors duration-200 group-hover:bg-primary/15"
                        >
                          <Icon className="size-5" />
                        </span>
                        <span
                          aria-hidden="true"
                          className="text-metric text-sm text-muted-foreground"
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <h4 className="text-base font-semibold text-foreground">
                        {step.title}
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Quick links */}
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {QUICK_LINKS.map((item, index) => (
            <li key={item.href} className="grid">
              <Reveal delay={0.1 + index * 0.06}>
                <article className="group relative flex h-full flex-col gap-2 rounded-2xl border border-border bg-muted/40 p-5 transition-all duration-200 hover:border-primary/40 hover:bg-card hover:shadow-md focus-within:ring-2 focus-within:ring-ring motion-safe:hover:-translate-y-0.5">
                  <h4 className="text-base font-semibold text-foreground">
                    {/* Stretched link: whole card clickable, one tab stop. */}
                    <Link
                      href={item.href}
                      className="focus-visible:outline-none after:absolute after:inset-0 after:content-['']"
                    >
                      {item.title}
                    </Link>
                  </h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                  <ArrowRight
                    aria-hidden="true"
                    className="mt-auto size-4 pt-0 text-primary transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                  />
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
