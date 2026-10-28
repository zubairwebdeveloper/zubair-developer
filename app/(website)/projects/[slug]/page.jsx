import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CaseStudyNav } from "@/components/projects/CaseStudyNav";
import { CopyLinkButton } from "@/components/projects/CopyLinkButton";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { Section } from "@/components/shared/Section";
import { rankRelated } from "@/lib/projects/related";
import {
  getProjectBySlug,
  getPublishedProjects,
} from "@/services/projects.service";

export async function generateStaticParams() {
  const projects = await getPublishedProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};

  return {
    title: project.seoTitle ?? project.title,
    description: project.seoDescription ?? project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
  };
}

function ExternalIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="size-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 5H5.5A1.5 1.5 0 0 0 4 6.5v8A1.5 1.5 0 0 0 5.5 16h8a1.5 1.5 0 0 0 1.5-1.5V12M11 4h5v5M16 4l-7 7" />
    </svg>
  );
}

function ArrowIcon({ direction = "right" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="size-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === "right" ? (
        <path d="M4 10h12m-5-5 5 5-5 5" />
      ) : (
        <path d="M16 10H4m5-5-5 5 5 5" />
      )}
    </svg>
  );
}

function CaseStudyBlock({ id, number, title, children }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28">
      <Reveal>
        <div className="rounded-[1.5rem] border border-border bg-card/80 p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="text-metric inline-flex h-9 min-w-11 items-center justify-center rounded-lg bg-primary/10 px-2.5 text-sm text-brand ring-1 ring-inset ring-primary/20"
              >
                {String(number).padStart(2, "0")}
              </span>
              <h2 id={`${id}-title`} className="text-card-title text-foreground">
                {title}
              </h2>
            </div>
            <div className="max-w-prose whitespace-pre-line text-base leading-relaxed text-muted-foreground">
              {children}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

const linkButtonBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-safe:active:scale-[0.98]";

function AdjacentLink({ project, direction }) {
  const isPrev = direction === "prev";
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`group flex min-h-20 flex-col gap-1 rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        isPrev ? "items-start text-left" : "items-end text-right sm:col-start-2"
      }`}
    >
      <span className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {isPrev ? <ArrowIcon direction="left" /> : null}
        {isPrev ? "Previous project" : "Next project"}
        {isPrev ? null : <ArrowIcon />}
      </span>
      <span className="text-sm font-medium text-foreground group-hover:text-brand">
        {project.title}
      </span>
    </Link>
  );
}

