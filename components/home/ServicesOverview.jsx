// components/home/ServicesOverview.jsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/shared/Reveal";
import { Section } from "@/components/shared/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ServiceCard } from "@/components/services/ServiceCard";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getServices } from "@/services/services.service";

export async function ServicesOverview() {
  const services = await getServices();
  const hasServices = Array.isArray(services) && services.length > 0;

  return (
    <Section id="services" className="relative isolate overflow-hidden">
      {/* Decorative accent glow (non-interactive) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-24 left-1/2 h-72 w-[min(56rem,90vw)] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <SectionHeading
        eyebrow="Services"
        title="Web development and automation, built for real businesses"
        description="Two focused offerings, each with clear deliverables and a transparent starting point."
      />

      {hasServices ? (
        <ul className="mt-10 grid gap-5 sm:mt-12 md:grid-cols-2 md:gap-6">
          {services.map((service, index) => (
            <li
              key={service.slug ?? service.title}
              className="grid [&>*]:h-full"
            >
              <Reveal delay={index * 0.06}>
                <ServiceCard service={service} />
              </Reveal>
            </li>
          ))}
        </ul>
      ) : (
        <div
          role="status"
          className="mx-auto mt-10 flex max-w-xl flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center"
        >
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Services are being updated
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The service details are not available right now. Tell me what you
            need and I will reply with a clear plan and quote.
          </p>
          <Link href="/hire-me" className={buttonVariants({ size: "lg" })}>
            Discuss your project
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      )}

      {hasServices ? (
        <Reveal delay={0.12}>
          <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-border/70 bg-muted/40 p-5 sm:mt-10 sm:flex-row sm:items-center sm:p-6">
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Not sure which service fits? Describe your project and I will
              suggest the right starting point.
            </p>
            <Link
              href="/hire-me"
              className={cn(
                buttonVariants({ size: "lg" }),
                "group w-full shrink-0 sm:w-auto",
              )}
            >
              Discuss your project
              <ArrowRight
                className="size-4 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </Reveal>
      ) : null}
    </Section>
  );
}
