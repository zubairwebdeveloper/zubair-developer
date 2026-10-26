import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/auth/RegisterForm";
import { safeRedirect } from "@/lib/auth/redirect";
import { getCurrentUser } from "@/lib/auth/user-session";

export const metadata = { title: "Create account" };

export default async function RegisterPage({ searchParams }) {
  const { next } = await searchParams;
  const destination = safeRedirect(next);

  if (await getCurrentUser()) redirect(destination);

  return <RegisterForm next={destination} />;
}
