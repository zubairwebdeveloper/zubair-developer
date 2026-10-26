import Link from "next/link";
import {
  ArrowRight,
  Bot,
  ClipboardList,
  FileText,
  Globe,
  Mail,
  MessageSquareText,
  PenTool,
  Rocket,
  SearchCheck,
  Target,
  Workflow,
} from "lucide-react";

import { FaqAccordion } from "@/components/about/FaqAccordion";
import { CopyEmailButton } from "@/components/contact/CopyEmailButton";
import { ProjectBriefForm } from "@/components/forms/ProjectBriefForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { Section } from "@/components/shared/Section";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Start a Project",
  description: "Share your project brief, budget and timeline.",
  alternates: { canonical: "/hire-me" },
};

const services = [
  {
    icon: Globe,
    title: "Full stack web development",
    text: "Websites, web apps, dashboards, APIs and databases.",
  },
  {
    icon: Workflow,
    title: "SaaS solutions",
    text: "Accounts, subscription-ready architecture and scalable code.",
  },
  {
    icon: Bot,
    title: "AI chatbot automation",
    text: "Support, FAQ and lead capture bots connected to your tools.",
  },
];

const prepare = [
  { icon: Target, text: "The main goal of the project" },
  {
    icon: ClipboardList,
    text: "Who will use it and what they should be able to do",
  },
  { icon: FileText, text: "Examples, links or designs you like" },
  {
    icon: MessageSquareText,
    text: "Your deadline and budget range, if you have one",
  },
];

const steps = [
  {
    icon: SearchCheck,
    title: "You send your brief",
    text: "Share your goal, scope, budget and timeline using the form.",
  },
  {
    icon: PenTool,
    title: "I review it",
    text: "I read your brief and may ask a few clarifying questions.",
  },
  {
    icon: ClipboardList,
    title: "We agree on a scope",
    text: "I suggest a scope and a way forward for you to review.",
  },
  {
    icon: Rocket,
    title: "Work begins",
    text: "Once the plan is agreed, I build in clear steps with updates.",
  },
];

const faqs = [
  {
    question: "Do I need a finished brief?",
    answer:
      "No. A rough idea is enough to start. The form asks for the key details, and we can shape the rest together.",
  },
  {
    question: "What if I do not know my budget or timeline yet?",
    answer:
      "Share what you know. If you are unsure, say so in the brief and we can talk through the options.",
  },
  {
    question: "What happens after I submit the form?",
    answer:
      "I review your brief and reply with questions or a suggested next step. Nothing is committed by sending a brief.",
  },
  {
    question: "Can I ask a question before sending a brief?",
    answer:
      "Yes. Use the contact page or email me. Questions about fit, services or process are welcome.",
  },
];

/** URL se aaya value safe label banata hai (React text ko khud escape karta hai). */
function toLabel(value) {
  if (typeof value !== "string") return "";
  return value.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
}

