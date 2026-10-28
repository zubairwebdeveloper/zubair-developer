export const DEFAULT_HEADLINE =
  "I build websites and chatbots that turn visitors into customers.";

export const DEFAULT_DESCRIPTION =
  "I build fast, responsive interfaces and secure backend features for websites, SaaS apps and dashboards.\nI create chatbot and automation flows that help businesses respond, capture leads and keep routine work moving.";

export const BUILD_WORDS = [
  "websites",
  "SaaS apps",
  "dashboards",
  "Instagram DM bots",
  "AI assistants",
  "automations",
];

const TRUST_ITEMS = [
  { id: "direct", label: "Direct communication with me" },
  { id: "prices", label: "Clear starting prices" },
  { id: "quote", label: "Quote after discovery" },
];

function nonEmptyString(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function resolveHeadline({ headline } = {}) {
  return nonEmptyString(headline) || DEFAULT_HEADLINE;
}

export function resolveDescription({ bio } = {}) {
  return nonEmptyString(bio) || DEFAULT_DESCRIPTION;
}

function formatStartingPrice(price, currency = "USD") {
  if (!Number.isFinite(price) || price <= 0) return null;
  if (currency === "USD") return `Starting from $${price}`;
  return `Starting from ${currency} ${price}`;
}

function lowestPlanPrice(plans, category) {
  if (!Array.isArray(plans)) return null;
  const pricedPlans = plans
    .filter(
      (plan) =>
        plan?.category === category &&
        Number.isFinite(plan.price) &&
        plan.price > 0 &&
        plan.isStartingPrice !== false,
    )
    .sort((left, right) => left.price - right.price);
  const plan = pricedPlans[0];
  return plan ? formatStartingPrice(plan.price, plan.currency) : null;
}

function servicePrice(services, categories) {
  if (!Array.isArray(services)) return null;
  const service = services.find(
    (item) =>
      categories.includes(item?.category) &&
      Number.isFinite(item?.startingPrice) &&
      item.startingPrice > 0,
  );
  return service
    ? formatStartingPrice(service.startingPrice, service.currency)
    : null;
}

function serviceHref(services, categories) {
  if (!Array.isArray(services)) return "/services";
  const service = services.find(
    (item) =>
      categories.includes(item?.category) &&
      typeof item.slug === "string" &&
      item.slug.trim(),
  );
  return service ? `/services/${service.slug.trim()}` : "/services";
}

export function buildServicePaths({ plans = [], services = [] } = {}) {
  const paths = [
    {
      id: "web",
      title: "Full Stack Web",
      outcome: "Bring your website or product idea from interface to backend.",
      chips: ["Frontend", "Backend", "SaaS"],
      categories: ["web-development"],
      planCategory: "web",
    },
    {
      id: "automation",
      title: "Chatbot & Automation",
      outcome: "Turn conversations into clearer enquiries and useful follow-up.",
      chips: ["Instagram DM", "ManyChat", "Lead capture"],
      categories: ["chatbot-automation", "ai-assistant"],
      planCategory: "automation",
    },
  ];

  return paths.map((path) => ({
    ...path,
    href: serviceHref(services, path.categories),
    priceLabel:
      lowestPlanPrice(plans, path.planCategory) ??
      servicePrice(services, path.categories) ??
      "View pricing",
  }));
}

export function buildTrustItems({ siteConfig = {}, stats } = {}) {
  const items = [...TRUST_ITEMS];
  if (siteConfig.freeDiscoveryCall === true) {
    items.splice(2, 0, {
      id: "discovery",
      label: "Free discovery call",
    });
  }

  const publishedProjects =
    typeof stats?.publishedProjects === "number" ? stats.publishedProjects : 0;
  if (publishedProjects > 0) {
    items.push({
      id: "projects",
      label: `${publishedProjects} published projects`,
    });
  }

  return items;
}

export function splitHeadline(headline) {
  const words = resolveHeadline({ headline }).split(/\s+/);
  if (words.length <= 5) {
    return { lead: words.slice(0, -2), accent: words.slice(-2).join(" ") };
  }
  return { lead: words.slice(0, -4), accent: words.slice(-4).join(" ") };
}
