import Link from "next/link";

import { ProjectsExplorer } from "@/components/projects/ProjectsExplorer";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { Section } from "@/components/shared/Section";
import { getPublishedProjects } from "@/services/projects.service";

export const metadata = {
  title: "Projects",
  description: "Selected projects and case studies.",
  alternates: { canonical: "/projects" },
};

const HIGHLIGHTS = [
  {
    label: "Product thinking",
    text: "Interfaces shaped around conversion, clarity, and user flow.",
  },
  {
    label: "Full-stack output",
    text: "Frontend, backend, auth, and integrations built as one system.",
  },
  {
    label: "Real business use",
    text: "Work designed to reduce friction, automate tasks, and scale cleanly.",
  },
];

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();
  const visibleProjects = Array.isArray(projects) ? projects : [];

  return (
    <>
      <PageHeader
        eyebrow="Work"
        title="Projects built to solve real business problems"
        description="A selection of website builds, SaaS work, and automation projects that improved how businesses sell, operate, and convert."
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
              className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-10 bottom-0 h-44 w-44 rounded-full bg-violet/10 blur-3xl"
            />

            <div className="relative grid gap-4 md:grid-cols-3">
              {HIGHLIGHTS.map((item) => (
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

      <Section>
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Portfolio
            </p>
            <h2 className="mt-2 text-section-title">Selected work</h2>
          </div>
          {visibleProjects.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              {visibleProjects.length} published case studies
            </p>
          ) : null}
        </div>
        <ProjectsExplorer projects={projects} />
      </Section>

      <Section className="bg-muted/40">
        <Reveal>
          <div className="flex flex-col items-start gap-4 rounded-[1.75rem] border border-border bg-card p-6 shadow-soft sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Start here
            </p>
            <h2 className="text-card-title text-foreground">
              Have a project in mind?
            </h2>
            <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
              Tell me what you want to build and where you are today, and we can
              talk through the best next step for your goals.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/hire-me"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-all duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-safe:active:scale-[0.98]"
              >
                Discuss Your Project
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
