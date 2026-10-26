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

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();

  return (
    <>
      <PageHeader
        eyebrow="Work"
        title="Projects & case studies"
        description="Problems solved and how they were built."
      />

      <Section>
        <ProjectsExplorer projects={projects} />
      </Section>

      <Section className="bg-muted/40">
        <Reveal>
          <div className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h2 className="text-card-title text-foreground">
              Have a project in mind?
            </h2>
            <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
              Tell me what you want to build and where you are today, and we can
              talk through the next step.
            </p>
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-all duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-safe:active:scale-[0.98]"
            >
              Discuss Your Project
            </Link>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
