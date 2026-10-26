import { NextResponse } from "next/server";

import { guardAdminRequest } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { parseAndValidate } from "@/lib/security/request-validation";
import { handleRouteError } from "@/lib/security/route-errors";
import { aiRestoreSchema } from "@/lib/validations/ai.schema";
import { restoreAiVersion } from "@/services/ai-settings.service";

export async function POST(request) {
  const guard = await guardAdminRequest(request, PERMISSIONS.AI_MANAGE);
  if (guard.response) return guard.response;

  const parsed = await parseAndValidate(request, aiRestoreSchema);
  if (parsed.response) return parsed.response;

  try {
    const { version } = await restoreAiVersion(
      parsed.data.version,
      guard.admin,
    );
    return NextResponse.json({ ok: true, version });
  } catch (error) {
    return handleRouteError(error, "admin/ai:restore");
  }
}
