import {
  ArrowRight,
  ArrowUp,
  Bot,
  Code2,
  Globe,
  Mail,
  PenTool,
  Rocket,
  SearchCheck,
  Workflow,
} from "lucide-react";

import { BriefHelper } from "@/components/contact/BriefHelper";
import { ContactForm } from "@/components/contact/ContactForm";
import { CopyEmailButton } from "@/components/contact/CopyEmailButton";
import { FaqAccordion } from "@/components/about/FaqAccordion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { Section } from "@/components/shared/Section";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Contact",
  description: "Send an enquiry to Zubair Developer.",
  alternates: { canonical: "/contact" },
};

const topics = [
  {
    icon: Globe,
    label: "Full stack web development",
    text: "Websites, web apps, dashboards, APIs and databases.",
  },
  {
    icon: Workflow,
    label: "SaaS solutions",
    text: "Accounts, subscriptions-ready architecture and scalable code.",
  },
  {
    icon: Bot,
    label: "AI chatbot automation",
    text: "Support, FAQ and lead capture bots connected to your tools.",
  },
];

const steps = [
  {
    icon: SearchCheck,
    title: "You send a message",
    text: "Describe your goal, who it is for and any deadline you have.",
  },
  {
    icon: PenTool,
    title: "I review it",
    text: "I read your message and may reply with a few clarifying questions.",
  },
  {
    icon: Code2,
    title: "We agree on a scope",
    text: "I suggest a scope and a way forward for you to review.",
  },
  {
    icon: Rocket,
    title: "We start building",
    text: "Once the plan is agreed, work begins in clear steps with updates.",
  },
];

const checklist = [
  "What problem you want to solve",
  "Who will use it",
  "Examples or links you like",
  "Your deadline and budget range, if you have one",
];

const faqs = [
  {
    question: "What kind of projects can I contact you about?",
    answer:
      "Full stack web applications, business websites, SaaS products and AI chatbot automation. If your idea is close to these, send a message and we can check the fit.",
  },
  {
    question: "What should I include in my message?",
    answer:
      "A short description of the goal, who will use it, any examples you like, and your deadline and budget range if you have one. Rough ideas are fine. The brief helper above has ready questions.",
  },
  {
    question: "Do I need a finished brief?",
    answer:
      "No. Many projects start as a rough idea. I can help you shape it into a clear scope.",
  },
  {
    question: "Can I just ask a question?",
    answer:
      "Yes. Questions about services, fit or the next step are welcome, even if you are not ready to start.",
  },
  {
    question: "Can I send files or links?",
    answer:
      "You can include links in your message. If you have documents or designs, mention them and we can arrange the best way to share them.",
  },
];

