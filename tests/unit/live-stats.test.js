// tests/unit/live-stats.test.js
import { describe, expect, it } from "vitest";

import { buildPublicStats } from "@/lib/home/stats";

describe("published stats strip", () => {
  it("returns all three stats when all have counts > 0", () => {
    const stats = buildPublicStats({
      projectCount: 5,
      serviceCount: 4,
      postCount: 6,
    });
    expect(stats).toHaveLength(3);
    expect(stats.map((stat) => stat.id)).toEqual([
      "projects",
      "services",
      "posts",
    ]);
  });

  it("hides a stat when its count is 0", () => {
    const stats = buildPublicStats({
      projectCount: 0,
      serviceCount: 3,
      postCount: 2,
    });
    expect(stats).toHaveLength(2);
    expect(stats.find((stat) => stat.id === "projects")).toBeUndefined();
    expect(stats.find((stat) => stat.id === "services")).toBeDefined();
    expect(stats.find((stat) => stat.id === "posts")).toBeDefined();
  });

  it("returns an empty array (hides whole block) when all counts are 0", () => {
    const stats = buildPublicStats({
      projectCount: 0,
      serviceCount: 0,
      postCount: 0,
    });
    expect(stats).toHaveLength(0);
  });

  it("shows only the stat that has a non-zero count", () => {
    const stats = buildPublicStats({
      projectCount: 0,
      serviceCount: 1,
      postCount: 0,
    });
    expect(stats).toHaveLength(1);
    expect(stats[0].id).toBe("services");
  });

  it("uses singular label when count is exactly 1", () => {
    const stats = buildPublicStats({
      projectCount: 1,
      serviceCount: 1,
      postCount: 1,
    });
    expect(stats.find((stat) => stat.id === "projects")?.label).toBe(
      "Published project",
    );
    expect(stats.find((stat) => stat.id === "services")?.label).toBe("Service");
    expect(stats.find((stat) => stat.id === "posts")?.label).toBe(
      "Published article",
    );
  });

  it("uses plural label when count is more than 1", () => {
    const stats = buildPublicStats({
      projectCount: 3,
      serviceCount: 4,
      postCount: 6,
    });
    expect(stats.find((stat) => stat.id === "projects")?.label).toBe(
      "Published projects",
    );
    expect(stats.find((stat) => stat.id === "services")?.label).toBe("Services");
    expect(stats.find((stat) => stat.id === "posts")?.label).toBe(
      "Published articles",
    );
  });
});
