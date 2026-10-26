import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/session", () => ({ getCurrentAdmin: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url) => {
    throw new Error(`REDIRECT:${url}`);
  }),
  notFound: vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
}));

import { guardAdminRequest } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { requireApiAdmin, requirePageAdmin } from "@/lib/auth/require-admin";
import { getCurrentAdmin } from "@/lib/auth/session";

const sales = { uid: "u1", role: "SALES", email: "s@example.com", name: "Sam" };
const request = (method, origin) =>
  new Request("http://localhost/api/admin/x", {
    method,
    headers: origin ? { origin } : {},
  });

beforeEach(() => getCurrentAdmin.mockResolvedValue(null));

describe("requireApiAdmin", () => {
  it("returns 401 without a session", async () => {
    const result = await requireApiAdmin(PERMISSIONS.LEADS_READ);
    expect(result.response.status).toBe(401);
  });

  it("returns 403 when the role lacks the permission", async () => {
    getCurrentAdmin.mockResolvedValue(sales);
    const result = await requireApiAdmin(PERMISSIONS.PROJECTS_MANAGE);
    expect(result.response.status).toBe(403);
  });

  it("returns the admin when allowed", async () => {
    getCurrentAdmin.mockResolvedValue(sales);
    const result = await requireApiAdmin(PERMISSIONS.LEADS_MANAGE);
    expect(result.admin).toEqual(sales);
  });
});

describe("requirePageAdmin", () => {
  it("redirects anonymous visitors to login", async () => {
    await expect(requirePageAdmin()).rejects.toThrow("REDIRECT:/login");
  });

  it("shows 404 when the role lacks the permission", async () => {
    getCurrentAdmin.mockResolvedValue(sales);
    await expect(requirePageAdmin(PERMISSIONS.TEAM_MANAGE)).rejects.toThrow(
      "NOT_FOUND",
    );
  });
});

describe("guardAdminRequest", () => {
  it("rejects cross-origin mutations before checking the session", async () => {
    getCurrentAdmin.mockResolvedValue(sales);
    const result = await guardAdminRequest(
      request("POST", "http://evil.example"),
      PERMISSIONS.LEADS_MANAGE,
    );
    expect(result.response.status).toBe(403);
    expect(getCurrentAdmin).not.toHaveBeenCalled();
  });

  it("rejects mutations without an Origin header", async () => {
    const result = await guardAdminRequest(
      request("PATCH"),
      PERMISSIONS.LEADS_MANAGE,
    );
    expect(result.response.status).toBe(403);
  });

  it("allows same-origin mutations for permitted roles and read-only GETs without Origin", async () => {
    getCurrentAdmin.mockResolvedValue(sales);
    const post = await guardAdminRequest(
      request("POST", "http://localhost"),
      PERMISSIONS.LEADS_MANAGE,
    );
    expect(post.admin).toBeDefined();

    const get = await guardAdminRequest(request("GET"), PERMISSIONS.LEADS_READ);
    expect(get.admin).toBeDefined();
  });
});
