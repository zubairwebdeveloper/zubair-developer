import { describe, expect, it } from "vitest";

import {
  estimateProject,
  ESTIMATE_DISCLAIMER,
  formatEstimate,
} from "@/lib/ai/pricing-estimator";

const plans = [
  {
    slug: "web-business",
    category: "web",
    name: "Business",
    price: 199,
    currency: "USD",
  },
  {
    slug: "web-starter",
    category: "web",
    name: "Starter",
    price: 99,
    currency: "USD",
  },
  {
    slug: "web-ecommerce",
    category: "web",
    name: "E-commerce",
    price: 399,
    currency: "USD",
  },
  {
    slug: "web-custom",
    category: "web",
    name: "Custom",
    price: null,
    currency: "USD",
  },
  {
    slug: "bot-starter",
    category: "automation",
    name: "Starter",
    price: 99,
    currency: "USD",
  },
];

describe("estimateProject", () => {
  it("returns a range from the selected plan to the next tier", () => {
    expect(
      estimateProject({
        service: "web-development",
        planSlug: "web-business",
        plans,
      }),
    ).toMatchObject({
      type: "range",
      from: 199,
      upTo: 399,
      planName: "Business",
    });
    expect(
      estimateProject({
        service: "web-development",
        planSlug: "web-starter",
        plans,
      }),
    ).toMatchObject({
      from: 99,
      upTo: 199,
    });
  });

  it("returns only a starting price for the top tier", () => {
    expect(
      estimateProject({
        service: "web-development",
        planSlug: "web-ecommerce",
        plans,
      }),
    ).toMatchObject({
      type: "from",
      from: 399,
      upTo: null,
    });
  });

  it("uses the lowest starting price when no plan is selected or the slug is unknown", () => {
    [undefined, "", "nope"].forEach((planSlug) => {
      expect(
        estimateProject({ service: "web-development", planSlug, plans }),
      ).toMatchObject({
        type: "from",
        from: 99,
        planName: "Starter",
      });
    });
  });

  it("ignores plans that have no price", () => {
    const result = estimateProject({
      service: "web-development",
      planSlug: "web-custom",
      plans,
    });
    expect(result.from).toBe(99);
  });

  it("works for automation using only automation plans", () => {
    expect(
      estimateProject({ service: "chatbot-automation", planSlug: "", plans }),
    ).toMatchObject({
      from: 99,
      type: "from",
    });
  });

  it("asks for a custom quote for other services or when there are no priced plans", () => {
    expect(
      estimateProject({ service: "ai-assistant", planSlug: "", plans }).type,
    ).toBe("custom");
    expect(
      estimateProject({ service: "custom", planSlug: "", plans }).type,
    ).toBe("custom");
    expect(
      estimateProject({ service: "web-development", planSlug: "", plans: [] })
        .type,
    ).toBe("custom");
  });

  it("always includes the disclaimer and never invents numbers", () => {
    const result = estimateProject({
      service: "web-development",
      planSlug: "web-business",
      plans,
    });
    expect(result.disclaimer).toBe(ESTIMATE_DISCLAIMER);
    const allowed = new Set(plans.map((plan) => plan.price));
    expect(allowed.has(result.from)).toBe(true);
    expect(allowed.has(result.upTo)).toBe(true);
  });
});

describe("formatEstimate", () => {
  it("formats ranges, starting prices and custom quotes", () => {
    expect(
      formatEstimate({ type: "range", from: 99, upTo: 199, currency: "USD" }),
    ).toBe("$99 – $199");
    expect(formatEstimate({ type: "from", from: 399, currency: "USD" })).toBe(
      "From $399",
    );
    expect(formatEstimate({ type: "custom" })).toBe(
      "Custom quote after discovery",
    );
    expect(formatEstimate(null)).toBe("Custom quote after discovery");
  });
});
