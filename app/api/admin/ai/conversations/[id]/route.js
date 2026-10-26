import { NextResponse } from "next/server";

import { guardAdminRequest } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { errorResponse } from "@/lib/security/request-validation";
import { handleRouteError } from "@/lib/security/route-errors";
import { isValidDocId } from "@/lib/utils/slugs";
import { deleteConversation } from "@/services/ai-conversations.service";

export async function DELETE(request, { params }) {
  const { id } = await params;
  if (!isValidDocId(id)) return errorResponse("NOT_FOUND", "Not found.", 404);

  const guard = await guardAdminRequest(request, PERMISSIONS.AI_MANAGE);
  if (guard.response) return guard.response;

  try {
    await deleteConversation(id, guard.admin);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error, "admin/ai:conversation-delete");
  }
}
