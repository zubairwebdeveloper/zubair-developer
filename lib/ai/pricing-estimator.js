const GROUP_BY_SERVICE = {
  "web-development": "web",
  "chatbot-automation": "automation",
};

export const ESTIMATE_DISCLAIMER =
  "Preliminary estimate based on published starting prices. The final quote depends on scope and is confirmed in writing after discovery.";

function custom() {
  return {
    type: "custom",
    currency: null,
    from: null,
    upTo: null,
    planName: null,
    assumptions: ["This kind of project needs a custom quote after discovery."],
    disclaimer: ESTIMATE_DISCLAIMER,
  };
}

/**
 * Explicit rules (sirf stored, published plans se):
 * 1. Service web ya automation na ho -> custom quote.
 * 2. Us group ke prices-wale plans price ke hisab se sort hote hain.
 * 3. Plan select hua ho: from = us plan ki starting price, upTo = agle tier ki starting price (agar ho).
 * 4. Plan select na ho: sab se kam starting price, upTo nahi.
 * Model ka likha hua koi number is ma nahi aata.
 */
export function estimateProject({ service, planSlug, plans }) {
  const group = GROUP_BY_SERVICE[service];
  if (!group) return custom();

  const tiers = plans
    .filter((plan) => plan.category === group && typeof plan.price === "number")
    .sort((a, b) => a.price - b.price);
  if (tiers.length === 0) return custom();

  const index = planSlug
    ? tiers.findIndex((plan) => plan.slug === planSlug)
    : -1;

  if (index === -1) {
    const base = tiers[0];
    return {
      type: "from",
      currency: base.currency,
      from: base.price,
      upTo: null,
      planName: base.name,
      assumptions: [
        "No package was selected, so the lowest starting price for this service is shown.",
      ],
      disclaimer: ESTIMATE_DISCLAIMER,
    };
  }

  const plan = tiers[index];
  const next = tiers[index + 1] ?? null;

  return {
    type: next ? "range" : "from",
    currency: plan.currency,
    from: plan.price,
    upTo: next ? next.price : null,
    planName: plan.name,
    assumptions: [
      `Based on the ${plan.name} package.`,
      next
        ? `Needs beyond this package's scope may move toward the ${next.name} package.`
        : "Larger scope needs a custom quote.",
    ],
    disclaimer: ESTIMATE_DISCLAIMER,
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
