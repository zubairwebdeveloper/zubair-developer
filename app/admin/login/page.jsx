import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { LoginForm } from "@/components/admin/LoginForm";
import { getCurrentAdmin } from "@/lib/auth/session";

export const metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

function safeNext(value) {
  const isSafe =
    typeof value === "string" &&
    value.startsWith("/admin") &&
    !value.startsWith("//") &&
    !value.startsWith("/admin/login") &&
    !value.includes("\\");
  return isSafe ? value : "/admin";
}

export default async function AdminLoginPage({ searchParams }) {
  const { next } = await searchParams;
  const destination = safeNext(next);

  if (await getCurrentAdmin()) redirect(destination);

  return (
    <div className="relative isolate flex min-h-svh flex-col overflow-hidden bg-background">
      {/* Background: soft brand glow + faint grid, purely decorative */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute left-1/2 top-[-12rem] h-[28rem] w-[44rem] max-w-[140vw] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.35)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.35)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      </div>

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md text-sm font-semibold tracking-tight text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="size-4" aria-hidden="true" />
          </span>
          Zubair Developer
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to site
        </Link>
      </header>

      <main
        id="main-content"
        className="flex flex-1 items-center justify-center px-4 py-8 sm:py-12"
      >
        <div className="w-full max-w-md">
          <LoginForm next={destination} />
        </div>
      </main>

      <footer className="px-4 pb-6 text-center text-xs text-muted-foreground">
        Restricted area. Authorized administrators only.
      </footer>
    </div>
  );
}
