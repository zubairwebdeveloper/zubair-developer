import { NextResponse } from "next/server";

import { guardAdminRequest } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  errorResponse,
  parseAndValidate,
} from "@/lib/security/request-validation";
import { handleRouteError } from "@/lib/security/route-errors";
import { isValidDocId } from "@/lib/utils/slugs";
import { leadUpdateSchema } from "@/lib/validations/lead.schema";
import { updateLead } from "@/services/leads.service";

export async function PATCH(request, { params }) {
  const { id } = await params;
  if (!isValidDocId(id)) return errorResponse("NOT_FOUND", "Not found.", 404);

  const guard = await guardAdminRequest(request, PERMISSIONS.LEADS_MANAGE);
  if (guard.response) return guard.response;

  const parsed = await parseAndValidate(request, leadUpdateSchema);
  if (parsed.response) return parsed.response;

  if (Object.keys(parsed.data).length === 0) {
    return errorResponse("VALIDATION_ERROR", "Nothing to update.", 422);
  }

  try {
    await updateLead(id, parsed.data, guard.admin);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error, "admin/leads:update");
  }
}
