import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowRight, FiCheck } from "react-icons/fi";

import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { Section } from "@/components/shared/Section";
import { buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils/format";
import { getServiceBySlug, getServices } from "@/services/services.service";

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return {};

  return {
    title: service.title,
    description: service.summary,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: { title: service.title, description: service.summary },
  };
}

function SectionTitle({ id, number, children }) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="text-metric inline-flex h-9 min-w-11 items-center justify-center rounded-lg bg-primary/10 px-2.5 text-sm text-brand ring-1 ring-inset ring-primary/20"
      >
        {String(number).padStart(2, "0")}
      </span>
      <h2 id={id} className="text-card-title text-foreground">
        {children}
      </h2>
    </div>
  );
}

const QUICK_BENEFITS = [
  "Clear project scope before build starts",
  "Responsive builds with a realistic delivery plan",
  "Support after launch for updates and maintenance",
];

export default async function ServiceDetailPage({ params }) {
  const { slug } = await params;
  const [service, allServices] = await Promise.all([
    getServiceBySlug(slug),
    getServices(),
  ]);
  if (!service) notFound();

  const deliverables = Array.isArray(service.deliverables)
    ? service.deliverables.filter(Boolean)
    : [];

  const others = (Array.isArray(allServices) ? allServices : [])
    .filter((item) => item.slug !== service.slug)
    .slice(0, 3);

  const quoteHref = `/hire-me?service=${service.category}`;

  let sectionNumber = 0;

  return (
    <>
      <PageHeader
        eyebrow="Service"
        title={service.title}
        description={service.summary}
      />

      <Section className="pt-0">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card/80 p-5 shadow-soft sm:p-7">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-grid-subtle opacity-60"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 top-0 h-44 w-44 rounded-full bg-primary/10 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-violet/10 blur-3xl"
            />

            <div className="relative grid gap-4 md:grid-cols-3">
              {QUICK_BENEFITS.map((benefit) => (
                <div
                  key={benefit}
                  className="rounded-2xl border border-border bg-background/70 p-4 text-sm leading-relaxed text-muted-foreground shadow-sm transition-transform duration-300 motion-safe:hover:-translate-y-1"
                >
                  {benefit}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-14">
          <div className="flex min-w-0 flex-col gap-12 sm:gap-14">
            {service.problem ? (
              <section
                aria-labelledby="service-problem"
                className="scroll-mt-28"
              >
                <Reveal>
                  <div className="flex flex-col gap-4">
                    <SectionTitle id="service-problem" number={++sectionNumber}>
                      The problem
                    </SectionTitle>
                    <p className="max-w-prose whitespace-pre-line text-base leading-relaxed text-muted-foreground">
                      {service.problem}
                    </p>
                  </div>
                </Reveal>
              </section>
            ) : null}

            {service.description || deliverables.length > 0 ? (
              <section
                aria-labelledby="service-deliverables"
                className="scroll-mt-28"
              >
                <Reveal>
                  <div className="flex flex-col gap-5">
                    <SectionTitle
                      id="service-deliverables"
                      number={++sectionNumber}
                    >
                      What you get
                    </SectionTitle>

                    {service.description ? (
                      <p className="max-w-prose whitespace-pre-line text-base leading-relaxed text-muted-foreground">
                        {service.description}
                      </p>
                    ) : null}

                    {deliverables.length > 0 ? (
                      <ul className="grid gap-3 sm:grid-cols-2">
                        {deliverables.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-foreground transition-colors duration-200 hover:border-primary/40"
                          >
                            <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-success/10">
                              <FiCheck
                                aria-hidden="true"
                                className="size-3 text-success"
                              />
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </Reveal>
              </section>
            ) : null}

            <Reveal>
              <div className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-muted/40 p-6 shadow-sm sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Delivery
                </p>
                <h2 className="text-card-title text-foreground">
                  Want to know how the work is organised?
                </h2>
                <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
                  The process page walks through each stage of a project, from
                  the first conversation to handover.
                </p>
                <Link
                  href="/process"
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  See how a project works
                  <FiArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </div>
            </Reveal>
          </div>

          <aside
            aria-label="Pricing and quote"
            className="relative flex h-fit flex-col gap-4 overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-24"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-3xl"
            />
            <div className="relative flex flex-col gap-4">
              <p className="text-label text-muted-foreground">Starting at</p>
              <p className="text-metric text-3xl text-foreground">
                {formatPrice({
                  price: service.startingPrice,
                  currency: service.currency,
                  isStartingPrice: true,
                })}
              </p>
              {service.engagement ? (
                <p className="border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
                  {service.engagement}
                </p>
              ) : null}
              <Link
                href={quoteHref}
                className={`${buttonVariants({ size: "lg" })} motion-safe:active:scale-[0.98]`}
              >
                Request a quote
              </Link>
              <Link
                href="/contact"
                className="inline-flex min-h-11 items-center justify-center rounded-xl text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Or discuss your project first
              </Link>
            </div>
          </aside>
        </div>
      </Section>

      {others.length > 0 ? (
        <Section className="bg-muted/40">
          <Reveal>
            <h2 className="text-section-title">Other services</h2>
          </Reveal>
          <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {others.map((item, index) => (
              <li key={item.slug} className="grid">
                <Reveal delay={index * 0.06}>
                  <article className="group relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-md focus-within:ring-2 focus-within:ring-ring motion-safe:hover:-translate-y-0.5">
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-primary/8 blur-2xl transition-transform duration-300 motion-safe:group-hover:scale-125"
                    />
                    <h3 className="relative text-card-title text-foreground">
                      <Link
                        href={`/services/${item.slug}`}
                        className="focus-visible:outline-none after:absolute after:inset-0 after:content-['']"
                      >
                        {item.title}
                      </Link>
                    </h3>
                    {item.summary ? (
                      <p className="relative line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                        {item.summary}
                      </p>
                    ) : null}
                    <p className="relative mt-auto pt-2 text-sm font-medium text-brand">
                      {formatPrice({
                        price: item.startingPrice,
                        currency: item.currency,
                        isStartingPrice: true,
                      })}
                    </p>
                  </article>
                </Reveal>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  );
}
