// components/home/FeaturedProjects.jsx
// Redesigned: TiltCard on cards + Stagger reveals + gradient CTA banner.
import Link from "next/link";

import { FeaturedProjectGrid } from "@/components/projects/FeaturedProjectGrid";
import { Reveal } from "@/components/shared/Reveal";
import { Section } from "@/components/shared/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { EmptyState } from "@/components/shared/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { getPublishedProjects } from "@/services/projects.service";

const FEATURED_LIMIT = 3;

export async function FeaturedProjects({
  projectsHref = "/projects",
  contactHref = "/hire-me",
}) {
  const published = await getPublishedProjects();
  const featured = published.filter((project) => project.featured);
  const projects = (featured.length > 0 ? featured : published).slice(
    0,
    FEATURED_LIMIT,
  );

  const hasMore = published.length > projects.length;

  return (
    <Section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          eyebrow="Work"
          title="Featured projects"
          description="Problem, approach and what was built."
          animate={false}
        />
        {hasMore && (
          <Reveal direction="left">
            <Link href={projectsHref} className={buttonVariants({ variant: "outline" })}>
              View all {published.length} projects
            </Link>
          </Reveal>
        )}
      </div>

      {projects.length > 0 ? (
        <FeaturedProjectGrid projects={projects} />
      ) : (
        <EmptyState
          className="mt-8"
          size="sm"
          title="Case studies are being prepared"
          description="Published project stories will appear here as they are ready."
          action={{ label: "Discuss a project", href: contactHref }}
        />
      )}

      {projects.length > 0 ? (
        <Reveal delay={0.1}>
          <div className="relative mt-10 overflow-hidden rounded-2xl border border-border/60 bg-card p-6 sm:mt-12 sm:p-8">
          {/* Subtle gradient accent */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/50 via-primary/30 to-transparent"
          />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-lg font-semibold tracking-tight text-foreground">
                Have a similar project in mind?
              </p>
              <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
                Tell me what you want to build or fix. I will reply with a clear next step.
              </p>
            </div>
            <Link
              href={contactHref}
              className={cn(
                buttonVariants({ size: "lg" }),
                "group w-full shrink-0 gap-2 sm:w-auto",
              )}
            >
              Discuss your project
            </Link>
          </div>
          </div>
        </Reveal>
      ) : null}
    </Section>
  );
}
