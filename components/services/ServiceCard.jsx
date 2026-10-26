import Link from "next/link";
import { FiArrowRight, FiCheck } from "react-icons/fi";

import { renderServiceIcon } from "@/components/shared/icons";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { formatPrice } from "@/lib/utils/format";

// Itni deliverables pehle dikhti hain, baqi "Show N more" ke peeche.
const VISIBLE_DELIVERABLES = 4;

const asList = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);

function DeliverableItem({ children }) {
  return (
    <li className="flex items-start gap-2.5">
      <span
        aria-hidden="true"
        className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success/10 text-success"
      >
        <FiCheck className="size-3" strokeWidth={3} />
      </span>
      <span className="leading-snug">{children}</span>
    </li>
  );
}

export function ServiceCard({ service }) {
  const deliverables = asList(service.deliverables);
  const visible = deliverables.slice(0, VISIBLE_DELIVERABLES);
  const extra = deliverables.slice(VISIBLE_DELIVERABLES);

  const hasPrice = service.startingPrice != null;
  const price = hasPrice
    ? formatPrice({ price: service.startingPrice, currency: service.currency })
    : null;

  const detailsHref = `/services/${service.slug}`;

  return (
    <Card
      className={cn(
        "group/service relative h-full overflow-hidden transition-[transform,box-shadow,border-color] duration-300 motion-reduce:transition-none",
        "motion-safe:hover:-translate-y-1 hover:border-foreground/20 hover:shadow-lg",
        "focus-within:border-foreground/20 focus-within:shadow-lg",
      )}
    >
      <CardHeader className="gap-3">
        <span
          aria-hidden="true"
          className="mb-1 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform duration-300 motion-reduce:transition-none motion-safe:group-hover/service:scale-105 motion-safe:group-hover/service:-rotate-3"
        >
          {renderServiceIcon(service.icon, { className: "size-5" })}
        </span>

        <CardTitle className="text-card-title">
          {/* Stretched link: poora card clickable, lekin anchor sirf ek */}
          <Link
            href={detailsHref}
            className="rounded-sm outline-none after:absolute after:inset-0 after:content-[''] focus-visible:underline"
          >
            {service.title}
          </Link>
        </CardTitle>

        <CardDescription className="text-pretty leading-relaxed">
          {service.summary}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-5 text-sm">
        {service.problem ? (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              The problem
            </p>
            <p className="text-pretty leading-relaxed text-muted-foreground">
              {service.problem}
            </p>
          </div>
        ) : null}

        {deliverables.length > 0 ? (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              What you get
            </p>

            <ul className="flex flex-col gap-2.5">
              {visible.map((item) => (
                <DeliverableItem key={item}>{item}</DeliverableItem>
              ))}
            </ul>

            {/* Native disclosure: bina JavaScript chalta hai, keyboard se bhi */}
            {extra.length > 0 ? (
              <details className="group/more relative z-10">
                <summary className="flex w-fit cursor-pointer list-none items-center rounded-sm py-1 text-sm font-medium text-primary outline-none marker:hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&::-webkit-details-marker]:hidden">
                  <span className="group-open/more:hidden">
                    Show {extra.length} more
                  </span>
                  <span className="hidden group-open/more:inline">
                    Show fewer
                  </span>
                </summary>
                <ul className="mt-3 flex flex-col gap-2.5">
                  {extra.map((item) => (
                    <DeliverableItem key={item}>{item}</DeliverableItem>
                  ))}
                </ul>
              </details>
            ) : null}
          </div>
        ) : null}

        {/* Engagement + price: hamesha card ke neeche */}
        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-4 gap-y-1 border-t border-border/70 pt-4">
          {service.engagement ? (
            <p className="text-muted-foreground">{service.engagement}</p>
          ) : (
            <span />
          )}

          <p className="text-right">
            {hasPrice ? (
              <>
                <span className="block text-xs text-muted-foreground">
                  Starting from
                </span>
                <span className="text-metric text-lg font-semibold text-foreground">
                  {price}
                </span>
              </>
            ) : (
              <span className="font-medium text-foreground">Custom quote</span>
            )}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2">
        {/* relative z-10: stretched link ke upar rehte hain, isliye alag click hote hain */}
        <Link
          href={detailsHref}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "group/details relative z-10 h-auto min-h-9 gap-2 whitespace-normal py-2",
          )}
        >
          View details
          <span className="sr-only"> of {service.title}</span>
          <FiArrowRight
            aria-hidden="true"
            className="size-4 transition-transform duration-200 motion-safe:group-hover/details:translate-x-0.5"
          />
        </Link>
        <Link
          href={`/hire-me?service=${service.category}`}
          className={cn(
            buttonVariants(),
            "relative z-10 h-auto min-h-9 whitespace-normal py-2",
          )}
        >
          Request a quote
          <span className="sr-only"> for {service.title}</span>
        </Link>
      </CardFooter>
    </Card>
  );
}
