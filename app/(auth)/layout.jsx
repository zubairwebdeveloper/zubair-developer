import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { AuthTabs } from "@/components/auth/AuthTabs";
import { AuthTransition } from "@/components/auth/AuthTransition";

export const metadata = { robots: { index: false, follow: false } };

export default function AuthLayout({ children }) {
  return (
    <div className="mx-auto grid min-h-svh max-w-7xl lg:grid-cols-2">
      <AuthBrandPanel />

      <main
        id="main-content"
        className="relative flex min-h-svh flex-col overflow-x-clip px-4 py-6 sm:px-6 lg:min-h-0 lg:items-center lg:justify-center lg:py-16"
      >
        {/* Halka sa background glow (decorative) */}
        <div
          aria-hidden="true"
          className="bg-primary/10 pointer-events-none absolute -top-24 right-0 size-72 rounded-full blur-3xl"
        />

        <div className="flex items-center justify-between gap-4 pt-[env(safe-area-inset-top,0px)] lg:absolute lg:top-4 lg:right-4 lg:left-4 lg:px-2">
          <Link
            href="/"
            className="group text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex min-h-10 items-center gap-1.5 text-sm underline-offset-4 outline-none transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 lg:invisible"
          >
            <FiArrowLeft
              aria-hidden="true"
              className="size-3.5 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5"
            />
            Back to site
          </Link>
        </div>

        <div className="relative flex w-full flex-1 flex-col items-center justify-center py-8 lg:flex-none lg:py-0">
          <div className="w-full max-w-sm">
            <AuthTabs />
            <AuthTransition>{children}</AuthTransition>
          </div>
        </div>
      </main>
    </div>
  );
}
