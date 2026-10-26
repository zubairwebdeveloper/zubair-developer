import { NextResponse } from "next/server";

import { getContentConfig } from "@/config/admin-content";
import { guardAdminRequest } from "@/lib/auth/guard";
import {
  errorResponse,
  parseAndValidate,
} from "@/lib/security/request-validation";
import { handleRouteError } from "@/lib/security/route-errors";
import { bulkStatusSchema } from "@/lib/validations/admin.schema";
import { bulkSetStatus } from "@/services/admin-content.service";

export async function POST(request, { params }) {
  const { resource } = await params;
  const config = getContentConfig(resource);
  if (!config) return errorResponse("NOT_FOUND", "Unknown resource.", 404);

  const guard = await guardAdminRequest(request, config.permission);
  if (guard.response) return guard.response;

  const parsed = await parseAndValidate(request, bulkStatusSchema);
  if (parsed.response) return parsed.response;

  try {
    const count = await bulkSetStatus(
      config,
      parsed.data.ids,
      parsed.data.status,
      guard.admin,
    );
    return NextResponse.json({ ok: true, count });
  } catch (error) {
    return handleRouteError(error, "admin/content:bulk");
  }
}
