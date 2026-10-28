import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { formatPrice, formatStartingPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

function PlanFeatures({ items, emptyLabel }) {
  const values = Array.isArray(items) ? items.filter(Boolean) : [];
  return values.length ? (
    <ul className="flex min-w-44 flex-col gap-2">
      {values.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm leading-5">
          <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/70" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  ) : (
    <span className="text-sm text-muted-foreground">{emptyLabel}</span>
  );
}

export function PlanComparisonTable({ plans }) {
  if (!Array.isArray(plans) || plans.length === 0) return null;

  return (
    <section aria-labelledby="plan-comparison-title" className="mt-12">
      <div className="mb-5 max-w-2xl">
        <h2 id="plan-comparison-title" className="text-section-title">
          Compare plans
        </h2>
        <p className="mt-2 leading-7 text-muted-foreground">
          Review the published scope for each plan. Anything listed as not
          included needs to be scoped separately.
        </p>
      </div>
      <div
        role="region"
        aria-label="Plan comparison table; scroll horizontally to compare plans"
        tabIndex={0}
        className="overflow-x-auto rounded-2xl border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <table className="w-full min-w-[48rem] border-collapse text-left">
          <thead className="bg-muted/60">
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-10 min-w-40 border-b border-border bg-muted/95 p-4 text-sm font-semibold"
              >
                Plan
              </th>
              {plans.map((plan) => (
                <th
                  key={plan.slug}
                  scope="col"
                  className="min-w-52 border-b border-border p-4 align-top"
                >
                  <span className="block font-heading text-base font-semibold">
                    {plan.name}
                  </span>
                  <span className="mt-1 block text-xs font-normal text-muted-foreground">
                    {plan.category === "web" ? "Web" : "Chatbot"}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th
                scope="row"
                className="sticky left-0 z-10 border-b border-border bg-card p-4 text-sm font-medium"
              >
                Starting price
              </th>
              {plans.map((plan) => (
                <td
                  key={plan.slug}
                  className="border-b border-border p-4 align-top text-sm"
                >
                  {plan.price == null ? (
                    <span>Custom quote</span>
                  ) : (
                    <>
                      <span className="block font-semibold">
                        {plan.isStartingPrice
                          ? `Starting from ${formatStartingPrice(plan)}`
                          : formatPrice(plan)}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {plan.billing === "monthly"
                          ? "Monthly"
                          : plan.billing === "one-time"
                            ? "One-time"
                            : null}
                      </span>
                    </>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <th
                scope="row"
                className="sticky left-0 z-10 border-b border-border bg-card p-4 text-sm font-medium"
              >
                What&apos;s included
              </th>
              {plans.map((plan) => (
                <td
                  key={plan.slug}
                  className="border-b border-border p-4 align-top"
                >
                  <PlanFeatures
                    items={plan.features}
                    emptyLabel="No published details."
                  />
                </td>
              ))}
            </tr>
            <tr>
              <th
                scope="row"
                className="sticky left-0 z-10 bg-card p-4 text-sm font-medium"
              >
                What&apos;s not included
              </th>
              {plans.map((plan) => (
                <td key={plan.slug} className="p-4 align-top">
                  <PlanFeatures
                    items={plan.excludes}
                    emptyLabel="No exclusions listed."
                  />
                </td>
              ))}
            </tr>
            <tr>
              <th
                scope="row"
                className="sticky left-0 z-10 bg-card p-4 text-sm font-medium"
              >
                Next step
              </th>
              {plans.map((plan) => (
                <td key={plan.slug} className="p-4 align-top">
                  <Link
                    href={`/hire-me?plan=${encodeURIComponent(plan.slug)}`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "whitespace-nowrap")}
                  >
                    Discuss {plan.name}
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Starting prices; final quote after discovery.
      </p>
    </section>
  );
}
