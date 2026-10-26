export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  EDITOR: "EDITOR",
  SALES: "SALES",
  SUPPORT: "SUPPORT",
};

export const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard:view",
  SETTINGS_MANAGE: "settings:manage",
  PROJECTS_MANAGE: "projects:manage",
  SERVICES_MANAGE: "services:manage",
  LEADS_READ: "leads:read",
  LEADS_MANAGE: "leads:manage",
  CONTENT_MANAGE: "content:manage",
  MEDIA_MANAGE: "media:manage",
  AI_MANAGE: "ai:manage",
  NOTIFICATIONS_VIEW: "notifications:view",
  TEAM_MANAGE: "team:manage",
  AUDIT_VIEW: "audit:view",
};

const ALL_PERMISSIONS = Object.values(PERMISSIONS);

const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ALL_PERMISSIONS,
  // Team management sirf SUPER_ADMIN ke paas hai, taake privilege escalation na ho.
  ADMIN: ALL_PERMISSIONS.filter((p) => p !== PERMISSIONS.TEAM_MANAGE),
  EDITOR: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PROJECTS_MANAGE,
    PERMISSIONS.SERVICES_MANAGE,
    PERMISSIONS.CONTENT_MANAGE,
    PERMISSIONS.MEDIA_MANAGE,
    PERMISSIONS.NOTIFICATIONS_VIEW,
  ],
  SALES: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.LEADS_READ,
    PERMISSIONS.LEADS_MANAGE,
    PERMISSIONS.NOTIFICATIONS_VIEW,
  ],
  SUPPORT: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.LEADS_READ,
    PERMISSIONS.NOTIFICATIONS_VIEW,
  ],
};

export function isValidRole(role) {
  return Object.hasOwn(ROLE_PERMISSIONS, role);
}

export function hasPermission(role, permission) {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
