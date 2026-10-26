import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/LoginForm";
import { safeRedirect } from "@/lib/auth/redirect";
import { getCurrentUser } from "@/lib/auth/user-session";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }) {
  const { next } = await searchParams;
  const destination = safeRedirect(next);

  if (await getCurrentUser()) redirect(destination);

  return <LoginForm next={destination} />;
}