export default async function ProjectDetailPage({ params }) {
  const { slug } = await params;
  const [project, all] = await Promise.all([
    getProjectBySlug(slug),
    getPublishedProjects(),
  ]);
  if (!project) notFound();

  const related = rankRelated(project, all);

  const sections = [
    { id: "problem", title: "Problem", body: project.problem },
    { id: "solution", title: "Solution", body: project.solution },
    ...(project.technologies?.length
      ? [
          {
            id: "stack",
            title: "Stack",
            technologies: project.technologies,
          },
        ]
      : []),
    { id: "result", title: "Result", body: project.outcome },
  ].filter((item) => Boolean(item.body || item.technologies?.length));

  const currentIndex = all.findIndex((item) => item.slug === project.slug);
  const prevProject = currentIndex > 0 ? all[currentIndex - 1] : null;
  const nextProject =
    currentIndex >= 0 && currentIndex < all.length - 1
      ? all[currentIndex + 1]
      : null;

  const hasTech = Boolean(project.technologies?.length);
  const hasLinks = Boolean(project.liveUrl || project.repoUrl);

  return (
    <>
      <PageHeader
        eyebrow={project.category}
        title={project.title}
        description={project.summary}
      />

      <Section className="pt-0">
        {project.coverImage ? (
          <Reveal className="mb-10 sm:mb-14">
            <div className="relative aspect-video overflow-hidden rounded-[2rem] border border-border bg-muted shadow-soft">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-grid-subtle opacity-60"
              />
              <Image
                src={project.coverImage}
                alt={project.coverAlt || project.title}
                fill
                sizes="(min-width: 1280px) 1200px, (min-width: 768px) 100vw, 100vw"
                className="object-cover transition-transform duration-500 motion-safe:hover:scale-[1.02]"
                priority
              />
            </div>
          </Reveal>
        ) : null}

        <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14">
          {/* Sidebar: sticky on desktop, stacked above content on mobile */}
          <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
            <div className="relative flex flex-col gap-5 overflow-hidden rounded-[1.75rem] border border-border bg-card p-5 shadow-sm">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-3xl"
              />
              <h2 className="relative text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                At a glance
              </h2>

              {project.category ? (
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">
                    Category
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {project.category}
                  </span>
                </div>
              ) : null}

              {hasTech ? (
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-muted-foreground">
                    Technologies
                  </span>
                  <ul
                    aria-label="Technologies"
                    className="flex flex-wrap gap-1.5"
                  >
                    {project.technologies.map((tech) => (
                      <li
                        key={tech}
                        className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                      >
                        {tech}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {hasLinks ? (
                <div className="flex flex-col gap-2">
                  {project.liveUrl ? (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${linkButtonBase} bg-primary text-primary-foreground hover:opacity-90`}
                    >
                      View live project
                      <ExternalIcon />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  ) : null}
                  {project.repoUrl ? (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${linkButtonBase} border border-border text-foreground hover:bg-muted`}
                    >
                      View repository
                      <ExternalIcon />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  ) : null}
                </div>
              ) : null}

              <CopyLinkButton />
            </div>

            {sections.length > 1 ? (
              <CaseStudyNav
                sections={sections.map(({ id, title }) => ({
                  id,
                  label: title,
                }))}
              />
            ) : null}
          </aside>

          {/* Main content */}
          <div className="flex min-w-0 flex-col gap-12 sm:gap-14">
            {sections.map((item, index) => (
              <CaseStudyBlock
                key={item.id}
                id={item.id}
                number={index + 1}
                title={item.title}
              >
                {item.technologies ? (
                  <ul aria-label="Technology stack" className="flex flex-wrap gap-2">
                    {item.technologies.map((technology) => (
                      <li
                        key={technology}
                        className="rounded-full border border-border bg-muted px-3 py-1.5 text-sm font-medium text-foreground"
                      >
                        {technology}
                      </li>
                    ))}
                  </ul>
                ) : (
                  item.body
                )}
              </CaseStudyBlock>
            ))}

            {/* Closing call to action */}
            <Reveal>
              <div className="flex flex-col items-start gap-4 rounded-[1.75rem] border border-border bg-card p-6 shadow-soft sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Next step
                </p>
                <h2 className="text-card-title text-foreground">
                  Have a similar project in mind?
                </h2>
                <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
                  Tell me what you want to build and where you are today, and we
                  can talk through the next step.
                </p>
                <Link
                  href="/hire-me"
                  className={`${linkButtonBase} bg-primary text-primary-foreground hover:opacity-90`}
                >
                  Discuss Your Project
                  <ArrowIcon />
                </Link>
              </div>
            </Reveal>

            {prevProject || nextProject ? (
              <nav
                aria-label="More projects"
                className="grid gap-3 sm:grid-cols-2"
              >
                {prevProject ? (
                  <AdjacentLink project={prevProject} direction="prev" />
                ) : null}
                {nextProject ? (
                  <AdjacentLink project={nextProject} direction="next" />
                ) : null}
              </nav>
            ) : null}
          </div>
        </div>
      </Section>

      {related.length > 0 ? (
        <Section className="bg-muted/40">
          <Reveal>
            <h2 className="text-section-title">Related projects</h2>
          </Reveal>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((item, index) => (
              <Reveal key={item.slug} delay={index * 0.06}>
                <ProjectCard project={item} />
              </Reveal>
            ))}
          </div>
        </Section>
      ) : null}
    </>
  );
}
