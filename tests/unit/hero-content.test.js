import { describe, expect, it } from "vitest";

import {
  BUILD_WORDS,
  buildServicePaths,
  buildTrustItems,
  DEFAULT_DESCRIPTION,
  DEFAULT_HEADLINE,
  resolveDescription,
  resolveHeadline,
  splitHeadline,
} from "@/lib/hero/hero-content";

describe("hero content helpers", () => {
  it("uses useful English defaults and respects non-empty CMS overrides", () => {
    expect(resolveHeadline()).toBe(DEFAULT_HEADLINE);
    expect(resolveHeadline({ headline: "  I build useful products.  " })).toBe(
      "I build useful products.",
    );
    expect(resolveHeadline({ headline: " " })).toBe(DEFAULT_HEADLINE);
    expect(resolveDescription({ bio: "  Custom first-person copy. " })).toBe(
      "Custom first-person copy.",
    );
    expect(resolveDescription({ headline: "CMS headline" })).toBe(
      DEFAULT_DESCRIPTION,
    );
    expect(splitHeadline(DEFAULT_HEADLINE)).toEqual({
      lead: ["I", "build", "websites", "and", "chatbots", "that"],
      accent: "turn visitors into customers.",
    });
    expect(BUILD_WORDS).toEqual([
      "websites",
      "SaaS apps",
      "dashboards",
      "Instagram DM bots",
      "AI assistants",
      "automations",
    ]);
  });

  it("adds a free discovery call only when the site setting enables it", () => {
    expect(
      buildTrustItems({ siteConfig: { freeDiscoveryCall: false } }).map(
        (item) => item.label,
      ),
    ).toEqual([
      "Direct communication with me",
      "Clear starting prices",
      "Quote after discovery",
    ]);
    expect(
      buildTrustItems({ siteConfig: { freeDiscoveryCall: true } }).map(
        (item) => item.label,
      ),
    ).toEqual([
      "Direct communication with me",
      "Clear starting prices",
      "Free discovery call",
      "Quote after discovery",
    ]);
  });

  it("hides zero and missing published project counts", () => {
    expect(
      buildTrustItems({
        siteConfig: {},
        stats: { publishedProjects: 0 },
      }).map((item) => item.label),
    ).not.toContain("0 published projects");
    expect(
      buildTrustItems({
        siteConfig: {},
        stats: { publishedProjects: 4 },
      }).at(-1),
    ).toEqual({ id: "projects", label: "4 published projects" });
    expect(buildTrustItems({ siteConfig: {}, stats: {} })).toHaveLength(3);
  });

  it("uses published starting prices and actual service slugs, otherwise links to pricing labels", () => {
    const paths = buildServicePaths({
      plans: [
        { category: "web", price: 99, currency: "USD", isStartingPrice: true },
        { category: "web", price: 199, currency: "USD", isStartingPrice: true },
        { category: "automation", price: 149, currency: "USD" },
      ],
      services: [
        { category: "web-development", slug: "business-websites" },
        { category: "chatbot-automation", slug: "chatbot-automation" },
      ],
    });

    expect(paths.map(({ href, priceLabel }) => ({ href, priceLabel }))).toEqual([
      {
        href: "/services/business-websites",
        priceLabel: "Starting from $99",
      },
      {
        href: "/services/chatbot-automation",
        priceLabel: "Starting from $149",
      },
    ]);

    expect(buildServicePaths().map(({ href, priceLabel }) => ({ href, priceLabel }))).toEqual([
      { href: "/services", priceLabel: "View pricing" },
      { href: "/services", priceLabel: "View pricing" },
    ]);
  });
});
