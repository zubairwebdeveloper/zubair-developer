import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  FileText,
  GitBranch,
  LifeBuoy,
  Mail,
  MessageSquare,
  MessageCircle,
} from "lucide-react";

import { AboutCapabilities } from "@/components/about/AboutCapabilities";
import { AboutTechStack } from "@/components/about/AboutTechStack";
import { HeroWorkspace } from "@/components/about/HeroWorkspace";
import { ProjectFinder } from "@/components/about/ProjectFinder";
import { SkillsExplorer } from "@/components/about/SkillsExplorer";
import { TechMarquee } from "@/components/about/TechMarquee";
import { TypedRole } from "@/components/about/TypedRole";
import { BriefSection } from "@/components/home/BriefSection";
import { ExploreSite } from "@/components/home/ExploreSite";
import { FaqPreview } from "@/components/home/FaqPreview";
import { FeaturedProjects } from "@/components/home/FeaturedProjects";
import { FinalCTA } from "@/components/home/FinalCTA";
import { PricingPreview } from "@/components/home/PricingPreview";
import { ProcessSection } from "@/components/home/ProcessSection";
import { ServicesOverview } from "@/components/home/ServicesOverview";
import { Testimonials } from "@/components/home/Testimonials";
import { WorkPrinciples } from "@/components/home/WorkPrinciples";
import { CopyEmailButton } from "@/components/layout/CopyEmailButton";
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
  title: "Zubair Developer | Full Stack, SaaS and AI Chatbot Developer",
  description:
    "Full stack web developer building websites, SaaS applications and AI chatbot automation for businesses.",
  alternates: { canonical: "/" },
};

const DEFAULT_HEADLINE =
  "I build websites, web applications and AI automation that turn ideas into practical digital solutions.";

const ROLE_PHRASES = [
  "High-Performance Websites",
  "Full Stack Web Applications",
  "Scalable SaaS Platforms",
  "AI Chatbot Experiences",
  "Business Automation Systems",
  "Conversion-Focused Landing Pages",
];

// Sirf wohi likhein jo aap sach mein deliver karte hain. Ye aap ke
// existing messaging (written proposal, direct communication) par based hai.
const TRUST_POINTS = [
  {
    icon: FileText,
    title: "Written proposal first",
    text: "Scope, price and timeline are agreed in writing before work starts.",
  },
  {
    icon: MessageSquare,
    title: "You talk to the builder",
    text: "No account managers. Questions go straight to the person doing the work.",
  },
  {
    icon: GitBranch,
    title: "Delivered in stages",
    text: "You review progress as it is built, not only at the end.",
  },
  {
    icon: LifeBuoy,
    title: "Clean handover",
    text: "Maintainable code, and you know how everything works at delivery.",
  },
];

const chipClass =
  "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground focus-visible:ring-ring inline-flex min-h-10 shrink-0 items-center rounded-full border px-4 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none";

async function safe(promise, label) {
  try {
    return (await promise) ?? [];
  } catch (error) {
    console.error(`[home] failed to load ${label}:`, error);
    return [];
  }
}

function Anchor({ id, children }) {
  return (
    <div id={id} className="scroll-mt-28">
      {children}
    </div>
  );
}

