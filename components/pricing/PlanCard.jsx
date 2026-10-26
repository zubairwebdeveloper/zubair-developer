import Link from "next/link";
import { FiArrowRight, FiCheck, FiMinus } from "react-icons/fi";

import { Badge } from "@/components/ui/badge";
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

// Features shown before the rest collapse behind "Show all features".
const VISIBLE_FEATURES = 6;

const BILLING_SUFFIX = {
  monthly: "/month",
  yearly: "/year",
};

const asList = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);

function FeatureItem({ children }) {
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

export function PlanCard({ plan }) {
  const featured = Boolean(plan.badge);
  const serviceParam =
    plan.category === "web" ? "web-development" : "chatbot-automation";

  const features = asList(plan.features);
  const excludes = asList(plan.excludes);
  const visibleFeatures = features.slice(0, VISIBLE_FEATURES);
  const extraFeatures = features.slice(VISIBLE_FEATURES);

  const suffix = plan.price != null ? BILLING_SUFFIX[plan.billing] : null;
  const ctaLabel = plan.ctaLabel ?? "Get started";

  return (
    <Card
      className={cn(
        "group/plan relative h-full overflow-hidden transition-[transform,box-shadow,border-color] duration-300 motion-reduce:transition-none",
        "motion-safe:hover:-translate-y-1 hover:shadow-lg",
        featured
          ? "border-brand shadow-md ring-1 ring-brand/30"
          : "hover:border-foreground/20",
      )}
    >
      {/* Accent edge for the highlighted plan */}
      {featured ? (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1 bg-brand"
        />
      ) : null}

      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-card-title">{plan.name}</CardTitle>
          {featured ? <Badge>{plan.badge}</Badge> : null}
        </div>

        <p className="text-metric flex flex-wrap items-baseline gap-x-1 text-3xl tracking-tight sm:text-4xl">
          {formatPrice(plan)}
          {suffix ? (
            <span className="text-base font-normal text-muted-foreground">
              {suffix}
            </span>
          ) : null}
        </p>

        <CardDescription className="text-pretty leading-relaxed">
          {plan.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5 text-sm">
        {features.length > 0 ? (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              What&apos;s included
            </p>

            <ul className="flex flex-col gap-2.5">
              {visibleFeatures.map((feature) => (
                <FeatureItem key={feature}>{feature}</FeatureItem>
              ))}
            </ul>

            {/* Native disclosure: works without JavaScript and is keyboard accessible */}
            {extraFeatures.length > 0 ? (
              <details className="group/more">
                <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 rounded-sm py-1 text-sm font-medium text-primary outline-none marker:hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&::-webkit-details-marker]:hidden">
                  <span className="group-open/more:hidden">
                    Show {extraFeatures.length} more{" "}
                    {extraFeatures.length === 1 ? "feature" : "features"}
                  </span>
                  <span className="hidden group-open/more:inline">
                    Show fewer features
                  </span>
                </summary>
                <ul className="mt-3 flex flex-col gap-2.5">
                  {extraFeatures.map((feature) => (
                    <FeatureItem key={feature}>{feature}</FeatureItem>
                  ))}
                </ul>
              </details>
            ) : null}
          </div>
        ) : null}

        {excludes.length > 0 ? (
          <ul className="flex flex-col gap-2 border-t border-border/70 pt-4 text-muted-foreground">
            {excludes.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span
                  aria-hidden="true"
                  className="mt-0.5 grid size-5 shrink-0 place-items-center"
                >
                  <FiMinus className="size-3.5" />
                </span>
                <span className="leading-snug">Not included: {item}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>

      <CardFooter className="mt-auto">
        <Link
          href={`/hire-me?service=${serviceParam}&plan=${plan.slug}`}
          className={cn(
            buttonVariants({ variant: featured ? "default" : "outline" }),
            "group/cta h-auto min-h-9 w-full gap-2 whitespace-normal py-2 text-center",
          )}
        >
          {ctaLabel}
          <span className="sr-only"> with the {plan.name} plan</span>
          <FiArrowRight
            aria-hidden="true"
            className="size-4 transition-transform duration-200 motion-safe:group-hover/cta:translate-x-0.5"
          />
        </Link>
      </CardFooter>
    </Card>
  );
}