export default async function HireMePage({ searchParams }) {
  const { service = "", plan = "" } = await searchParams;
  const email = siteConfig.contactEmail;

  const serviceValue = typeof service === "string" ? service : "";
  const planValue = typeof plan === "string" ? plan : "";
  const serviceLabel = toLabel(serviceValue);
  const planLabel = toLabel(planValue);
  const selection = [
    serviceLabel && { label: "Service", value: serviceLabel },
    planLabel && { label: "Plan", value: planLabel },
  ].filter(Boolean);

  return (
    <>
      <PageHeader
        eyebrow="Start a project"
        title="Tell me about your project"
        description="The more detail you share, the more useful my reply will be."
      />

      {/* 1. Form + sidebar */}
      <Section>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
          <Reveal direction="up" className="min-w-0">
            <div
              id="brief-form"
              className="border-border bg-card flex min-w-0 scroll-mt-24 flex-col gap-6 rounded-2xl border p-4 sm:p-6 lg:p-8"
            >
              <div className="flex flex-col gap-2">
                <h2 className="font-heading text-[clamp(1.4rem,3vw,1.75rem)] font-semibold tracking-tight text-balance">
                  Project brief
                </h2>
                <p className="text-muted-foreground leading-7">
                  Fill in what you can. Rough answers are fine.
                </p>
              </div>

              {selection.length > 0 ? (
                <dl
                  aria-label="Your selection"
                  className="border-border bg-muted/40 grid gap-4 rounded-xl border p-4 text-sm sm:grid-cols-2"
                >
                  {selection.map((item) => (
                    <div
                      key={item.label}
                      className="flex min-w-0 flex-col gap-1"
                    >
                      <dt className="text-muted-foreground text-xs">
                        {item.label}
                      </dt>
                      <dd className="font-medium capitalize break-words">
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              <div className="border-border min-w-0 border-t pt-6">
                <ProjectBriefForm
                  defaultService={serviceValue}
                  defaultPlan={planValue}
                />
              </div>
            </div>
          </Reveal>

          <aside
            aria-label="Before you send"
            className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-24 lg:self-start"
          >
            <Reveal direction="up" className="min-w-0">
              <div className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-5 sm:p-6">
                <h2 className="text-card-title">Helpful to have ready</h2>
                <ul className="flex flex-col gap-3">
                  {prepare.map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-start gap-3 text-sm">
                      <span
                        aria-hidden="true"
                        className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg"
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="text-foreground/85 pt-1 leading-6">
                        {text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {email ? (
              <Reveal direction="up" className="min-w-0">
                <div className="border-border bg-muted/40 flex min-w-0 flex-col gap-3 rounded-2xl border p-5 sm:p-6">
                  <span
                    aria-hidden="true"
                    className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg"
                  >
                    <Mail className="size-5" />
                  </span>
                  <h2 className="text-card-title">Prefer email?</h2>
                  <a
                    href={`mailto:${email}`}
                    className="focus-visible:ring-ring w-fit max-w-full rounded-sm text-sm break-all underline underline-offset-4 outline-none focus-visible:ring-2"
                  >
                    {email}
                  </a>
                  <div>
                    <CopyEmailButton email={email} />
                  </div>
                </div>
              </Reveal>
            ) : null}
          </aside>
        </div>
      </Section>

      {/* 2. Services */}
      <Section className="bg-muted/40">
        <div className="flex max-w-2xl flex-col gap-3">
          <h2 className="text-section-title">What I can build for you</h2>
          <p className="text-muted-foreground leading-7">
            Not sure which fits? Describe your problem in the brief and I will
            suggest an approach.
          </p>
        </div>
        <ul className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 lg:grid-cols-3">
          {services.map(({ icon: Icon, title, text }) => (
            <li key={title}>
              <Reveal direction="up" className="h-full">
                <div className="border-border bg-card hover:border-primary/40 flex h-full flex-col gap-3 rounded-2xl border p-5 transition-colors duration-200 sm:p-6 motion-reduce:transition-none">
                  <span
                    aria-hidden="true"
                    className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg"
                  >
                    <Icon className="size-5" />
                  </span>
                  <h3 className="text-card-title text-balance">{title}</h3>
                  <p className="text-muted-foreground leading-7">{text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      {/* 3. Process */}
      <Section>
        <div className="flex max-w-2xl flex-col gap-3">
          <h2 className="text-section-title">What happens after you send it</h2>
          <p className="text-muted-foreground leading-7">
            A simple process so you always know the next step.
          </p>
        </div>
        <ol className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <li key={title}>
              <Reveal direction="up" className="h-full">
                <div className="border-border bg-card h-full rounded-2xl border p-5 sm:p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span
                      aria-hidden="true"
                      className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg"
                    >
                      <Icon className="size-5" />
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-muted-foreground/60 font-heading text-2xl font-semibold tabular-nums"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-card-title">
                    <span className="sr-only">Step {index + 1}: </span>
                    {title}
                  </h3>
                  <p className="text-muted-foreground mt-2 leading-7">{text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </Section>

      {/* 4. FAQ */}
      <Section className="bg-muted/40">
        <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-14">
          <div className="flex flex-col gap-3">
            <h2 className="text-section-title">Before you send</h2>
            <p className="text-muted-foreground leading-7">
              Quick answers to common questions.
            </p>
            <Link
              href="/faq"
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring w-fit rounded-sm text-sm underline underline-offset-4 outline-none focus-visible:ring-2"
            >
              See all FAQs
            </Link>
          </div>
          <Reveal direction="up" className="min-w-0">
            <FaqAccordion items={faqs} />
          </Reveal>
        </div>
      </Section>

      {/* 5. CTA */}
      <Section>
        <Reveal direction="up">
          <div className="bg-foreground text-background relative isolate overflow-hidden rounded-3xl p-6 sm:p-10">
            <div
              aria-hidden="true"
              className="bg-primary/30 pointer-events-none absolute -top-20 -right-20 -z-10 size-64 rounded-full blur-3xl"
            />
            <div className="flex max-w-2xl flex-col gap-3">
              <h2 className="font-heading text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.15] font-semibold tracking-tight text-balance">
                Ready to share your idea?
              </h2>
              <p className="text-background/75 leading-7">
                A few lines are enough to start. I will take it from there.
              </p>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href="#brief-form"
                  className="group bg-primary text-primary-foreground focus-visible:ring-primary focus-visible:ring-offset-foreground inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-medium outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 motion-safe:active:scale-[0.98]"
                >
                  Back to the brief
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 -rotate-90 transition-transform duration-200 group-hover:-translate-y-0.5 motion-reduce:transition-none"
                  />
                </a>
                <Link
                  href="/contact"
                  className="border-background/25 hover:bg-background/10 focus-visible:ring-primary focus-visible:ring-offset-foreground inline-flex min-h-11 items-center justify-center rounded-lg border px-5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none"
                >
                  Just ask a question
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