export default async function HomePage() {
  const [skills, experience, settings] = await Promise.all([
    safe(getSkills(), "skills"),
    safe(getExperience(), "experience"),
    getSiteSettings().catch((error) => {
      console.error("[home] failed to load profile:", error);
      return null;
    }),
  ]);

  const { headline, bio, socials } = getPublicProfile(settings);
  const email = siteConfig.contactEmail ?? null;
  const availability =
    typeof siteConfig.availability === "string" &&
    siteConfig.availability.trim()
      ? siteConfig.availability.trim()
      : null;

  // WhatsApp sirf tab dikhta hai jab admin Profile mein diya ho
  const whatsapp = socials?.find((s) => s.id === "whatsapp")?.href ?? null;
  const quickContact = whatsapp ?? (email ? `mailto:${email}` : "/contact");
  const quickLabel = whatsapp ? "WhatsApp" : "Email";

  const grouped = skills.reduce((groups, skill) => {
    if (!skill?.name) return groups;
    (groups[skill.category || "Other"] ??= []).push(skill.name);
    return groups;
  }, {});
  const skillGroups = Object.entries(grouped).map(([category, names]) => ({
    category,
    names,
  }));
  const hasSkills = skillGroups.length > 0;
  const marqueeItems = [
    ...new Set(skills.map((skill) => skill?.name).filter(Boolean)),
  ].slice(0, 16);
  const hasExperience = experience.length > 0;

  const sections = [
    { href: "#fit", label: "Find your fit" },
    { href: "#focus", label: "What I build" },
    { href: "#projects", label: "Projects" },
    { href: "#toolbox", label: "Technologies" },
    ...(hasSkills ? [{ href: "#skills", label: "Skills" }] : []),
    ...(hasExperience ? [{ href: "#experience", label: "Experience" }] : []),
    { href: "#services", label: "Services" },
    { href: "#process", label: "Process" },
    { href: "#pricing", label: "Pricing" },
    { href: "#testimonials", label: "Testimonials" },
    { href: "#faq", label: "FAQ" },
    { href: "#contact", label: "Contact" },
  ];

  // Search engines ke liye structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteConfig.name,
    description: headline || DEFAULT_HEADLINE,
    ...(siteConfig.url ? { url: siteConfig.url } : {}),
    ...(email ? { email } : {}),
    sameAs: (socials ?? [])
      .map((s) => s.href)
      .filter((href) => /^https?:\/\//i.test(href)),
  };

  return (
    <div className="pb-20 md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* Hero */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <Reveal>
            <div className="flex max-w-xl flex-col items-start gap-5">
              {availability ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                  <span aria-hidden="true" className="relative flex size-2">
                    <span className="absolute inline-flex size-full rounded-full bg-emerald-500/60 motion-safe:animate-ping" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                  </span>
                  {availability}
                </span>
              ) : null}

              <h1 className="text-balance font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Turning business ideas into powerful digital products.
              </h1>

              <p className="flex min-h-14 flex-wrap items-baseline gap-x-3 font-heading text-xl font-medium text-foreground sm:min-h-0 sm:text-2xl">
                <span>I build</span>
                <TypedRole
                  phrases={ROLE_PHRASES}
                  label={`I build ${ROLE_PHRASES.join(", ")}.`}
                  className="text-primary"
                />
              </p>

              <p className="max-w-[60ch] text-pretty text-base leading-relaxed text-muted-foreground">
                {bio || headline || DEFAULT_HEADLINE}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/hire-me"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "group gap-2 motion-safe:active:scale-[0.98]",
                  )}
                >
                  Let&rsquo;s build your project
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                  />
                </Link>
                <Link
                  href="/projects"
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "motion-safe:active:scale-[0.98]",
                  )}
                >
                  Explore my work
                </Link>
                <a
                  href="#services"
                  className="inline-flex min-h-11 items-center rounded-sm px-1 text-sm font-medium text-muted-foreground underline underline-offset-4 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  How I can help
                </a>
              </div>

              {email || socials ? (
                <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-2">
                  {socials ? <SocialRow socials={socials} /> : null}
                  {email ? <CopyEmailButton email={email} /> : null}
                </div>
              ) : null}
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <HeroWorkspace />
          </Reveal>
        </div>
      </Section>

      <TechMarquee items={marqueeItems} />

      {/* Trust strip */}
      <section
        aria-label="How I work with clients"
        className="border-y border-border bg-muted/40"
      >
        <ul className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {TRUST_POINTS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/20"
              >
                <Icon className="size-5" />
              </span>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {text}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Sticky section nav */}
      <nav
        aria-label="On this page"
        className="sticky top-14 z-30 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70"
      >
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
          {sections.map((item) => (
            <a key={item.href} href={item.href} className={chipClass}>
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      {/* Find your fit */}
      <Section>
        <div id="fit" className="scroll-mt-28">
          <SectionHeading
            eyebrow="Find your fit"
            title="What do you need built?"
            description="Pick the closest match and see how I would approach it."
          />
          <div className="mt-10 sm:mt-12">
            <ProjectFinder />
          </div>
        </div>
      </Section>

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

      {/* Proof comes early: projects before tools */}
      <Anchor id="projects">
        <FeaturedProjects />
      </Anchor>

      <Section className="bg-muted/40">
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

      {hasSkills ? (
        <Section>
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

      {hasExperience ? (
        <Section className={hasSkills ? "bg-muted/40" : undefined}>
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
                  <article className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 transition-colors duration-200 hover:border-primary/40 motion-reduce:transition-none">
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
                  </article>
                </li>
              ))}
            </ol>
          </div>
        </Section>
      ) : null}

      <Anchor id="services">
        <ServicesOverview />
      </Anchor>
      <Anchor id="principles">
        <WorkPrinciples />
      </Anchor>
      <Anchor id="process">
        <ProcessSection />
      </Anchor>
      <Anchor id="pricing">
        <PricingPreview />
      </Anchor>
      <Anchor id="testimonials">
        <Testimonials />
      </Anchor>
      <Anchor id="brief">
        <BriefSection />
      </Anchor>
      <Anchor id="faq">
        <FaqPreview />
      </Anchor>
      <ExploreSite />
      <Anchor id="contact">
        <FinalCTA />
      </Anchor>

      {/* Mobile: hamesha nazar aane wali CTA bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md gap-2">
          <Link
            href="/hire-me"
            className={cn(buttonVariants({ size: "lg" }), "flex-1 gap-2")}
          >
            Request a quote
          </Link>
          <a
            href={quickContact}
            {...(whatsapp
              ? { target: "_blank", rel: "noopener noreferrer" }
              : null)}
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "gap-2",
            )}
          >
            {whatsapp ? (
              <MessageCircle aria-hidden="true" className="size-4" />
            ) : (
              <Mail aria-hidden="true" className="size-4" />
            )}
            {quickLabel}
          </a>
        </div>
      </div>
    </div>
  );
}
