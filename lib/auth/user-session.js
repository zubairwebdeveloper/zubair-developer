import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

import { USER_SESSION_COOKIE } from "@/constants/auth";
import { getAdminAuth } from "@/lib/firebase/admin";
import { NotConfiguredError } from "@/lib/utils/errors";

export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(USER_SESSION_COOKIE)?.value;
  if (!sessionCookie) return null;

  try {
    const auth = getAdminAuth();
    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    const record = await auth.getUser(decoded.uid);
    if (record.disabled) return null;

    const providers = record.providerData.map(
      (provider) => provider.providerId,
    );

    return {
      uid: record.uid,
      email: record.email ?? null,
      name: record.displayName ?? null,
      emailVerified: record.emailVerified,
      providers,
      hasPassword: providers.includes("password"),
      createdAt: record.metadata.creationTime
        ? new Date(record.metadata.creationTime).toISOString()
        : null,
    };
  } catch (error) {
    const expected =
      error instanceof NotConfiguredError ||
      String(error?.code).startsWith("auth/");
    if (!expected) console.error("[user-auth] session check failed:", error);
    return null;
  }
});
