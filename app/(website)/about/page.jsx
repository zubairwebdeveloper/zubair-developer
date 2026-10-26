import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Check,
  FileText,
  FolderKanban,
  GitBranch,
  LifeBuoy,
  Mail,
  MessageSquare,
  Wallet,
} from "lucide-react";

import { AboutCapabilities } from "@/components/about/AboutCapabilities";
import { AboutNav } from "@/components/about/AboutNav";
import { AboutTechStack } from "@/components/about/AboutTechStack";
import { ParallaxOrbs } from "@/components/about/ParallaxOrbs";
import { SkillsExplorer } from "@/components/about/SkillsExplorer";
import { TiltCard } from "@/components/about/TiltCard";
import { TypedHeadline } from "@/components/about/TypedHeadline";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { CountUp } from "@/components/faq/CountUp";
import { ProcessSection } from "@/components/home/ProcessSection";
import { CopyEmailButton } from "@/components/layout/CopyEmailButton";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { Section } from "@/components/shared/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { getPublicProfile, SocialRow } from "@/lib/profile/public-profile";
import { cn } from "@/lib/utils/cn";
import { getExperience, getSkills } from "@/services/content.service";
import { getSiteSettings } from "@/services/settingsService";

export const revalidate = 60;

export const metadata = {
  title: "About",
  description:
    "Full stack web developer building websites, SaaS applications and AI chatbot automation for businesses.",
  alternates: { canonical: "/about" },
};

const DEFAULT_DESCRIPTION =
  "I build websites, web applications and AI automation that turn ideas into practical digital solutions.";

const ROLES = [
  "Full Stack Web Developer",
  "SaaS Solutions Specialist",
  "AI Chatbot Automation Expert",
];

// Profile headline na ho to typing ke liye aap ki positioning chalti hai
const FALLBACK_HEADLINE = ROLES.join(" · ");

const PRINCIPLES = [
  {
    title: "Clear scope",
    description:
      "Final scope, price and timeline are agreed in a written proposal before work begins.",
  },
  {
    title: "Transparent starting prices",
    description:
      "Every service lists a starting price, so you know where the conversation begins.",
  },
  {
    title: "Direct communication",
    description:
      "You talk to the person building your project, so questions and feedback go straight to the source.",
  },
  {
    title: "Practical solutions",
    description:
      "The goal is a digital solution that is useful for your business, not complexity for its own sake.",
  },
];

// Generic, aap ke existing messaging (written proposal, direct communication) se
const DELIVERABLES = [
  {
    icon: FileText,
    title: "A written proposal",
    text: "Scope, price and timeline in writing before any work starts.",
  },
  {
    icon: GitBranch,
    title: "Clean, maintainable code",
    text: "Organised so you or another developer can keep building on it.",
  },
  {
    icon: MessageSquare,
    title: "Direct updates",
    text: "You talk to the person building your project, from message to handover.",
  },
  {
    icon: LifeBuoy,
    title: "A proper handover",
    text: "You know how everything works when the project is delivered.",
  },
];

const NEXT_LINKS = [
  {
    href: "/services",
    icon: BadgeCheck,
    title: "Services",
    text: "See what I build and how each service works.",
  },
  {
    href: "/projects",
    icon: FolderKanban,
    title: "Projects",
    text: "Case studies with the problem, solution and outcome.",
  },
  {
    href: "/pricing",
    icon: Wallet,
    title: "Pricing",
    text: "Transparent starting prices for each plan.",
  },
  {
    href: "/contact",
    icon: Mail,
    title: "Contact",
    text: "Ask a question or describe your project.",
  },
];

const FAQ_ITEMS = [
  {
    question: "What kind of projects do you take on?",
    answer:
      "Websites, scalable web applications and SaaS products, and AI-powered automation such as chatbots and website AI assistants. The Services page describes each one.",
  },
  {
    question: "How do we start working together?",
    answer:
      "Request a quote or use the contact page to describe your project. The first conversation is where the process below begins.",
  },
  {
    question: "Are the listed prices final?",
    answer:
      "Listed prices are starting prices. The final scope, price and timeline are agreed in a written proposal before work begins.",
  },
  {
    question: "Can I see examples of your work?",
    answer:
      "Yes. The Projects page has case studies that explain the problem, the solution and the outcome for each project.",
  },
];

async function safe(promise, label) {
  try {
    return (await promise) ?? [];
  } catch (error) {
    console.error(`[about] failed to load ${label}:`, error);
    return [];
  }
}

