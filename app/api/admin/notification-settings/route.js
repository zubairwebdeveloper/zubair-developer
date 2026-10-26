import { NextResponse } from "next/server";

import { guardAdminRequest } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { parseAndValidate } from "@/lib/security/request-validation";
import { handleRouteError } from "@/lib/security/route-errors";
import { notificationPrefsSchema } from "@/lib/validations/settings.schema";
import { saveNotificationPrefs } from "@/services/notification-settings.service";

export async function PUT(request) {
  const guard = await guardAdminRequest(request, PERMISSIONS.SETTINGS_MANAGE);
  if (guard.response) return guard.response;

  const parsed = await parseAndValidate(request, notificationPrefsSchema);
  if (parsed.response) return parsed.response;

  try {
    await saveNotificationPrefs(parsed.data, guard.admin);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error, "admin/notification-settings:update");
  }
}
