// tests/unit/estimator-teaser.test.js
// Tests for EstimatorTeaserClient price selection logic.
// Re-uses the existing estimateProject / formatEstimate from lib/ai/pricing-estimator.

import { describe, expect, it } from "vitest";
import {
  estimateProject,
  formatEstimate,
  ESTIMATE_DISCLAIMER,
} from "@/lib/ai/pricing-estimator";

// Sample plan data that mirrors the seed plans
const testPlans = [
  { slug: "web-starter", category: "web", name: "Starter", price: 99, currency: "USD" },
  { slug: "web-business", category: "web", name: "Business", price: 199, currency: "USD" },
  { slug: "web-ecommerce", category: "web", name: "E-commerce", price: 399, currency: "USD" },
  { slug: "bot-starter", category: "automation", name: "Starter", price: 99, currency: "USD" },
  { slug: "bot-business", category: "automation", name: "Business", price: 199, currency: "USD" },
  { slug: "bot-advanced", category: "automation", name: "Advanced", price: 399, currency: "USD" },
];

describe("EstimatorTeaser price selection", () => {
  describe("web-development service", () => {
    it("shows from lowest price when no plan selected (empty slug)", () => {
      const result = estimateProject({ service: "web-development", planSlug: "", plans: testPlans });
      expect(result.type).toBe("from");
      expect(result.from).toBe(99);
      expect(result.planName).toBe("Starter");
    });

    it("shows range from selected plan to next tier", () => {
      const result = estimateProject({ service: "web-development", planSlug: "web-starter", plans: testPlans });
      expect(result.type).toBe("range");
      expect(result.from).toBe(99);
      expect(result.upTo).toBe(199);
    });

    it("shows range from business to e-commerce", () => {
      const result = estimateProject({ service: "web-development", planSlug: "web-business", plans: testPlans });
      expect(result.type).toBe("range");
      expect(result.from).toBe(199);
      expect(result.upTo).toBe(399);
    });

    it("shows from-only for top tier (no upTo)", () => {
      const result = estimateProject({ service: "web-development", planSlug: "web-ecommerce", plans: testPlans });
      expect(result.type).toBe("from");
      expect(result.upTo).toBeNull();
    });
  });

  describe("chatbot-automation service", () => {
    it("shows from lowest automation price when no plan selected", () => {
      const result = estimateProject({ service: "chatbot-automation", planSlug: "", plans: testPlans });
      expect(result.type).toBe("from");
      expect(result.from).toBe(99);
    });

    it("uses only automation-category plans (not web plans)", () => {
      const result = estimateProject({ service: "chatbot-automation", planSlug: "bot-starter", plans: testPlans });
      expect(result.type).toBe("range");
      expect(result.from).toBe(99);
      expect(result.upTo).toBe(199);
    });
  });

  describe("hire-me URL construction", () => {
    it("builds URL with service param", () => {
      const service = "web-development";
      const planSlug = "web-starter";
      const url = `/hire-me?service=${service}&plan=${planSlug}`;
      expect(url).toBe("/hire-me?service=web-development&plan=web-starter");
    });

    it("builds URL without plan param when no plan selected", () => {
      const service = "web-development";
      const planSlug = "";
      const url = `/hire-me?service=${service}${planSlug ? `&plan=${planSlug}` : ""}`;
      expect(url).toBe("/hire-me?service=web-development");
    });
  });

  describe("price formatting", () => {
    it("formats range correctly", () => {
      const result = estimateProject({ service: "web-development", planSlug: "web-starter", plans: testPlans });
      expect(formatEstimate(result)).toBe("$99 – $199");
    });

    it("formats from correctly", () => {
      const result = estimateProject({ service: "web-development", planSlug: "", plans: testPlans });
      expect(formatEstimate(result)).toBe("From $99");
    });

    it("formats custom quote when no plans available", () => {
      const result = estimateProject({ service: "web-development", planSlug: "", plans: [] });
      expect(formatEstimate(result)).toBe("Custom quote after discovery");
    });
  });

  describe("disclaimer", () => {
    it("always includes the disclaimer text", () => {
      const result = estimateProject({ service: "web-development", planSlug: "web-starter", plans: testPlans });
      expect(result.disclaimer).toBe(ESTIMATE_DISCLAIMER);
      expect(result.disclaimer).toContain("starting prices");
    });
  });
});
