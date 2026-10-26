import { NextResponse } from "next/server";

import { guardAdminRequest } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { parseAndValidate } from "@/lib/security/request-validation";
import { handleRouteError } from "@/lib/security/route-errors";
import { teamInviteSchema } from "@/lib/validations/admin.schema";
import { addTeamMember } from "@/services/team.service";

export async function POST(request) {
  const guard = await guardAdminRequest(request, PERMISSIONS.TEAM_MANAGE);
  if (guard.response) return guard.response;

  const parsed = await parseAndValidate(request, teamInviteSchema);
  if (parsed.response) return parsed.response;

  try {
    const result = await addTeamMember(parsed.data, guard.admin);
    return NextResponse.json(
      { ok: true, created: result.created },
      { status: 201 },
    );
  } catch (error) {
    return handleRouteError(error, "admin/team:add");
  }
}
