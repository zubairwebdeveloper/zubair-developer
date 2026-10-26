"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";

import { AUTH_ROUTES, AUTH_TAB_HREFS } from "./authRoutes";

const tabs = AUTH_ROUTES.filter((route) => AUTH_TAB_HREFS.includes(route.href));

export function AuthTabs() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  // Sirf login/register par tabs dikhao
  if (!tabs.some((tab) => pathname.startsWith(tab.href))) return null;

  return (
    <LayoutGroup id="auth-tabs">
      <nav
        aria-label="Authentication"
        className="bg-muted mb-6 grid w-full grid-cols-2 gap-1 rounded-xl p-1"
      >
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`focus-visible:ring-ring relative flex min-h-10 items-center justify-center rounded-lg px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 ${
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="auth-tab-indicator"
                  aria-hidden="true"
                  className="bg-background absolute inset-0 rounded-lg shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 420, damping: 36 }
                  }
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </LayoutGroup>
  );
}
