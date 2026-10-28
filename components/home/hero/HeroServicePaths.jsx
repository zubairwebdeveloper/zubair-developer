import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export function HeroServicePaths({ paths = [] }) {
  return (
    <div className="grid w-full gap-3 sm:grid-cols-2">
      {paths.map((path) => (
        <article
          key={path.id}
          className="group relative min-w-0 rounded-2xl border border-border/80 bg-card/80 p-4 shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-ring motion-reduce:transform-none motion-reduce:transition-none"
        >
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-heading text-base font-semibold tracking-tight text-foreground sm:text-lg">
              {path.title}
            </h2>
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary sm:text-xs">
              {path.priceLabel}
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {path.outcome}
          </p>
          <ul
            aria-label={`${path.title} includes`}
            className="mt-3 flex flex-wrap gap-1.5"
          >
            {path.chips.map((chip) => (
              <li
                key={chip}
                className="rounded-full border border-border/80 bg-background/70 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {chip}
              </li>
            ))}
          </ul>
          <Link
            href={path.href}
            aria-label={`Explore ${path.title} services`}
            className={cn(
              buttonVariants({ variant: "link", size: "sm" }),
              "focus-ring mt-2 h-auto min-h-11 justify-start gap-1 px-0 text-sm",
              "after:absolute after:inset-0 after:content-['']",
            )}
          >
            Explore {path.title} services
            <ArrowUpRight
              aria-hidden="true"
              className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
            />
          </Link>
        </article>
      ))}
    </div>
  );
}
