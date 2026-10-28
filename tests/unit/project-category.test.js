import { describe, expect, it } from "vitest";

import {
  getProjectCategoryGroups,
  getProjectCategoryKey,
} from "@/lib/projects/category";

describe("project category groups", () => {
  it("maps categories into the available project filters", () => {
    expect(getProjectCategoryKey("web-development")).toBe("web");
    expect(getProjectCategoryKey("Chatbot & Automation")).toBe("chatbot");
    expect(getProjectCategoryKey("SaaS")).toBe("saas");
    expect(getProjectCategoryKey("unclassified")).toBeNull();
  });

  it("only exposes categories represented in the project list", () => {
    expect(
      getProjectCategoryGroups([
        { category: "web-development" },
        { category: "web" },
        { category: "chatbot-automation" },
      ]),
    ).toEqual([
      { key: "web", label: "Web", count: 2 },
      { key: "chatbot", label: "Chatbot", count: 1 },
    ]);
  });
});
