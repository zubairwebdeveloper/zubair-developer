import { NextResponse } from "next/server";

import { guardAdminRequest } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { parseAndValidate } from "@/lib/security/request-validation";
import { handleRouteError } from "@/lib/security/route-errors";
import { leadBulkSchema } from "@/lib/validations/lead.schema";
import { bulkUpdateLeadStatus } from "@/services/leads.service";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request) {
  const guard = await guardAdminRequest(request, PERMISSIONS.LEADS_MANAGE);
  if (guard.response) return guard.response;

  const parsed = await parseAndValidate(request, leadBulkSchema);
  if (parsed.response) return parsed.response;

  try {
    const summary = await bulkUpdateLeadStatus(
      parsed.data.ids,
      parsed.data.status,
      guard.admin,
    );
    return NextResponse.json({ ok: true, ...summary });
  } catch (error) {
    return handleRouteError(error, "admin/leads:bulk");
  }
}