export default function ContactPage() {
  const email = siteConfig.contactEmail;

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Get in touch"
        description="Questions, ideas or a quick quote request."
      />

      {/* 1. Form: full width, alag section */}
      <Section className="w-full">
        <Reveal direction="up" className="min-w-0">
          <div
            id="contact-form"
            className="border-border bg-card flex w-full min-w-0 scroll-mt-24 flex-col gap-6 rounded-2xl border p-4 sm:p-6 lg:p-10"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex max-w-2xl flex-col gap-2">
                <h2 className="font-heading text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-tight text-balance">
                  Tell me about your project
                </h2>
                <p className="text-muted-foreground leading-7">
                  Share a few details and I will reply with clear next steps.
                </p>
              </div>
              <ul
                aria-label="Topics"
                className="flex flex-wrap gap-2 lg:max-w-md lg:justify-end"
              >
                {topics.map(({ label }) => (
                  <li
                    key={label}
                    className="border-border bg-background text-foreground/85 rounded-full border px-3 py-1 text-xs font-medium"
                  >
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-border w-full min-w-0 border-t pt-6">
              <ContactForm />
            </div>
          </div>
        </Reveal>
      </Section>

      {/* 2. Other ways to reach + what to include */}
      <Section className="bg-muted/40">
        <div className="flex max-w-2xl flex-col gap-3">
          <h2 className="text-section-title">Other ways to start</h2>
          <p className="text-muted-foreground leading-7">
            Prefer email, or want to prepare first? Both are fine.
          </p>
        </div>

        <div className="mt-6 grid gap-6 sm:mt-8 md:grid-cols-2">
          {email ? (
            <Reveal direction="up" className="min-w-0">
              <aside
                aria-label="Email"
                className="border-border bg-card flex h-full min-w-0 flex-col gap-4 rounded-2xl border p-5 sm:p-6"
              >
                <span
                  aria-hidden="true"
                  className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg"
                >
                  <Mail className="size-5" />
                </span>
                <div className="flex min-w-0 flex-col gap-1">
                  <h3 className="text-card-title">Prefer email?</h3>
                  <a
                    href={`mailto:${email}`}
                    className="focus-visible:ring-ring w-fit max-w-full rounded-sm break-all underline underline-offset-4 outline-none focus-visible:ring-2"
                  >
                    {email}
                  </a>
                </div>
                <div className="mt-auto flex flex-col gap-2 min-[420px]:flex-row min-[420px]:flex-wrap">
                  <CopyEmailButton email={email} />
                  <a
                    href={`mailto:${email}`}
                    className="group bg-primary text-primary-foreground focus-visible:ring-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 motion-safe:active:scale-[0.98]"
                  >
                    Open mail app
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
                    />
                  </a>
                </div>
              </aside>
            </Reveal>
          ) : null}

          <Reveal
            direction="up"
            className={`min-w-0 ${email ? "" : "md:col-span-2"}`}
          >
            <div className="border-border bg-card flex h-full flex-col gap-3 rounded-2xl border p-5 sm:p-6">
              <h3 className="text-card-title">What to include</h3>
              <ul className="flex flex-col gap-2.5">
                {checklist.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm">
                    <span
                      aria-hidden="true"
                      className="bg-primary mt-2 size-1.5 shrink-0 rounded-full"
                    />
                    <span className="text-foreground/85 leading-6">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* 3. Brief helper */}
      <Section>
        <div className="flex max-w-2xl flex-col gap-3">
          <h2 className="text-section-title">Not sure what to write?</h2>
          <p className="text-muted-foreground leading-7">
            Pick your project type, answer the questions that apply, then copy
            the template or open it in your mail app.
          </p>
        </div>
        <div className="mt-6 sm:mt-8">
          <Reveal direction="up" className="min-w-0">
            <BriefHelper email={email} />
          </Reveal>
        </div>
      </Section>

      {/* 4. What I can help with */}
      <Section className="bg-muted/40">
        <h2 className="text-section-title">What I can help with</h2>
        <ul className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 lg:grid-cols-3">
          {topics.map(({ icon: Icon, label, text }) => (
            <li key={label}>
              <Reveal direction="up" className="h-full">
                <div className="border-border bg-card hover:border-primary/40 flex h-full flex-col gap-3 rounded-2xl border p-5 transition-colors duration-200 sm:p-6 motion-reduce:transition-none">
                  <span
                    aria-hidden="true"
                    className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg"
                  >
                    <Icon className="size-5" />
                  </span>
                  <h3 className="text-card-title text-balance">{label}</h3>
                  <p className="text-muted-foreground leading-7">{text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      {/* 5. What happens next */}
      <Section>
        <div className="flex max-w-2xl flex-col gap-3">
          <h2 className="text-section-title">What happens next</h2>
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

      {/* 6. FAQ */}
      <Section className="bg-muted/40">
        <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-14">
          <div className="flex flex-col gap-3">
            <h2 className="text-section-title">Before you write</h2>
            <p className="text-muted-foreground leading-7">
              Quick answers to common questions.
            </p>
          </div>
          <Reveal direction="up" className="min-w-0">
            <FaqAccordion items={faqs} />
          </Reveal>
        </div>
      </Section>

      {/* 7. Final CTA */}
      <Section>
        <Reveal direction="up">
          <div className="bg-foreground text-background relative isolate overflow-hidden rounded-3xl p-6 sm:p-10">
            <div
              aria-hidden="true"
              className="bg-primary/30 pointer-events-none absolute -top-20 -right-20 -z-10 size-64 rounded-full blur-3xl"
            />
            <div className="flex max-w-2xl flex-col gap-3">
              <h2 className="font-heading text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.15] font-semibold tracking-tight text-balance">
                Ready to talk about your project?
              </h2>
              <p className="text-background/75 leading-7">
                A few lines are enough to start. I will take it from there.
              </p>
              <a
                href="#contact-form"
                className="group bg-primary text-primary-foreground focus-visible:ring-primary focus-visible:ring-offset-foreground mt-2 inline-flex min-h-11 w-fit items-center gap-2 rounded-lg px-5 text-sm font-medium outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 motion-safe:active:scale-[0.98]"
              >
                Back to the form
                <ArrowUp
                  aria-hidden="true"
                  className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 motion-reduce:transition-none"
                />
              </a>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
