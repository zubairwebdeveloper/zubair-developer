import { NextResponse } from "next/server";

import { COLLECTIONS } from "@/constants/collections";
import { guardUserRequest } from "@/lib/auth/require-user";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { serverTimestamp } from "@/lib/firebase/firestore";
import { parseAndValidate } from "@/lib/security/request-validation";
import { handleRouteError } from "@/lib/security/route-errors";
import { profileNameSchema } from "@/lib/validations/user-auth.schema";

export async function PATCH(request) {
  const guard = await guardUserRequest(request);
  if (guard.response) return guard.response;

  const parsed = await parseAndValidate(request, profileNameSchema);
  if (parsed.response) return parsed.response;

  try {
    const { uid } = guard.user;
    await getAdminAuth().updateUser(uid, {
      displayName: parsed.data.displayName,
    });
    await getAdminDb()
      .collection(COLLECTIONS.users)
      .doc(uid)
      .set(
        { displayName: parsed.data.displayName, updatedAt: serverTimestamp() },
        { merge: true },
      );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error, "api/auth/profile");
  }
}
