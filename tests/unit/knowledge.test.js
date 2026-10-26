import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/firebase/published", () => ({ getPublished: vi.fn() }));
vi.mock("@/services/services.service", () => ({ getServices: vi.fn() }));
vi.mock("@/services/pricing.service", () => ({ getPlans: vi.fn() }));
vi.mock("@/services/projects.service", () => ({
  getPublishedProjects: vi.fn(),
}));
vi.mock("@/services/content.service", () => ({
  getFaqs: vi.fn(),
  getSkills: vi.fn(),
}));

import { retrieveContext } from "@/lib/ai/knowledge";
import { getPublished } from "@/lib/firebase/published";
import { getFaqs, getSkills } from "@/services/content.service";
import { getPlans } from "@/services/pricing.service";
import { getPublishedProjects } from "@/services/projects.service";
import { getServices } from "@/services/services.service";

const services = [
  {
    title: "Business Websites",
    summary: "Fast websites.",
    problem: "You need a credible presence.",
    deliverables: ["SEO setup"],
    engagement: "Fixed scope",
    startingPrice: 99,
    currency: "USD",
  },
  {
    title: "Chatbot Automation",
    summary: "Instagram automation.",
    problem: "Slow replies.",
    deliverables: ["Flows"],
    engagement: "Setup",
    startingPrice: null,
    currency: "USD",
  },
];

const plans = [
  {
    slug: "web-ecommerce",
    category: "web",
    name: "E-commerce",
    price: 399,
    currency: "USD",
    isStartingPrice: true,
    billing: "one-time",
    description: "An online store.",
    features: ["Cart"],
    excludes: [],
  },
];

beforeEach(() => {
  getServices.mockResolvedValue(services);
  getPlans.mockResolvedValue(plans);
  getPublishedProjects.mockResolvedValue([]);
  getSkills.mockResolvedValue([{ name: "Next.js" }]);
  getFaqs.mockResolvedValue([
    {
      id: "1",
      question: "Do you offer maintenance?",
      answer: "Yes, as an optional plan.",
    },
  ]);
  getPublished.mockResolvedValue([]);
});

describe("retrieveContext", () => {
  it("returns the published price for pricing questions", async () => {
    const context = await retrieveContext(
      "How much does an e-commerce website cost?",
    );
    expect(context.text).toContain("$399+");
    expect(context.titles).toContain("E-commerce plan (web)");
  });

  it("finds FAQ answers", async () => {
    const context = await retrieveContext("Do you provide maintenance?");
    expect(context.text).toContain("optional plan");
  });

  it("includes admin-approved knowledge entries", async () => {
    getPublished.mockImplementation(async (name) =>
      name === "aiKnowledge"
        ? [
            {
              title: "Turnaround",
              content: "Small websites take about two weeks.",
            },
          ]
        : [],
    );
    const context = await retrieveContext("What is your turnaround time?");
    expect(context.text).toContain("two weeks");
  });

  it("falls back to the services overview when nothing matches", async () => {
    const context = await retrieveContext("hello");
    expect(context.titles).toEqual(["Business Websites", "Chatbot Automation"]);
  });

  it("caps how much context is sent", async () => {
    getFaqs.mockResolvedValue(
      Array.from({ length: 30 }, (_, index) => ({
        id: String(index),
        question: `Price question ${index}`,
        answer: `price ${"detail ".repeat(150)}`,
      })),
    );
    const context = await retrieveContext("price");
    expect(context.titles.length).toBeLessThanOrEqual(6);
    expect(context.text.length).toBeLessThanOrEqual(3600);
  });
});
