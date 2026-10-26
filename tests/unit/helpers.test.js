import { describe, expect, it, vi } from "vitest";

import { prepareRestore } from "@/lib/ai/versions";
import { parseLeadSearch } from "@/lib/leads/search";
import { rankRelated } from "@/lib/projects/related";
import { runBulk } from "@/lib/utils/bulk";
import { NotFoundError, TransitionError } from "@/lib/utils/errors";

describe("runBulk", () => {
  it("counts each outcome and keeps going after a failure", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const task = vi.fn(async (id) => {
      if (id === "b") throw new TransitionError();
      if (id === "c") throw new NotFoundError();
      if (id === "d") throw new Error("boom");
    });

    const summary = await runBulk(["a", "a", "b", "c", "d"], task);

    expect(summary).toEqual({ updated: 1, skipped: 1, missing: 1, failed: 1 });
    expect(task).toHaveBeenCalledTimes(4); // duplicate "a" sirf ek dafa
  });
});

describe("parseLeadSearch", () => {
  it("ignores terms that are too short or empty", () => {
    expect(parseLeadSearch("")).toBeNull();
    expect(parseLeadSearch("ab")).toBeNull();
    expect(parseLeadSearch(null)).toBeNull();
  });

  it("treats a reference as an exact, upper-cased match", () => {
    expect(parseLeadSearch(" zd-ab12cd34 ")).toEqual({
      field: "reference",
      op: "eq",
      value: "ZD-AB12CD34",
    });
  });

  it("treats anything else as a lower-cased email prefix", () => {
    expect(parseLeadSearch("Eve@Exam")).toEqual({
      field: "emailLower",
      op: "prefix",
      value: "eve@exam",
    });
  });

  it("caps very long input", () => {
    expect(parseLeadSearch("a".repeat(500)).value).toHaveLength(100);
  });
});

describe("rankRelated", () => {
  const current = {
    slug: "a",
    category: "Web app",
    technologies: ["Next.js", "Firebase"],
  };
  const all = [
    current,
    { slug: "b", category: "Web app", technologies: ["Next.js"], order: 2 },
    { slug: "c", category: "Automation", technologies: ["firebase"], order: 1 },
    { slug: "d", category: "Automation", technologies: ["ManyChat"], order: 0 },
    {
      slug: "e",
      category: "Web app",
      technologies: ["Next.js", "Firebase"],
      order: 3,
    },
  ];

  it("excludes the current project and unrelated ones", () => {
    const slugs = rankRelated(current, all).map((project) => project.slug);
    expect(slugs).not.toContain("a");
    expect(slugs).not.toContain("d");
  });

  it("ranks by category plus shared technologies (case-insensitive)", () => {
    expect(rankRelated(current, all).map((project) => project.slug)).toEqual([
      "e",
      "b",
      "c",
    ]);
  });

  it("respects the limit", () => {
    expect(rankRelated(current, all, 1)).toHaveLength(1);
  });
});

describe("prepareRestore", () => {
  const stored = {
    enabled: true,
    name: "Bot",
    welcomeMessage: "Hello there friends",
    tone: "Friendly",
    languages: ["English"],
    suggestedPrompts: [],
    qualificationQuestions: [],
    pricingGuidance: "",
    handoffMessage: "Talk to a person here.",
    extraInstructions: "",
    perIpPer10Min: 15,
    perSessionPerHour: 30,
    dailyMessages: 300,
    storeConversations: false,
    retentionDays: 30,
    version: 4,
    savedBy: "uid",
  };

  it("keeps the CURRENT enabled state, not the stored one", () => {
    expect(prepareRestore(stored, false).enabled).toBe(false);
    expect(prepareRestore({ ...stored, enabled: false }, true).enabled).toBe(
      true,
    );
  });

  it("drops bookkeeping fields", () => {
    const result = prepareRestore(stored, false);
    expect(result).not.toHaveProperty("version");
    expect(result).not.toHaveProperty("savedBy");
  });

  it("refuses versions that no longer pass validation", () => {
    expect(prepareRestore({ ...stored, perIpPer10Min: 0 }, false)).toBeNull();
    expect(prepareRestore({}, false)).toBeNull();
  });
});
