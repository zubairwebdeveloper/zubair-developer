export const ESTIMATE_DISCLAIMER =
  "Indicative only. This estimate uses published plan prices; add-ons have no separate published price and will be discussed in your exact quote.";

export const PROJECT_SIZES = [
  { value: "starter", label: "Starter" },
  { value: "growth", label: "Growth" },
  { value: "pro", label: "Pro" },
];

const CATEGORY_BY_TYPE = {
  web: "web",
  chatbot: "automation",
};

const SIZE_INDEX = Object.fromEntries(
  PROJECT_SIZES.map(({ value }, index) => [value, index]),
);

export function getEstimateTiers(plans, projectType) {
  const category = CATEGORY_BY_TYPE[projectType];
  if (!category || !Array.isArray(plans)) return [];

  const priced = plans.filter(
    (plan) =>
      plan.category === category &&
      typeof plan.price === "number" &&
      Number.isFinite(plan.price) &&
      plan.price >= 0,
  );
  const pricingModels = new Set(
    priced.map((plan) => `${plan.currency ?? "USD"}:${plan.billing ?? "unspecified"}`),
  );
  if (pricingModels.size > 1) return [];

  return priced.sort((a, b) => a.price - b.price);
}

export function getPublishedAddOns(plans, projectType) {
  const category = CATEGORY_BY_TYPE[projectType];
  if (!category || !Array.isArray(plans)) return [];

  return [
    ...new Set(
      plans
        .filter((plan) => plan.category === category)
        .flatMap((plan) =>
          Array.isArray(plan.excludes) ? plan.excludes : [],
        )
        .filter((item) => typeof item === "string" && item.trim()),
    ),
  ];
}

export function estimateProject({ projectType, size, plans }) {
  const sizeIndex = SIZE_INDEX[size];
  if (!CATEGORY_BY_TYPE[projectType] || sizeIndex === undefined) {
    return { type: "custom", currency: null, from: null, upTo: null };
  }

  const tiers = getEstimateTiers(plans, projectType);
  const tier = tiers[sizeIndex];
  if (!tier) return { type: "custom", currency: null, from: null, upTo: null };

  const nextTier = tiers
    .slice(sizeIndex + 1)
    .find((plan) => plan.currency === tier.currency);

  return {
    type: nextTier ? "range" : "from",
    currency: tier.currency,
    from: tier.price,
    upTo: nextTier?.price ?? null,
    planSlug: tier.slug,
    planName: tier.name,
  };
}

export function formatEstimate(estimate) {
  if (!estimate || estimate.type === "custom" || estimate.from == null) {
    return "Custom quote after discovery";
  }

  const money = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: estimate.currency ?? "USD",
      maximumFractionDigits: 0,
    }).format(value);

  return estimate.type === "range"
    ? `${money(estimate.from)} – ${money(estimate.upTo)}`
    : `From ${money(estimate.from)}`;
}
