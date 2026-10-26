// components/home/Testimonials.jsx
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";

import { Reveal } from "@/components/shared/Reveal";
import { Section } from "@/components/shared/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getTestimonials } from "@/services/content.service";

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export async function Testimonials() {
  const items = ((await getTestimonials()) ?? []).slice(0, 6);
  if (items.length === 0) return null;

  return (
    <Section className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -bottom-24 left-1/2 h-64 w-[min(52rem,90vw)] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <SectionHeading eyebrow="Testimonials" title="What clients say" />

      <ul className="mt-10 grid gap-5 sm:mt-12 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {items.map((item, index) => {
          const meta = [item.authorRole, item.company]
            .filter(Boolean)
            .join(", ");

          return (
            <li
              key={item.id ?? `${item.authorName}-${index}`}
              className="grid [&>*]:h-full"
            >
              <Reveal delay={index * 0.06}>
                <figure className="group relative flex h-full flex-col gap-5 overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/40 hover:shadow-md motion-safe:hover:-translate-y-0.5 sm:p-7">
                  <Quote
                    className="size-7 text-primary/70 transition-colors duration-200 group-hover:text-primary"
                    aria-hidden="true"
                  />

                  <blockquote className="text-base leading-relaxed text-foreground/90">
                    <p>{item.quote}</p>
                  </blockquote>

                  <figcaption className="mt-auto flex items-center gap-3 border-t border-border/70 pt-5">
                    <span
                      aria-hidden="true"
                      className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary ring-1 ring-inset ring-primary/20"
                    >
                      {getInitials(item.authorName)}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-semibold text-foreground">
                        {item.authorName}
                      </span>
                      {meta ? (
                        <span className="truncate text-sm text-muted-foreground">
                          {meta}
                        </span>
                      ) : null}
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          );
        })}
      </ul>

      <Reveal delay={0.1}>
        <div className="mt-10 flex justify-center">
          <Link
            href="/hire-me"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "group",
            )}
          >
            Start your project
            <ArrowRight
              className="size-4 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </Reveal>
    </Section>
  );
}
