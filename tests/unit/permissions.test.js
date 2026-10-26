import { describe, expect, it } from "vitest";

import {
  hasPermission,
  isValidRole,
  PERMISSIONS,
  ROLES,
} from "@/lib/auth/permissions";

describe("permissions", () => {
  it("gives SUPER_ADMIN every permission", () => {
    Object.values(PERMISSIONS).forEach((permission) => {
      expect(hasPermission(ROLES.SUPER_ADMIN, permission)).toBe(true);
    });
  });

  it("keeps team management exclusive to SUPER_ADMIN", () => {
    Object.values(ROLES)
      .filter((role) => role !== ROLES.SUPER_ADMIN)
      .forEach((role) =>
        expect(hasPermission(role, PERMISSIONS.TEAM_MANAGE)).toBe(false),
      );
  });

  it("lets ADMIN do everything else", () => {
    expect(hasPermission(ROLES.ADMIN, PERMISSIONS.AI_MANAGE)).toBe(true);
    expect(hasPermission(ROLES.ADMIN, PERMISSIONS.AUDIT_VIEW)).toBe(true);
  });

  it("limits SALES to leads and notifications", () => {
    expect(hasPermission(ROLES.SALES, PERMISSIONS.LEADS_MANAGE)).toBe(true);
    expect(hasPermission(ROLES.SALES, PERMISSIONS.PROJECTS_MANAGE)).toBe(false);
    expect(hasPermission(ROLES.SALES, PERMISSIONS.AI_MANAGE)).toBe(false);
  });

  it("makes SUPPORT read-only on leads", () => {
    expect(hasPermission(ROLES.SUPPORT, PERMISSIONS.LEADS_READ)).toBe(true);
    expect(hasPermission(ROLES.SUPPORT, PERMISSIONS.LEADS_MANAGE)).toBe(false);
  });

  it("keeps EDITOR away from leads and settings", () => {
    expect(hasPermission(ROLES.EDITOR, PERMISSIONS.PROJECTS_MANAGE)).toBe(true);
    expect(hasPermission(ROLES.EDITOR, PERMISSIONS.LEADS_READ)).toBe(false);
    expect(hasPermission(ROLES.EDITOR, PERMISSIONS.SETTINGS_MANAGE)).toBe(
      false,
    );
  });

  it("denies unknown roles, including prototype keys", () => {
    expect(hasPermission("HACKER", PERMISSIONS.DASHBOARD_VIEW)).toBe(false);
    expect(hasPermission(undefined, PERMISSIONS.DASHBOARD_VIEW)).toBe(false);
    expect(isValidRole("toString")).toBe(false);
    expect(isValidRole("__proto__")).toBe(false);
    expect(isValidRole("ADMIN")).toBe(true);
  });
});
