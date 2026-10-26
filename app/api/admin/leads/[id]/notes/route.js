import { NextResponse } from "next/server";

import { guardAdminRequest } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  errorResponse,
  parseAndValidate,
} from "@/lib/security/request-validation";
import { handleRouteError } from "@/lib/security/route-errors";
import { isValidDocId } from "@/lib/utils/slugs";
import { leadNoteSchema } from "@/lib/validations/lead.schema";
import { addLeadNote } from "@/services/leads.service";

export async function POST(request, { params }) {
  const { id } = await params;
  if (!isValidDocId(id)) return errorResponse("NOT_FOUND", "Not found.", 404);

  const guard = await guardAdminRequest(request, PERMISSIONS.LEADS_MANAGE);
  if (guard.response) return guard.response;

  const parsed = await parseAndValidate(request, leadNoteSchema);
  if (parsed.response) return parsed.response;

  try {
    await addLeadNote(id, parsed.data.text, guard.admin);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "admin/leads:note");
  }
}
