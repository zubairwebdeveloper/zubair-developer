import Link from "next/link";

import { ProjectCard } from "@/components/projects/ProjectCard";
import { Section } from "@/components/shared/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button, buttonVariants } from "@/components/ui/button";
import { getPublishedProjects } from "@/services/projects.service";

const FEATURED_LIMIT = 3;

// Keeps one or two projects from leaving empty gaps in a three-column grid.
const gridByCount = {
  1: "mx-auto max-w-xl",
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 lg:grid-cols-3",
};

/**
 * FeaturedProjects
 *
 * @param {string} [projectsHref]  The full projects page.
 * @param {string} [contactHref]   Where the closing call to action goes.
 */
export async function FeaturedProjects({
  projectsHref = "/projects",
  contactHref = "/contact",
}) {
  let published = [];
  try {
    published = await getPublishedProjects();
  } catch (error) {
    // A failed projects request should not break the whole page, so skip the section.
    console.error("[featured-projects] failed to load projects:", error);
  }

  const projects = published.filter((p) => p.featured).slice(0, FEATURED_LIMIT);

  if (projects.length === 0) return null;

  const hasMore = published.length > projects.length;

  return (
    <Section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex max-w-2xl flex-col gap-3">
          <SectionHeading eyebrow="Work" title="Featured projects" />
          <p className="text-pretty leading-relaxed text-muted-foreground">
            A selection of recent work. Each project shows the problem, the
            approach, and what was built.
          </p>
        </div>

        {hasMore ? (
          <Link
            href={projectsHref}
            className={buttonVariants({ variant: "outline" })}
          >
            View all {published.length} projects
          </Link>
        ) : null}
      </div>

      <div
        className={`mt-10 grid gap-6 ${gridByCount[projects.length] ?? gridByCount[3]}`}
      >
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>

      <div className="mt-12 flex flex-col items-start gap-4 rounded-2xl border border-border/60 bg-muted/30 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex flex-col gap-1">
          <p className="text-lg font-semibold tracking-tight">
            Have a similar project in mind?
          </p>
          <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
            Tell me what you want to build or fix, and I will reply with a clear
            next step.
          </p>
        </div>
        <Button  size="lg" className="w-full sm:w-auto">
          <Link href={contactHref}>Discuss your project</Link>
        </Button>
      </div>
    </Section>
  );
}
