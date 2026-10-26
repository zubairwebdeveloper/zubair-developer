"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiArrowRight, FiGlobe, FiMessageSquare } from "react-icons/fi";

import { PlanCard } from "@/components/pricing/PlanCard";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils/cn";
import { formatPrice } from "@/lib/utils/format";

// `shortLabel` mobile par dikhta hai, `blurb` panel ke upar. Edit ya remove kar sakte ho.
const categories = [
  {
    value: "web",
    label: "Web development",
    shortLabel: "Web",
    icon: FiGlobe,
    blurb: "Websites and web apps built for your business goals.",
  },
  {
    value: "automation",
    label: "Chatbot automation",
    shortLabel: "Chatbots",
    icon: FiMessageSquare,
    blurb: "AI chatbots that handle repetitive conversations for you.",
  },
];

const CATEGORY_VALUES = categories.map((category) => category.value);

const SORT_OPTIONS = [
  { value: "default", label: "Recommended" },
  { value: "low", label: "Lowest price" },
  { value: "high", label: "Highest price" },
];

const BILLING_SUFFIX = { monthly: "/month", yearly: "/year" };

const CARD_GAP = 16; // gap-4 in px (mobile carousel)

const hasNumericPrice = (plan) =>
  typeof plan?.price === "number" && plan.price > 0;

/** Desktop grid columns adapt to the number of plans. */
function gridClasses(count) {
  if (count <= 1) return "md:mx-auto md:max-w-md md:grid-cols-1";
  if (count === 2) return "md:mx-auto md:max-w-3xl md:grid-cols-2";
  if (count === 3) return "md:grid-cols-3";
  return "md:grid-cols-2 xl:grid-cols-4";
}

function sortPlans(list, mode) {
  if (mode === "default") return list;
  const withPrice = list.filter(hasNumericPrice);
  const withoutPrice = list.filter((plan) => !hasNumericPrice(plan));
  withPrice.sort((a, b) =>
    mode === "low" ? a.price - b.price : b.price - a.price,
  );
  return [...withPrice, ...withoutPrice];
}

function readHash() {
  const value = window.location.hash.replace("#", "");
  return CATEGORY_VALUES.includes(value) ? value : null;
}

/* ------------------------------------------------------------------ */
/* Plan cards: swipe carousel on mobile, grid from md and up           */
/* ------------------------------------------------------------------ */

