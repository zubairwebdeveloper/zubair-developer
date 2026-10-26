import { NextResponse } from "next/server";

import { guardAdminRequest } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { parseAndValidate } from "@/lib/security/request-validation";
import { handleRouteError } from "@/lib/security/route-errors";
import { notificationsUpdateSchema } from "@/lib/validations/lead.schema";
import {
  markAllNotificationsRead,
  markNotificationsRead,
} from "@/services/notifications.service";

export async function PATCH(request) {
  const guard = await guardAdminRequest(
    request,
    PERMISSIONS.NOTIFICATIONS_VIEW,
  );
  if (guard.response) return guard.response;

  const parsed = await parseAndValidate(request, notificationsUpdateSchema);
  if (parsed.response) return parsed.response;

  try {
    if ("all" in parsed.data) await markAllNotificationsRead();
    else await markNotificationsRead(parsed.data.ids);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error, "admin/notifications:update");
  }
}