export default async function AboutPage() {
  const [skills, experience, settings] = await Promise.all([
    safe(getSkills(), "skills"),
    safe(getExperience(), "experience"),
    getSiteSettings().catch((error) => {
      console.error("[about] failed to load profile:", error);
      return null;
    }),
  ]);

  const { headline, bio, socials } = getPublicProfile(settings);
  const email = siteConfig.contactEmail ?? null;
  const typedText = headline || FALLBACK_HEADLINE;

  const showDebug =
    process.env.NODE_ENV !== "production" && !headline && !bio && !socials;

  const grouped = skills.reduce((groups, skill) => {
    if (!skill?.name) return groups;
    (groups[skill.category || "Other"] ??= []).push(skill.name);
    return groups;
  }, {});
  const skillGroups = Object.entries(grouped).map(([category, names]) => ({
    category,
    names,
  }));
  const skillCount = skillGroups.reduce((sum, g) => sum + g.names.length, 0);

  const hasSkills = skillGroups.length > 0;
  const hasExperience = experience.length > 0;

  const stats = [
    { label: "Skills", value: skillCount },
    { label: "Skill areas", value: skillGroups.length },
    { label: "Roles", value: experience.length },
  ].filter((stat) => stat.value > 0);

  const navItems = [
    { id: "intro", label: "Intro" },
    { id: "focus", label: "What I build" },
    { id: "toolbox", label: "Technologies" },
    ...(hasSkills ? [{ id: "skills", label: "Skills" }] : []),
    ...(hasExperience ? [{ id: "experience", label: "Experience" }] : []),
    { id: "principles", label: "Principles" },
    { id: "deliver", label: "What you get" },
    { id: "process", label: "Process" },
    { id: "faq", label: "Questions" },
  ];

  const dynamic = [
    hasSkills && "skills",
    hasExperience && "experience",
    "principles",
    "deliver",
  ].filter(Boolean);
  const tone = (key) =>
    dynamic.indexOf(key) % 2 === 0 ? "bg-muted/40" : undefined;

  const depth = [44, 26, 10];

  return (
    <>
      <ReadingProgress targetId="about-content" />

      <PageHeader
        eyebrow="About"
        title="Zubair Developer"
        description={DEFAULT_DESCRIPTION}
      />

      <div id="about-content">
        {showDebug ? (
          <div className="mx-auto my-4 max-w-3xl rounded-lg border border-dashed border-border bg-muted p-4 text-xs leading-5">
            <p className="font-semibold">Dev only: no profile data found</p>
            <p className="text-muted-foreground">
              settings keys:{" "}
              {settings
                ? Object.keys(settings).join(", ") || "(empty)"
                : "null"}
              {settings?.profile
                ? ` · profile keys: ${Object.keys(settings.profile).join(", ")}`
                : " · no settings.profile"}
            </p>
          </div>
        ) : null}

        {/* Intro */}
        <div className="relative isolate">
          <ParallaxOrbs />
          <Section>
            <div
              id="intro"
              className="grid scroll-mt-28 gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14"
            >
              <Reveal>
                <div className="flex max-w-prose flex-col gap-5">
                  <TypedHeadline
                    text={typedText}
                    className="min-h-7 font-heading text-lg font-medium text-primary"
                  />

                  <h2 className="text-section-title">
                    Building digital products that move businesses forward
                  </h2>

                  {bio ? (
                    <p className="max-w-[68ch] whitespace-pre-line text-base leading-relaxed text-muted-foreground">
                      {bio}
                    </p>
                  ) : (
                    <>
                      <p className="text-base leading-relaxed text-muted-foreground">
                        I am a full stack web developer. I help businesses build
                        high-performance websites, scalable web applications and
                        AI-powered automation systems.
                      </p>
                      <p className="text-base leading-relaxed text-muted-foreground">
                        My focus is on practical solutions: clear scope, honest
                        starting prices and direct communication from the first
                        message to handover.
                      </p>
                    </>
                  )}

                  {socials ? (
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Find me online
                      </p>
                      <SocialRow socials={socials} />
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-3 pt-2">
                    <Link
                      href="/contact"
                      className={cn(
                        buttonVariants({ size: "lg" }),
                        "group gap-2 motion-safe:active:scale-[0.98]",
                      )}
                    >
                      Discuss Your Project
                      <ArrowRight
                        aria-hidden="true"
                        className="size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                      />
                    </Link>
                    <Link
                      href="/projects"
                      className={cn(
                        buttonVariants({ size: "lg", variant: "outline" }),
                        "group gap-2 motion-safe:active:scale-[0.98]",
                      )}
                    >
                      View Projects
                      <ArrowRight
                        aria-hidden="true"
                        className="size-4 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 motion-reduce:transition-none"
                      />
                    </Link>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.08} className="h-full">
                <aside aria-label="At a glance" className="h-full">
                  <TiltCard
                    max={6}
                    className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-lg"
                  >
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      At a glance
                    </h2>

                    <ul className="flex flex-col gap-3 [transform-style:preserve-3d]">
                      {ROLES.map((role, index) => (
                        <li
                          key={role}
                          style={{
                            transform: `translateZ(${depth[index] ?? 10}px)`,
                          }}
                          className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm shadow-sm"
                        >
                          <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <Check
                              aria-hidden="true"
                              className="size-3 text-primary"
                            />
                          </span>
                          <span className="font-medium text-foreground">
                            {role}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {stats.length > 0 ? (
                      <dl
                        className={cn(
                          "grid gap-4 border-t border-border pt-4",
                          stats.length >= 3 ? "grid-cols-3" : "grid-cols-2",
                        )}
                      >
                        {stats.map((stat) => (
                          <div key={stat.label} className="flex flex-col gap-1">
                            <dd className="font-heading text-2xl font-semibold tracking-tight">
                              <CountUp value={stat.value} />
                            </dd>
                            <dt className="text-xs text-muted-foreground">
                              {stat.label}
                            </dt>
                          </div>
                        ))}
                      </dl>
                    ) : null}

                    {email ? (
                      <div className="flex flex-col items-start gap-3 border-t border-border pt-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Email
                        </p>
                        <a
                          href={`mailto:${email}`}
                          className="break-all rounded-sm text-sm font-medium underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {email}
                        </a>
                        <CopyEmailButton email={email} />
                      </div>
                    ) : null}

                    <p className="border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
                      Work is agreed in writing before it begins.
                    </p>
                  </TiltCard>
                </aside>
              </Reveal>
            </div>
          </Section>
        </div>

        <AboutNav items={navItems} />

        {/* What I build */}
        <Section className="bg-muted/40">
          <div id="focus" className="scroll-mt-28">
            <SectionHeading
              eyebrow="What I build"
              title="Three areas of focus"
              description="Pick an area to see what it covers."
            />
            <div className="mt-10 sm:mt-12">
              <AboutCapabilities />
            </div>
          </div>
        </Section>

        {/* Tech stack */}
        <Section>
          <div id="toolbox" className="scroll-mt-28">
            <SectionHeading
              eyebrow="Toolbox"
              title="Technologies I work with"
              description="Filter by area of the stack."
            />
            <div className="mt-10 sm:mt-12">
              <AboutTechStack />
            </div>
          </div>
        </Section>

        {/* Skills */}
        {hasSkills ? (
          <Section className={tone("skills")}>
            <div id="skills" className="scroll-mt-28">
              <SectionHeading
                eyebrow="Skills"
                title="What I am good at"
                description="Filter by category."
              />
              <SkillsExplorer groups={skillGroups} />
            </div>
          </Section>
        ) : null}

        {/* Experience */}
        {hasExperience ? (
          <Section className={tone("experience")}>
            <div id="experience" className="scroll-mt-28">
              <SectionHeading
                eyebrow="Experience"
                title="Where I have worked"
                description="Roles and the work behind them."
              />
              <ol className="mt-10 flex max-w-3xl flex-col sm:mt-12">
                {experience.map((entry, index) => (
                  <li
                    key={entry.id ?? `${entry.role}-${index}`}
                    className={cn(
                      "relative ml-2 border-l border-border pl-6 sm:pl-8",
                      index === experience.length - 1 ? "pb-0" : "pb-10",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute top-1.5 -left-[5.5px] size-2.5 rounded-full ring-4 ring-background",
                        index === 0 ? "bg-primary" : "bg-border",
                      )}
                    />
                    <Reveal delay={Math.min(index, 4) * 0.06}>
                      <TiltCard
                        max={4}
                        className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 transition-colors duration-200 hover:border-primary/40 hover:shadow-md motion-reduce:transition-none"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                          <div className="flex min-w-0 items-start gap-3">
                            <span
                              aria-hidden="true"
                              className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/20"
                            >
                              <Briefcase className="size-4" />
                            </span>
                            <div className="flex min-w-0 flex-col gap-0.5">
                              <h3 className="text-card-title break-words text-foreground">
                                {entry.role}
                              </h3>
                              {entry.company ? (
                                <p className="break-words text-sm text-muted-foreground">
                                  {entry.company}
                                </p>
                              ) : null}
                            </div>
                          </div>
                          {entry.period ? (
                            <p className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                              {entry.period}
                            </p>
                          ) : null}
                        </div>
                        {entry.description ? (
                          <p className="mt-1 max-w-[68ch] whitespace-pre-line break-words text-sm leading-relaxed text-foreground/85">
                            {entry.description}
                          </p>
                        ) : null}
                      </TiltCard>
                    </Reveal>
                  </li>
                ))}
              </ol>
            </div>
          </Section>
        ) : null}

        {/* Principles */}
        <Section className={tone("principles")}>
          <div id="principles" className="scroll-mt-28">
            <SectionHeading
              eyebrow="Principles"
              title="How I like to work"
              description="Simple ground rules that keep projects predictable."
            />
            <ul className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">
              {PRINCIPLES.map((item, index) => (
                <li key={item.title} className="grid">
                  <Reveal delay={index * 0.06}>
                    <TiltCard
                      max={9}
                      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-colors duration-200 hover:border-primary/40 hover:shadow-md motion-reduce:transition-none"
                    >
                      <span
                        aria-hidden="true"
                        style={{ transform: "translateZ(30px)" }}
                        className="text-metric inline-flex h-9 min-w-11 items-center justify-center self-start rounded-lg bg-primary/10 px-2.5 text-sm text-brand ring-1 ring-inset ring-primary/20"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3
                        style={{ transform: "translateZ(18px)" }}
                        className="text-card-title text-foreground"
                      >
                        {item.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </TiltCard>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* What you get */}
        <Section className={tone("deliver")}>
          <div id="deliver" className="scroll-mt-28">
            <SectionHeading
              eyebrow="What you get"
              title="What working together looks like"
              description="The things you can count on from the first message to handover."
            />
            <ul className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">
              {DELIVERABLES.map(({ icon: Icon, title, text }, index) => (
                <li key={title} className="grid">
                  <Reveal delay={index * 0.06}>
                    <article className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-md motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none">
                      <span
                        aria-hidden="true"
                        className="inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/20 transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none"
                      >
                        <Icon className="size-5" />
                      </span>
                      <h3 className="text-card-title text-foreground">
                        {title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {text}
                      </p>
                    </article>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* Process */}
        <div id="process" className="scroll-mt-28">
          <ProcessSection />
        </div>

        {/* FAQ */}
        <Section className="bg-muted/40">
          <Reveal>
            <div
              id="faq"
              className="grid scroll-mt-28 gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-12"
            >
              <div className="flex flex-col items-start gap-4">
                <h2 className="text-section-title">Common questions</h2>
                <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                  Short answers before you get in touch. More are on the FAQ
                  page.
                </p>
                <Link
                  href="/faq"
                  className="group inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  See all questions
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                  />
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                {FAQ_ITEMS.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-2xl border border-border bg-card transition-colors duration-200 open:border-primary/30 hover:border-primary/30"
                  >
                    <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-3.5 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                      {item.question}
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 20 20"
                        className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-[[open]]:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m5 7.5 5 5 5-5" />
                      </svg>
                    </summary>
                    <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </Reveal>
        </Section>

        {/* Where to next */}
        <Section>
          <SectionHeading
            eyebrow="Explore"
            title="Where to next"
            description="Keep exploring, or get in touch."
          />
          <ul className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">
            {NEXT_LINKS.map(({ href, icon: Icon, title, text }, index) => (
              <li key={href} className="grid">
                <Reveal delay={index * 0.06}>
                  <Link
                    href={href}
                    className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5 outline-none transition-all duration-200 hover:border-primary/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none"
                  >
                    <span
                      aria-hidden="true"
                      className="inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/20"
                    >
                      <Icon className="size-5" />
                    </span>
                    <span className="text-card-title text-foreground">
                      {title}
                    </span>
                    <span className="text-sm leading-relaxed text-muted-foreground">
                      {text}
                    </span>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-1 text-sm font-medium text-primary">
                      Open
                      <ArrowRight
                        aria-hidden="true"
                        className="size-4 transition-transform duration-200 group-hover:translate-x-1.5 motion-reduce:transition-none"
                      />
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </Section>

        {/* Closing CTA */}
        <Section className="bg-muted/40">
          <Reveal>
            <div className="relative isolate flex flex-col items-start gap-4 overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-10">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-20 -right-20 -z-10 size-64 rounded-full bg-primary/15 blur-3xl"
              />
              <h2 className="text-card-title text-foreground">
                Have a project in mind?
              </h2>
              <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
                Tell me what you want to build and where you are today, and we
                can talk through the next step.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/hire-me"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "group gap-2 motion-safe:active:scale-[0.98]",
                  )}
                >
                  Request a quote
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                  />
                </Link>
                <Link
                  href="/services"
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "group gap-2 motion-safe:active:scale-[0.98]",
                  )}
                >
                  Explore Services
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                  />
                </Link>
              </div>
            </div>
          </Reveal>
        </Section>
      </div>
    </>
  );
}