function PlanGrid({ plans }) {
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);
  const count = plans.length;

  const getStep = () => {
    const first = trackRef.current?.children[0];
    return first ? first.offsetWidth + CARD_GAP : 0;
  };

  const handleScroll = useCallback(() => {
    const el = trackRef.current;
    const step = getStep();
    if (!el || !step) return;

    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    const next = atEnd ? count - 1 : Math.round(el.scrollLeft / step);
    setIndex(Math.min(count - 1, Math.max(0, next)));
  }, [count]);

  const goTo = (i) => {
    const el = trackRef.current;
    if (!el) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    el.scrollTo({ left: i * getStep(), behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* data-no-snake: snake scrollbar is container par apna scroller na lagaye */}
      <div
        ref={trackRef}
        data-no-snake=""
        onScroll={handleScroll}
        className={cn(
          // mobile: horizontal swipe with snap
          "flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-pl-1 px-1 pb-4 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          // md+: normal grid
          "md:grid md:snap-none md:overflow-visible md:p-0",
          gridClasses(count),
        )}
      >
        {plans.map((plan, i) => (
          <div
            key={plan.slug}
            className={cn(
              "plan-rise h-full snap-start opacity-0",
              count > 1 ? "w-[85%] shrink-0 sm:w-[60%]" : "w-full",
              "md:w-auto md:shrink",
            )}
            style={{
              animation: "plan-rise 0.45s ease-out forwards",
              animationDelay: `${i * 70}ms`,
            }}
          >
            <PlanCard plan={plan} />
          </div>
        ))}
      </div>

      {/* Dots: sirf mobile par, jab 1 se zyada plans hon */}
      {count > 1 ? (
        <div
          className="flex items-center justify-center md:hidden"
          role="group"
          aria-label="Choose a plan"
        >
          {plans.map((plan, i) => (
            <button
              key={plan.slug}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show ${plan.name} plan`}
              aria-current={i === index ? "true" : undefined}
              className="grid size-8 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "block h-2 rounded-full transition-all duration-300 motion-reduce:transition-none",
                  i === index ? "w-6 bg-primary" : "w-2 bg-border",
                )}
              />
            </button>
          ))}
        </div>
      ) : null}

      {count > 1 ? (
        <p className="text-center text-xs text-muted-foreground md:hidden">
          Swipe to compare plans
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export function PricingTabs({ plans }) {
  const allPlans = useMemo(() => (Array.isArray(plans) ? plans : []), [plans]);
  const [sort, setSort] = useState("default");

  // Group once instead of filtering inside render for every tab.
  const grouped = useMemo(
    () =>
      Object.fromEntries(
        categories.map((category) => [
          category.value,
          allPlans.filter((plan) => plan.category === category.value),
        ]),
      ),
    [allPlans],
  );

  // Hide a tab entirely when it has no plans (unless nothing has any).
  const visibleCategories = useMemo(() => {
    const withPlans = categories.filter(
      (category) => grouped[category.value].length > 0,
    );
    return withPlans.length > 0 ? withPlans : categories;
  }, [grouped]);

  const [active, setActive] = useState(visibleCategories[0].value);

  // Open the tab named in the URL hash (e.g. /pricing#automation) and follow hash changes.
  useEffect(() => {
    const sync = () => {
      const fromHash = readHash();
      if (fromHash && visibleCategories.some((c) => c.value === fromHash)) {
        setActive(fromHash);
      }
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [visibleCategories]);

  // Keep the active tab valid if the data changes underneath it.
  useEffect(() => {
    if (!visibleCategories.some((category) => category.value === active)) {
      setActive(visibleCategories[0].value);
    }
  }, [active, visibleCategories]);

  const handleChange = useCallback((value) => {
    setActive(value);
    // Shareable link without adding a history entry or jumping the page
    window.history.replaceState(null, "", `#${value}`);
  }, []);

  const sortLabel = SORT_OPTIONS.find((option) => option.value === sort)?.label;

  return (
    <>
      <style>{`
        @keyframes plan-rise {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .plan-rise { animation: none !important; opacity: 1 !important; }
        }
      `}</style>

      <Tabs
        value={active}
        onValueChange={handleChange}
        orientation="horizontal"
        className="flex w-full min-w-0 flex-col gap-8"
      >
        {" "}
        {/* Mobile: full-width equal buttons (icon upar, label neeche).
            sm+: compact pill buttons with full labels. */}
        <TabsList
          aria-label="Service categories"
          style={{
            gridTemplateColumns: `repeat(${visibleCategories.length}, minmax(0, 1fr))`,
          }}
          className="mx-auto grid h-auto w-full max-w-lg gap-1 p-1 sm:inline-grid sm:w-fit sm:max-w-none sm:grid-flow-col sm:auto-cols-fr"
        >
          {visibleCategories.map((category) => {
            const count = grouped[category.value].length;
            const Icon = category.icon;

            return (
              <TabsTrigger
                key={category.value}
                value={category.value}
                className="min-h-14 flex-col gap-1 px-2 py-2 text-xs sm:min-h-11 sm:flex-row sm:gap-2 sm:px-5 sm:text-sm"
              >
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                <span className="flex items-center gap-1.5">
                  <span className="sm:hidden">{category.shortLabel}</span>
                  <span className="hidden sm:inline">{category.label}</span>
                  <span
                    aria-hidden="true"
                    className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-muted-foreground"
                  >
                    {count}
                  </span>
                </span>
                <span className="sr-only">
                  ({count} {count === 1 ? "plan" : "plans"})
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        {visibleCategories.map((category) => {
          const categoryPlans = grouped[category.value];
          const pricedPlans = categoryPlans.filter(hasNumericPrice);
          const cheapest = pricedPlans.length
            ? pricedPlans.reduce((min, plan) =>
                plan.price < min.price ? plan : min,
              )
            : null;
          const sortable = pricedPlans.length >= 2;
          const sorted = sortPlans(categoryPlans, sort);

          return (
            <TabsContent
              key={category.value}
              value={category.value}
              className="flex min-w-0 flex-col my-6 gap-6 outline-none"
            >
              <div className="flex flex-col gap-4 my-12 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex max-w-prose flex-col gap-2 text-center sm:text-left">
                  {category.blurb ? (
                    <p className="text-pretty text-sm text-muted-foreground sm:text-base">
                      {category.blurb}
                    </p>
                  ) : null}
                  {cheapest ? (
                    <p className="text-sm font-medium text-foreground">
                      Starting from {formatPrice(cheapest)}
                      {BILLING_SUFFIX[cheapest.billing] ? (
                        <span className="font-normal text-muted-foreground">
                          {" "}
                          {BILLING_SUFFIX[cheapest.billing]}
                        </span>
                      ) : null}
                    </p>
                  ) : null}
                </div>

                {sortable ? (
                  <div
                    role="group"
                    aria-label="Sort plans"
                    className="flex flex-wrap items-center justify-center gap-2 sm:justify-end"
                  >
                    {SORT_OPTIONS.map((option) => {
                      const selected = sort === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setSort(option.value)}
                          className={cn(
                            "min-h-9 cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-medium outline-none transition-colors duration-200 motion-reduce:transition-none",
                            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                            selected
                              ? "border-foreground bg-foreground text-background"
                              : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                          )}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              {sorted.length > 0 ? (
                // key=sort: sort badalne par cards dobara animate hote hain aur carousel reset hota hai
                <PlanGrid key={`${category.value}-${sort}`} plans={sorted} />
              ) : (
                <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-dashed border-border p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Plans for {category.label.toLowerCase()} are being updated.
                    Tell me what you need and I will send a written quote.
                  </p>
                  <Link
                    href="/hire-me"
                    className={cn(buttonVariants({ variant: "outline" }))}
                  >
                    Discuss your project
                  </Link>
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Screen readers ko sort change ki khabar */}
      <span role="status" aria-live="polite" className="sr-only">
        {sort === "default"
          ? ""
          : `Plans sorted by ${sortLabel?.toLowerCase()}`}
      </span>

      {/* Next step for visitors who don't see an exact fit */}
      <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-border/70 bg-muted/30 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="max-w-prose text-pretty text-sm text-muted-foreground sm:text-base">
          Not sure which plan fits, or need something custom? Describe your
          project and I will reply with a clear plan and a written quote.
        </p>
        <Link
          href="/hire-me"
          className={cn(
            buttonVariants(),
            "group w-full shrink-0 gap-2 sm:w-auto",
          )}
        >
          Discuss your project
          <FiArrowRight
            aria-hidden="true"
            className="size-4 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </>
  );
}
