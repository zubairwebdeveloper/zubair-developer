import { NextResponse } from "next/server";

import { guardAdminRequest } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { parseAndValidate } from "@/lib/security/request-validation";
import { handleRouteError } from "@/lib/security/route-errors";
import { announcementSchema } from "@/lib/validations/settings.schema";
import { saveAnnouncement } from "@/services/settings.admin.service";

export async function PUT(request) {
  const guard = await guardAdminRequest(request, PERMISSIONS.SETTINGS_MANAGE);
  if (guard.response) return guard.response;

  const parsed = await parseAndValidate(request, announcementSchema);
  if (parsed.response) return parsed.response;

  try {
    await saveAnnouncement(parsed.data, guard.admin);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error, "admin/settings:update");
  }
}
