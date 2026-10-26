import { NextResponse } from "next/server";

import { guardAdminRequest } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { parseAndValidate } from "@/lib/security/request-validation";
import { handleRouteError } from "@/lib/security/route-errors";
import { profileSchema } from "@/lib/validations/settings.schema";
import { saveProfile } from "@/services/settings.admin.service";

export async function PUT(request) {
  const guard = await guardAdminRequest(request, PERMISSIONS.SETTINGS_MANAGE);
  if (guard.response) return guard.response;

  const parsed = await parseAndValidate(request, profileSchema);
  if (parsed.response) return parsed.response;

  try {
    await saveProfile(parsed.data, guard.admin);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error, "admin/profile:update");
  }
}
