import Link from "next/link";
import { ArrowRight, Quote, Sparkles, Star } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { Section } from "@/components/shared/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { EmptyState } from "@/components/shared/EmptyState";
import { TestimonialsFilterPanel } from "@/components/testimonials/TestimonialsFilterPanel";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { getTestimonials } from "@/services/content.service";

export const revalidate = 60;

export const metadata = {
  title: "Testimonials",
  description:
    "Read client feedback about working with Zubair Developer on website, SaaS, chatbot, and automation projects.",
  alternates: { canonical: "/testimonials" },
};

function getInitials(name = "") {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function toSafeTestimonials(items) {
  if (!Array.isArray(items)) return [];

  return items
    .filter((item) => typeof item?.quote === "string" && item.quote.trim())
    .map((item) => ({
      ...item,
      quote: item.quote.trim(),
      authorName: typeof item?.authorName === "string" ? item.authorName.trim() : "",
      authorRole: typeof item?.authorRole === "string" ? item.authorRole.trim() : "",
      company: typeof item?.company === "string" ? item.company.trim() : "",
      projectCategory:
        typeof item?.projectCategory === "string" ? item.projectCategory.trim() : "",
      rating: Number(item?.rating),
    }));
}

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials().catch((error) => {
    console.error("[testimonials page] failed to load testimonials:", error);
    return [];
  });

  const items = toSafeTestimonials(testimonials);
  const featured = items.find((item) => Boolean(item.featured));

  const companyCount = new Set(
    items
      .map((item) => item.company)
      .filter(Boolean),
  ).size;

  const ratings = items
    .map((item) => Number(item.rating))
    .filter((value) => Number.isFinite(value) && value >= 1 && value <= 5);

  const averageRating = ratings.length
    ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length
    : null;

  const trustStats = [
    {
      label: "Published feedback",
      value: items.length,
      description: "Real experiences shared by clients and collaborators.",
    },
    ...(companyCount > 0
      ? [
          {
            label: "Companies represented",
            value: companyCount,
            description: "A broader view across different business contexts.",
          },
        ]
      : []),
    ...(averageRating !== null
      ? [
          {
            label: "Average rating",
            value: `${averageRating.toFixed(1)}/5`,
            description: "Based on available client ratings.",
          },
        ]
      : []),
  ];

  return (
    <>
      <PageHeader
        eyebrow="Client feedback"
        title="Real Feedback. Meaningful Partnerships."
        description="Discover what clients and collaborators say about working with Zubair Developer to build modern websites, intelligent chatbots, and practical business automation solutions."
        action={{ label: "Start a Project", href: "/hire-me" }}
        secondaryAction={{ label: "Explore Services", href: "/services" }}
      />

      {trustStats.length > 0 ? (
        <Section className="pt-10 md:pt-12">
          <div className="grid gap-4 md:grid-cols-3">
            {trustStats.map((stat) => (
              <Reveal key={stat.label} className="h-full">
                <div className="flex h-full flex-col gap-3 rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-6">
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    {stat.value}
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      ) : null}

      {featured ? (
        <Section className="pt-0">
          <div className="rounded-[28px] border border-border/80 bg-card p-6 shadow-[0_28px_70px_rgba(15,23,42,0.05)] sm:p-8 lg:p-10">
            <div className="flex flex-col gap-3">
              <p className="text-eyebrow text-brand">Featured feedback</p>
              <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
                <div className="space-y-5">
                  <div className="flex items-center gap-3 text-primary">
                    <span className="inline-flex rounded-full border border-primary/20 bg-primary/5 p-2">
                      <Quote className="size-5" />
                    </span>
                    <span className="text-sm font-medium uppercase tracking-[0.22em]">
                      Featured testimonial
                    </span>
                  </div>

                  <blockquote className="text-xl leading-relaxed text-foreground/90 sm:text-2xl">
                    “{featured.quote}”
                  </blockquote>
                </div>

                <div className="rounded-2xl border border-border bg-muted/35 p-5">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary ring-1 ring-inset ring-primary/20">
                      {getInitials(featured.authorName || "Client")}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-foreground">
                        {featured.authorName || "Client"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {[featured.authorRole, featured.company].filter(Boolean).join(" • ") || "Client"}
                      </p>
                    </div>
                  </div>

                  {featured.projectCategory ? (
                    <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      <Sparkles className="size-3.5 text-primary" />
                      {featured.projectCategory}
                    </div>
                  ) : null}

                  {Number.isFinite(Number(featured.rating)) && Number(featured.rating) >= 1 && Number(featured.rating) <= 5 ? (
                    <div className="mt-5 flex items-center gap-2 text-amber-600">
                      <Star className="size-4 fill-current" />
                      <span className="text-sm font-medium">{Number(featured.rating).toFixed(1)} / 5</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </Section>
      ) : (
        <Section className="pt-0">
          <div className="rounded-[28px] border border-border/80 bg-card p-6 sm:p-8">
            <SectionHeading
              eyebrow="Featured feedback"
              title="Every relationship starts with a straightforward conversation."
              description="The right project process, clear communication, and thoughtful execution make the experience easier at every step."
            />
          </div>
        </Section>
      )}

      <Section className="pt-0">
        <SectionHeading
          eyebrow="Testimonial collection"
          title="A collection of honest feedback"
          description="Browse experiences from clients and collaborators who needed practical, high-quality digital solutions."
        />

        {items.length > 0 ? (
          <div className="mt-8">
            <TestimonialsFilterPanel items={items} />
          </div>
        ) : (
          <EmptyState
            className="mt-8"
            title="No published testimonials yet"
            description="There are no published client testimonials available right now. Once a collaboration is complete, genuine feedback can be added from the admin panel."
            action={{ label: "Start a project", href: "/hire-me" }}
          />
        )}
      </Section>

      <Section className="pt-0">
        <div className="rounded-[28px] border border-border/80 bg-card p-6 shadow-sm sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-eyebrow text-brand">Have We Worked Together?</p>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Have We Worked Together?
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                Your feedback helps me improve my work and helps future clients understand what collaboration looks like.
              </p>
            </div>

            <div className="flex justify-start lg:justify-end">
              <Link
                href="/hire-me"
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "group gap-2",
                )}
              >
                Share your project goals
                <ArrowRight className="size-4 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <Section className="bg-muted/30 py-16 md:py-20">
        <div className="rounded-[28px] border border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card p-6 shadow-[0_24px_60px_rgba(15,23,42,0.04)] sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-eyebrow text-brand">Ready to build</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Let&apos;s Build Something Worth Talking About.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Have a website, chatbot, or automation idea? Let&apos;s discuss your goals and find a practical solution.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/hire-me"
                className={cn(buttonVariants({ variant: "default", size: "lg" }), "gap-2")}
              >
                Discuss Your Project
              </Link>
              <Link
                href="/services"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2")}
              >
                Explore My Services
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
