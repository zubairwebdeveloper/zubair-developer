import { ArrowRight, Bot, Check, Code2, Globe, Layers } from "lucide-react";
import Link from "next/link";

import { HeroVisual } from "@/components/home/HeroVisual";
import { Container } from "@/components/shared/Container";
import { Reveal } from "@/components/shared/Reveal";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { primaryCta } from "@/config/site";
import { cn } from "@/lib/utils/cn";

/** The promises from your original line, shown as separate points. */
const trustPoints = [
  "Clear scope",
  "Transparent starting prices",
  "Direct communication",
];

/**
 * Edit this list to the technologies you actually offer to clients.
 * Also doubles as the content for the floating chips around the visual
 * below, so each entry only needs to live in one place.
 */
const technologies = ["Next.js", "React", "Firebase", "Tailwind CSS"];

/** Where each floating chip sits relative to the visual's square frame. */
const chipPlacement = [
  "-top-3 left-2 lg:-left-4",
  "top-10 -right-2 lg:-right-10",
  "bottom-12 -left-3 lg:-left-10",
  "-bottom-3 right-4 lg:right-0",
];

/** Worded from the hero paragraph. Edit to match your services. */
const focusAreas = [
  {
    icon: Globe,
    title: "High-performance websites",
    description: "Fast, responsive sites built to represent your business.",
  },
  {
    icon: Layers,
    title: "Scalable web applications",
    description: "SaaS products and web apps designed to grow with you.",
  },
  {
    icon: Bot,
    title: "AI-powered automation",
    description: "Chatbots and automation that handle repeat work.",
  },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const pressFeedback = "motion-safe:active:scale-[0.98]";

export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-title"
      className="overflow-hidden py-14 md:py-24"
    >
      <Container className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
        <Reveal className="flex flex-col items-start gap-6">
          <Badge
            variant="secondary"
            className="gap-1.5 font-normal normal-case tracking-normal"
          >
            <Code2 aria-hidden="true" className="size-3.5" />
            Full-stack development, SaaS &amp; AI automation
          </Badge>

          <h1 id="hero-title" className="text-hero text-balance">
            Building Digital Products That{" "}
            <span className="text-primary">Move Businesses Forward.</span>
          </h1>

          <p className="text-body-lg max-w-xl text-pretty text-muted-foreground">
            I help businesses build high-performance websites, scalable web
            applications, and AI-powered automation systems that turn ideas into
            practical digital solutions.
          </p>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <Link
              href={primaryCta.href}
              className={cn(
                buttonVariants({ size: "lg" }),
                "group w-full gap-2 sm:w-auto",
                pressFeedback,
                focusRing,
              )}
            >
              {primaryCta.label}
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
              />
            </Link>
            <Link
              href="/projects"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "w-full sm:w-auto",
                pressFeedback,
                focusRing,
              )}
            >
              Explore My Work
            </Link>
          </div>

          <Link
            href="/process"
            className={cn(
              "group inline-flex min-h-11 items-center gap-1.5 rounded-lg text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground",
              focusRing,
            )}
          >
            See how a project works
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
            />
          </Link>

          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {trustPoints.map((point) => (
              <li key={point} className="flex items-center gap-2">
                <Check
                  aria-hidden="true"
                  className="size-4 shrink-0 text-primary"
                />
                {point}
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-2 border-t border-border/60 pt-5">
            <p className="text-sm text-muted-foreground">
              Technologies I work with
            </p>
            <ul className="flex flex-wrap gap-2">
              {technologies.map((tech) => (
                <li
                  key={tech}
                  className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* Visual: the 3D scene stays the centerpiece; the chips are a quiet,
            desktop-only frame around it, not a second competing element. */}
        <Reveal delay={0.12} className="relative flex justify-center">
          <HeroVisual />
          <ul
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden lg:block"
          >
            {technologies.map((tech, index) => (
              <li
                key={tech}
                style={{ animationDelay: `${480 + index * 110}ms` }}
                className={cn(
                  "absolute rounded-full border border-border bg-card/90 px-2.5 py-1 font-mono text-[11px] text-muted-foreground shadow-sm backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:fill-mode-both motion-safe:duration-500",
                  chipPlacement[index],
                )}
              >
                {tech}
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>

      <Container className="mt-12 md:mt-16">
        <h2 className="sr-only">What I build</h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {focusAreas.map((item, index) => {
            const Icon = item.icon;
            return (
              <li key={item.title} className="grid">
                <Reveal delay={0.1 + index * 0.06}>
                  <article className="group relative flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-md focus-within:ring-2 focus-within:ring-ring motion-safe:hover:-translate-y-0.5">
                    <span
                      aria-hidden="true"
                      className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20"
                    >
                      <Icon className="size-5" />
                    </span>
                    <h3 className="text-card-title text-foreground">
                      {/* Stretched link: whole card clickable, one tab stop. */}
                      <Link
                        href="/services"
                        className="focus-visible:outline-none after:absolute after:inset-0 after:content-['']"
                      >
                        {item.title}
                      </Link>
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    <ArrowRight
                      aria-hidden="true"
                      className="mt-auto size-4 text-primary transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                    />
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
