// components/home/EstimatorTeaser.jsx
// Server component — fetches plans, passes to client estimator UI.
// Shows "starting price, not final quote" context prominently.

import { Section } from "@/components/shared/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { getPlans } from "@/services/pricing.service";
import { EstimatorTeaserClient } from "./EstimatorTeaserClient";

export async function EstimatorTeaser() {
  let plans = [];
  try {
    plans = await getPlans();
  } catch (err) {
    console.error("[EstimatorTeaser] failed to load plans:", err);
  }

  // Serialise only what the client needs — no functions cross the boundary
  const safePlans = (Array.isArray(plans) ? plans : []).map((p) => ({
    slug: p.slug ?? "",
    name: p.name ?? "",
    category: p.category ?? "",
    price: typeof p.price === "number" ? p.price : null,
    currency: p.currency ?? "USD",
    isStartingPrice: p.isStartingPrice ?? false,
    excludes: Array.isArray(p.excludes) ? p.excludes : [],
  }));

  return (
    <Section className="bg-muted/40">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start lg:gap-16">
        {/* Left: context */}
        <div className="flex flex-col gap-5">
          <SectionHeading
            eyebrow="Price estimator"
            title="Get a starting-price ballpark."
            description="Choose a project type and size, then note any published exclusions you want to discuss. The final quote is based on your full scope."
            animate={false}
          />
          <div className="rounded-2xl border border-amber-300/30 bg-amber-50/40 px-5 py-4 dark:border-amber-700/30 dark:bg-amber-900/10">
            <p className="text-sm leading-relaxed text-amber-800 dark:text-amber-300">
              <strong>Starting prices only.</strong> Estimates use published plan
              prices. Any extras are discussed during discovery and are not given
              an invented add-on price.
            </p>
          </div>
        </div>

        {/* Right: interactive picker */}
        <EstimatorTeaserClient plans={safePlans} />
      </div>
    </Section>
  );
}
