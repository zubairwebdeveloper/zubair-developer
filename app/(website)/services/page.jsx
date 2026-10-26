import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

import { ProcessSection } from "@/components/home/ProcessSection";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ServicesExplorer } from "@/components/services/ServicesExplorer";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { Section } from "@/components/shared/Section";
import { buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils/format";
import { getServices } from "@/services/services.service";

export const metadata = {
  title: "Services",
  description:
    "Web development, SaaS applications, chatbot automation and website AI assistants.",
  alternates: { canonical: "/services" },
};

// Editable content: adjust these answers so they match how you actually work.
const FAQ_ITEMS = [
  {
    question: "How do I choose the right service?",
    answer:
      "Start with the problem you want to solve. Each service page explains the problem it addresses and what you get. If two seem to fit, describe your project and we can decide together.",
  },
  {
    question: "Can I combine more than one service?",
    answer:
      "Yes, many projects need more than one. Mention everything you have in mind when you request a quote so the scope can be discussed as a whole.",
  },
  {
    question: "What does 'Starting at' mean?",
    answer:
      "It is the starting point for that service. The final scope and cost depend on your requirements, which is why the next step is a quote.",
  },
  {
    question: "What should I include in a quote request?",
    answer:
      "A short description of what you want to build, who will use it, and any existing systems or content involved. Rough notes are fine.",
  },
];

function prettyLabel(value) {
  return String(value)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default async function ServicesPage() {
  const rawServices = await getServices();
  const services = Array.isArray(rawServices) ? rawServices : [];

  // Server-rendered cards are passed to the client filter as elements,
  // so ServiceCard itself stays a server component.
  const items = services.map((service) => ({
    slug: service.slug,
    category: service.category ?? null,
    node: <ServiceCard service={service} />,
  }));

  const categories = [
    ...new Set(services.map((service) => service.category).filter(Boolean)),
  ].map((id) => ({ id, label: prettyLabel(id) }));

  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="What I can build for your business"
        description="Web development and AI-powered automation with clear deliverables."
      />

      <Section>
        <ServicesExplorer items={items} categories={categories} />
      </Section>

      {services.length > 1 ? (
        <Section className="bg-muted/40">
          <Reveal>
            <div className="flex flex-col gap-2">
              <h2 className="text-section-title">Compare services</h2>
              <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
                Starting prices and engagement type side by side.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <div
              role="region"
              aria-label="Services comparison table, scrollable"
              tabIndex={0}
              className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
                <caption className="sr-only">
                  Comparison of services by starting price and engagement
                </caption>
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th
                      scope="col"
                      className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      Service
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      Starting at
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      Engagement
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      <span className="sr-only">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr
                      key={service.slug}
                      className="border-b border-border last:border-0 transition-colors duration-200 hover:bg-muted/40"
                    >
                      <th scope="row" className="px-5 py-4 font-medium">
                        <Link
                          href={`/services/${service.slug}`}
                          className="rounded text-foreground hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {service.title}
                        </Link>
                      </th>
                      <td className="text-metric px-5 py-4 text-foreground">
                        {formatPrice({
                          price: service.startingPrice,
                          currency: service.currency,
                          isStartingPrice: true,
                        })}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {service.engagement || "—"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/hire-me?service=${service.category}`}
                          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg text-sm font-medium text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Request a quote
                          <span className="sr-only"> for {service.title}</span>
                          <FiArrowRight aria-hidden="true" className="size-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </Section>
      ) : null}

      <ProcessSection />

      <Section className="bg-muted/40">
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-12">
            <div className="flex flex-col items-start gap-4">
              <h2 className="text-section-title">Common questions</h2>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                Short answers about choosing a service and getting a quote.
              </p>
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

      <Section>
        <Reveal>
          <div className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h2 className="text-card-title text-foreground">
              Not sure which service fits?
            </h2>
            <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
              Tell me what you want to build and where you are today, and we can
              talk through the best next step. You can also look at past work
              first.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className={`${buttonVariants({ size: "lg" })} motion-safe:active:scale-[0.98]`}
              >
                Discuss Your Project
              </Link>
              <Link
                href="/projects"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-5 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-safe:active:scale-[0.98]"
              >
                View Projects
                <FiArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
