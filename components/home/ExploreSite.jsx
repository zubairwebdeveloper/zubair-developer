import Link from "next/link";
import {
  FiArrowRight,
  FiBookOpen,
  FiFolder,
  FiGitBranch,
  FiHelpCircle,
  FiLayers,
  FiSend,
  FiTag,
  FiUser,
} from "react-icons/fi";

import { Reveal } from "@/components/shared/Reveal";
import { Section } from "@/components/shared/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";

const LINKS = [
  {
    href: "/about",
    icon: FiUser,
    title: "About",
    description: "Who is behind Zubair Developer.",
  },
  {
    href: "/services",
    icon: FiLayers,
    title: "Services",
    description: "What can be built, with clear deliverables.",
  },
  {
    href: "/projects",
    icon: FiFolder,
    title: "Projects",
    description: "Case studies: the problem, the solution, the outcome.",
  },
  {
    href: "/process",
    icon: FiGitBranch,
    title: "Process",
    description: "How a project goes from discovery to delivery.",
  },
  {
    href: "/pricing",
    icon: FiTag,
    title: "Pricing",
    description: "Starting prices for each service.",
  },
  {
    href: "/blog",
    icon: FiBookOpen,
    title: "Blog",
    description: "Articles and notes.",
  },
  {
    href: "/faq",
    icon: FiHelpCircle,
    title: "FAQ",
    description: "Answers to common questions.",
  },
  {
    href: "/hire-me",
    icon: FiSend,
    title: "Request a quote",
    description: "Tell me about your project.",
  },
];

export function ExploreSite() {
  return (
    <Section className="bg-muted/40">
      <SectionHeading
        eyebrow="Explore"
        title="Find what you need"
        description="Everything on this site, one click away."
      />

      <ul className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">
        {LINKS.map((item, index) => {
          const Icon = item.icon;
          return (
            <li key={item.href} className="grid">
              <Reveal delay={Math.min(index * 0.04, 0.24)}>
                <article className="group relative flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-md focus-within:ring-2 focus-within:ring-ring motion-safe:hover:-translate-y-0.5">
                  <span
                    aria-hidden="true"
                    className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-brand ring-1 ring-inset ring-primary/20"
                  >
                    <Icon className="size-5" />
                  </span>
                  <h3 className="text-card-title text-foreground">
                    {/* Stretched link: whole card clickable, one tab stop. */}
                    <Link
                      href={item.href}
                      className="focus-visible:outline-none after:absolute after:inset-0 after:content-['']"
                    >
                      {item.title}
                    </Link>
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                  <FiArrowRight
                    aria-hidden="true"
                    className="mt-auto size-4 text-brand transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </article>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
