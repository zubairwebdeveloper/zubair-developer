import { describe, expect, it } from "vitest";

import {
  ESTIMATE_DISCLAIMER,
  estimateProject,
  formatEstimate,
  getEstimateTiers,
  getPublishedAddOns,
} from "@/lib/pricing/estimate";

const plans = [
  {
    slug: "web-starter",
    category: "web",
    name: "Starter",
    price: 99,
    currency: "USD",
    excludes: ["Online payments"],
  },
  {
    slug: "web-growth",
    category: "web",
    name: "Business",
    price: 199,
    currency: "USD",
    excludes: ["Custom backend"],
  },
  {
    slug: "web-pro",
    category: "web",
    name: "E-commerce",
    price: 399,
    currency: "USD",
    excludes: ["Custom marketplace logic"],
  },
  {
    slug: "chat-starter",
    category: "automation",
    name: "Starter",
    price: 149,
    currency: "USD",
    excludes: ["CRM integration"],
  },
  {
    slug: "custom",
    category: "web",
    name: "Custom",
    price: null,
    currency: "USD",
    excludes: [],
  },
];

describe("published pricing estimate", () => {
  it("uses only the selected size and next published plan price", () => {
    const result = estimateProject({
      projectType: "web",
      size: "growth",
      plans,
    });

    expect(result).toMatchObject({
      type: "range",
      from: 199,
      upTo: 399,
      planSlug: "web-growth",
      planName: "Business",
      currency: "USD",
    });
    expect(formatEstimate(result)).toBe("$199 – $399");
  });

  it("returns a starting price for the highest published size", () => {
    const result = estimateProject({ projectType: "web", size: "pro", plans });
    expect(result).toMatchObject({ type: "from", from: 399, upTo: null });
    expect(formatEstimate(result)).toBe("From $399");
  });

  it("uses chatbot plans only and excludes plans without published prices", () => {
    expect(
      estimateProject({ projectType: "chatbot", size: "starter", plans }),
    ).toMatchObject({ from: 149, upTo: null, planSlug: "chat-starter" });
  });

  it("returns a custom quote when the selected published size is unavailable", () => {
    expect(
      estimateProject({
        projectType: "chatbot",
        size: "growth",
        plans,
      }).type,
    ).toBe("custom");
    expect(
      estimateProject({ projectType: "other", size: "starter", plans }).type,
    ).toBe("custom");
  });

  it("does not compare unrelated currencies or billing models", () => {
    expect(
      getEstimateTiers(
        [
          ...plans,
          {
            slug: "web-eur",
            category: "web",
            price: 250,
            currency: "EUR",
            billing: "one-time",
          },
        ],
        "web",
      ),
    ).toEqual([]);
    expect(
      estimateProject({
        projectType: "web",
        size: "starter",
        plans: [
          ...plans,
          {
            slug: "web-monthly",
            category: "web",
            price: 25,
            currency: "USD",
            billing: "monthly",
          },
        ],
      }).type,
    ).toBe("custom");
  });

  it("only exposes add-ons published as plan exclusions", () => {
    expect(getPublishedAddOns(plans, "web")).toEqual([
      "Online payments",
      "Custom backend",
      "Custom marketplace logic",
    ]);
    expect(getPublishedAddOns(plans, "chatbot")).toEqual(["CRM integration"]);
    expect(getPublishedAddOns(plans, "other")).toEqual([]);
  });

  it("makes clear that estimates are indicative and add-ons have no price", () => {
    expect(ESTIMATE_DISCLAIMER).toContain("Indicative only");
    expect(ESTIMATE_DISCLAIMER).toContain("no separate published price");
    expect(formatEstimate({ type: "custom" })).toBe(
      "Custom quote after discovery",
    );
  });
});
