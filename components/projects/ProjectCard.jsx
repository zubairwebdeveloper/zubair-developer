import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiExternalLink, FiGithub } from "react-icons/fi";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

// Technologies shown before the rest collapse into a "+N" chip.
const MAX_TECHNOLOGIES = 5;

const isHttpUrl = (value) =>
  typeof value === "string" && /^https?:\/\//i.test(value.trim());

const secondaryLinkClasses =
  "relative z-10 inline-flex items-center gap-1.5 rounded-sm py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * @param {object} project
 * @param {boolean} [priority] Set true for above-the-fold cards so the image loads first
 */
export function ProjectCard({ project, priority = false }) {
  const href = `/projects/${project.slug}`;
  const technologies = Array.isArray(project.technologies)
    ? project.technologies.filter(Boolean)
    : [];
  const visibleTech = technologies.slice(0, MAX_TECHNOLOGIES);
  const hiddenTech = technologies.slice(MAX_TECHNOLOGIES);

  // Optional fields: these only render when your project data actually has them.
  const liveUrl = isHttpUrl(project.liveUrl) ? project.liveUrl.trim() : null;
  const repoUrl = isHttpUrl(project.repoUrl) ? project.repoUrl.trim() : null;

  return (
    <Card
      className={cn(
        "group/project relative h-full overflow-hidden transition-[transform,box-shadow,border-color] duration-300 motion-reduce:transition-none",
        "motion-safe:hover:-translate-y-1 hover:border-foreground/20 hover:shadow-lg",
        "focus-within:border-foreground/20 focus-within:shadow-lg",
      )}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {project.coverImage ? (
          <Image
            src={project.coverImage}
            alt={project.coverAlt ?? project.title}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out motion-reduce:transition-none motion-safe:group-hover/project:scale-105"
          />
        ) : (
          // No cover image: a neutral placeholder keeps card heights consistent
          <div
            aria-hidden="true"
            className="flex size-full items-center justify-center bg-gradient-to-br from-primary/10 via-muted to-brand/10"
          >
            <span className="font-heading text-5xl font-semibold text-foreground/20">
              {String(project.title ?? "?")
                .trim()
                .charAt(0)
                .toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <CardHeader className="gap-3">
        {project.category ? (
          <Badge variant="secondary" className="w-fit">
            {project.category}
          </Badge>
        ) : null}

        <CardTitle className="text-card-title">
          {/* Stretched link: the whole card is clickable, but there is only one anchor */}
          <Link
            href={href}
            className="rounded-sm outline-none after:absolute after:inset-0 after:content-[''] focus-visible:underline"
          >
            {project.title}
          </Link>
        </CardTitle>

        <CardDescription className="line-clamp-3 text-pretty leading-relaxed">
          {project.summary}
        </CardDescription>
      </CardHeader>

      {technologies.length > 0 ? (
        <CardContent>
          <ul
            aria-label="Technologies used"
            className="flex flex-wrap gap-2 text-xs text-muted-foreground"
          >
            {visibleTech.map((tech) => (
              <li key={tech} className="rounded-md bg-muted px-2 py-1">
                {tech}
              </li>
            ))}
            {hiddenTech.length > 0 ? (
              <li
                className="rounded-md bg-muted px-2 py-1 font-medium"
                title={hiddenTech.join(", ")}
              >
                +{hiddenTech.length}
                <span className="sr-only"> more: {hiddenTech.join(", ")}</span>
              </li>
            ) : null}
          </ul>
        </CardContent>
      ) : null}

      <CardFooter className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <span
          aria-hidden="true"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
        >
          View project
          <FiArrowRight className="size-4 transition-transform duration-200 motion-safe:group-hover/project:translate-x-1" />
        </span>

        {liveUrl || repoUrl ? (
          <div className="flex items-center gap-4">
            {liveUrl ? (
              <Link
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={secondaryLinkClasses}
              >
                <FiExternalLink aria-hidden="true" className="size-4" />
                Live site
                <span className="sr-only">
                  {" "}
                  for {project.title} (opens in a new tab)
                </span>
              </Link>
            ) : null}
            {repoUrl ? (
              <Link
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={secondaryLinkClasses}
              >
                <FiGithub aria-hidden="true" className="size-4" />
                Code
                <span className="sr-only">
                  {" "}
                  for {project.title} (opens in a new tab)
                </span>
              </Link>
            ) : null}
          </div>
        ) : null}
      </CardFooter>
    </Card>
  );
}
