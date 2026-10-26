import { NextResponse } from "next/server";

import { getContentConfig } from "@/config/admin-content";
import { guardAdminRequest } from "@/lib/auth/guard";
import {
  errorResponse,
  parseAndValidate,
} from "@/lib/security/request-validation";
import { handleRouteError } from "@/lib/security/route-errors";
import { isValidDocId } from "@/lib/utils/slugs";
import {
  archiveContent,
  updateContent,
} from "@/services/admin-content.service";

async function resolve(request, params) {
  const { resource, id } = await params;
  const config = getContentConfig(resource);

  if (!config || !isValidDocId(id)) {
    return { response: errorResponse("NOT_FOUND", "Not found.", 404) };
  }

  const guard = await guardAdminRequest(request, config.permission);
  if (guard.response) return guard;

  return { config, id, admin: guard.admin };
}

export async function PATCH(request, { params }) {
  const context = await resolve(request, params);
  if (context.response) return context.response;

  // partial(): sirf bheje gaye fields validate hote hain (jaise sirf status).
  const parsed = await parseAndValidate(
    request,
    context.config.schema.partial(),
  );
  if (parsed.response) return parsed.response;

  if (Object.keys(parsed.data).length === 0) {
    return errorResponse("VALIDATION_ERROR", "Nothing to update.", 422);
  }

  try {
    await updateContent(context.config, context.id, parsed.data, context.admin);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error, "admin/content:update");
  }
}

/** DELETE = archive (soft delete). Data hamesha recoverable rehta hai. */
export async function DELETE(request, { params }) {
  const context = await resolve(request, params);
  if (context.response) return context.response;

  try {
    await archiveContent(context.config, context.id, context.admin);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error, "admin/content:archive");
  }
}
