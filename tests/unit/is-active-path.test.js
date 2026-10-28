import { describe, expect, it } from "vitest";

import { isActivePath } from "@/lib/utils/is-active-path";

describe("isActivePath", () => {
  it("treats home as exact-only", () => {
    expect(isActivePath("/", "/")).toBe(true);
    expect(isActivePath("/projects", "/")).toBe(false);
  });

  it("matches a section and its nested routes", () => {
    expect(isActivePath("/projects", "/projects")).toBe(true);
    expect(isActivePath("/projects/saas-dashboard", "/projects")).toBe(true);
    expect(isActivePath("/process", "/projects")).toBe(false);
  });

  it("returns false when either argument is missing", () => {
    expect(isActivePath(null, "/about")).toBe(false);
    expect(isActivePath("/about", "")).toBe(false);
  });
});
