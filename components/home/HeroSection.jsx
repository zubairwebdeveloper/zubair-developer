import { ArrowRight, Code2 } from "lucide-react";
import Link from "next/link";

import { AnimatedHeadline } from "@/components/home/AnimatedHeadline";
import { HeroVisual } from "@/components/home/HeroVisual";
import { HeroAvailability } from "@/components/home/hero/HeroAvailability";
import { HeroProofStrip } from "@/components/home/hero/HeroProofStrip";
import { HeroScrollCue } from "@/components/home/hero/HeroScrollCue";
import { HeroServicePaths } from "@/components/home/hero/HeroServicePaths";
import { RotatingWords } from "@/components/home/RotatingWords";
import { CopyEmailButton } from "@/components/layout/CopyEmailButton";
import { Magnetic } from "@/components/motion/Magnetic";
import { Reveal } from "@/components/shared/Reveal";
import { Container } from "@/components/shared/Container";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { primaryCta, siteConfig } from "@/config/site";
import {
  buildServicePaths,
  BUILD_WORDS,
  resolveDescription,
  resolveHeadline,
  splitHeadline,
} from "@/lib/hero/hero-content";
import { SocialRow } from "@/lib/profile/public-profile";
import { cn } from "@/lib/utils/cn";

/**
 * Home hero. Optional profile and published service/pricing data preserve the
 * existing CMS props while allowing truthful, data-backed service cards.
 */
export function HeroSection({
  headline,
  bio,
  availability,
  email,
  socials,
  services = [],
  plans = [],
  stats,
}) {
  const resolvedHeadline = resolveHeadline({ headline });
  const description = resolveDescription({ bio, headline });
  const { lead, accent } = splitHeadline(resolvedHeadline);
  const paths = buildServicePaths({ services, plans });

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-x-clip pt-10 pb-12 sm:pt-14 md:py-20"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-grid-subtle bg-noise [mask-image:radial-gradient(ellipse_at_top,black_35%,transparent_78%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-20 -z-10 size-[min(34rem,90vw)] rounded-full opacity-25 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--primary) 36%, transparent), transparent 68%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[18%] top-[24%] -z-10 size-72 rounded-full opacity-15 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--violet) 28%, transparent), transparent 70%)",
        }}
      />

      <Container className="grid min-w-0 items-center gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
        <div className="flex min-w-0 flex-col items-start gap-4 sm:gap-5">
          <div className="flex max-w-full flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              aria-label="Full Stack Web Developer, SaaS Developer, and Chatbot Automation Developer"
              className="max-w-full gap-1.5 whitespace-normal font-normal normal-case tracking-normal"
            >
              <Code2 aria-hidden="true" className="size-3.5 shrink-0" />
              <span className="sm:hidden">
                Full Stack · Chatbots · Automation
              </span>
              <span className="hidden sm:inline">
                Full Stack Developer · SaaS · Chatbot Automation
              </span>
            </Badge>
            <HeroAvailability availability={availability} />
          </div>

          <div className="group relative w-full max-w-xl overflow-hidden rounded-[1.75rem] border border-border/70 bg-card/85 p-4 shadow-[0_18px_60px_rgba(17,24,39,0.08)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(17,24,39,0.12)] sm:p-5">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-90"
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in srgb, var(--primary) 18%, transparent), transparent 38%, color-mix(in srgb, var(--violet) 18%, transparent))",
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-primary/10 blur-3xl transition-transform duration-500 group-hover:scale-110"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-8 left-1/3 size-28 rounded-full bg-violet/10 blur-3xl transition-transform duration-700 group-hover:translate-y-[-6px]"
            />

            <div className="relative flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-border/70 bg-background/70 px-2.5 py-1 text-[11px] font-medium text-foreground/90">
                  <span className="size-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)] animate-pulse" />
                  <span className="truncate">Available for projects</span>
                </span>
                <span className="rounded-full border border-border/70 bg-muted/60 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Web + Chatbots
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                    Zubair Developer
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    Digital products that turn interest into action.
                  </h2>
                </div>
                <div className="hidden shrink-0 rounded-2xl border border-border/80 bg-background/80 p-2 shadow-sm sm:block">
                  <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    <span className="size-2 rounded-full bg-primary" />
                    Live build
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Web", detail: "Sites + SaaS" },
                  { label: "Backend", detail: "APIs + auth" },
                  { label: "Automation", detail: "Chatbots + flows" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="group/item relative overflow-hidden rounded-2xl border border-border/70 bg-background/60 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-background/80"
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-70" />
                    <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      {item.label}
                    </div>
                    <div className="mt-2 text-sm font-medium text-foreground">
                      {item.detail}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {"Direct communication".split(" ").map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-border/70 bg-background/70 px-2.5 py-1"
                  >
                    {chip}
                  </span>
                ))}
                {"Clear pricing".split(" ").map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-border/70 bg-background/70 px-2.5 py-1"
                  >
                    {chip}
                  </span>
                ))}
                <span className="rounded-full border border-border/70 bg-background/70 px-2.5 py-1">
                  Discovery-first
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/70 p-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Next priority
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    Build, launch, and refine without the chaos.
                  </p>
                </div>
                <Link
                  href="/hire-me"
                  className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/8 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-primary/12 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Start now
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>

          <AnimatedHeadline
            id="hero-title"
            lead={lead}
            accent={accent}
            visibleFirst
          />

          <p className="flex min-h-[3em] w-full flex-wrap items-baseline gap-x-2 font-heading text-lg font-medium tracking-tight text-foreground sm:min-h-[1.5em] sm:text-xl">
            <span className="shrink-0">I build</span>
            <RotatingWords
              words={BUILD_WORDS}
              reserveWidth
              className="text-highlight"
            />
          </p>

          <p className="text-body-lg max-w-xl whitespace-pre-line text-pretty leading-relaxed text-muted-foreground">
            {description}
          </p>

          <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:flex-wrap">
            <Magnetic strength={5} className="w-full sm:w-auto">
              <Link
                href={primaryCta.href}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "focus-ring group w-full gap-2 sm:w-auto motion-safe:active:scale-[0.98]",
                )}
              >
                {primaryCta.label}
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                />
              </Link>
            </Magnetic>
            <Link
              href="/projects"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "focus-ring w-full sm:w-auto motion-safe:active:scale-[0.98]",
              )}
            >
              See My Work
            </Link>
            <Link
              href="#chatbot-demo"
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline sm:w-auto"
            >
              Watch the chatbot demo
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>

          <HeroServicePaths paths={paths} />

          <HeroProofStrip siteConfig={siteConfig} stats={stats} />

          {email || socials ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/60 pt-3 text-sm text-muted-foreground">
              {socials ? <SocialRow socials={socials} /> : null}
              {email ? <CopyEmailButton email={email} /> : null}
            </div>
          ) : null}

          <HeroScrollCue />
        </div>

        <Reveal
          delay={0.12}
          className="relative flex min-w-0 justify-center lg:pl-2"
        >
          <div className="w-full max-w-md">
            <HeroVisual />
          </div>
        </Reveal>
      </Container>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-background/70"
      />
    </section>
  );
}
