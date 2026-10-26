import { NextResponse } from "next/server";

import { guardAdminRequest } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  errorResponse,
  parseAndValidate,
} from "@/lib/security/request-validation";
import { handleRouteError } from "@/lib/security/route-errors";
import { isValidDocId } from "@/lib/utils/slugs";
import { mediaAltSchema } from "@/lib/validations/admin.schema";
import { deleteMedia, updateMediaAlt } from "@/services/media.service";

async function resolve(request, params) {
  const { id } = await params;
  if (!isValidDocId(id))
    return { response: errorResponse("NOT_FOUND", "Not found.", 404) };

  const guard = await guardAdminRequest(request, PERMISSIONS.MEDIA_MANAGE);
  if (guard.response) return guard;

  return { id, admin: guard.admin };
}

export async function PATCH(request, { params }) {
  const context = await resolve(request, params);
  if (context.response) return context.response;

  const parsed = await parseAndValidate(request, mediaAltSchema);
  if (parsed.response) return parsed.response;

  try {
    await updateMediaAlt(context.id, parsed.data.alt, context.admin);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error, "admin/media:update");
  }
}

export async function DELETE(request, { params }) {
  const context = await resolve(request, params);
  if (context.response) return context.response;

  try {
    await deleteMedia(context.id, context.admin);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error, "admin/media:delete");
  }
}
