import { NextResponse } from "next/server";

import { guardAdminRequest } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  errorResponse,
  parseAndValidate,
} from "@/lib/security/request-validation";
import { handleRouteError } from "@/lib/security/route-errors";
import { isValidDocId } from "@/lib/utils/slugs";
import { messageStatusSchema } from "@/lib/validations/lead.schema";
import { setMessageStatus } from "@/services/messages.service";

export async function PATCH(request, { params }) {
  const { id } = await params;
  if (!isValidDocId(id)) return errorResponse("NOT_FOUND", "Not found.", 404);

  const guard = await guardAdminRequest(request, PERMISSIONS.LEADS_MANAGE);
  if (guard.response) return guard.response;

  const parsed = await parseAndValidate(request, messageStatusSchema);
  if (parsed.response) return parsed.response;

  try {
    await setMessageStatus(id, parsed.data.status, guard.admin);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error, "admin/messages:update");
  }
}
