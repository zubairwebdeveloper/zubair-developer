// components/layout/MobileNavigation.jsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  FiArrowRight,
  FiLogOut,
  FiMail,
  FiMenu,
  FiSearch,
  FiUser,
} from "react-icons/fi";
import { Laptop, Moon, Sun } from "lucide-react";

import { HeaderAuthLink } from "@/components/auth/HeaderAuthLink";
import { OPEN_PALETTE_EVENT } from "@/components/layout/CommandPalette";
import { useHeaderUser } from "@/components/layout/useHeaderUser";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { mainNavigation, primaryCta, siteConfig } from "@/config/site";
import { cn } from "@/lib/utils/cn";

const DEFAULT_PROFILE_LINKS = [
  { label: "My account", href: "/account", icon: FiUser },
];

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
];

const rowClass =
  "group relative flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-3 text-base font-medium text-foreground/80 transition-colors duration-200 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const revealClass =
  "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-right-4 motion-safe:duration-300 motion-safe:fill-mode-both";

function isActivePath(pathname, href) {
  if (!pathname || !href) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getInitials(name = "", email = "") {
  const source = name.trim() || email.trim();
  if (!source) return "?";
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[1][0] : "";
  return (first + last).toUpperCase();
}

/**
 * All props are optional. By default the menu reads the signed-in user itself.
 * @param {{ name?: string, email?: string, photoURL?: string } | null} [user]
 * @param {Array<{ label: string, href: string, icon?: React.ElementType }>} [profileLinks]
 * @param {() => (void | Promise<void>)} [onSignOut]
 */
export function MobileNavigation({
  user: userProp,
  profileLinks = DEFAULT_PROFILE_LINKS,
  onSignOut: onSignOutProp,
}) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const auth = useHeaderUser();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const user = userProp ?? auth.user;
  const onSignOut = onSignOutProp ?? auth.signOut;
  const checkingAuth = userProp === undefined && auth.loading;
  const email = siteConfig?.contact?.email ?? siteConfig?.email ?? null;
  const displayName = user?.name || user?.email || "Account";
  const activeTheme = mounted ? (theme ?? "system") : "system";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close the menu on any route change (including browser back/forward).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function openSearch() {
    setOpen(false);
    // Wait for the sheet to release focus before the palette opens.
    setTimeout(() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT)), 250);
  }

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await onSignOut?.();
      setOpen(false);
    } catch (error) {
      console.error("[MobileNavigation] Sign out failed:", error);
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="cursor-pointer lg:hidden"
        aria-label="Open navigation menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <FiMenu aria-hidden="true" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 p-0 sm:max-w-sm"
        >
          <SheetHeader className="border-b border-border/70 px-5 py-4 text-left">
            <SheetTitle className="text-base font-semibold tracking-tight">
              Zubair Developer
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              {siteConfig.name} builds full stack web products, SaaS solutions
              and AI chatbot automation.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-4">
            {user ? (
              <div className="mb-3 flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
                <span className="inline-flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary ring-1 ring-inset ring-primary/25">
                  {user.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.photoURL}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="size-full object-cover"
                    />
                  ) : (
                    <span aria-hidden="true">
                      {getInitials(user.name, user.email)}
                    </span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {displayName}
                  </span>
                  {user.name && user.email ? (
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  ) : null}
                </span>
              </div>
            ) : null}

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={openSearch}
              className="mb-3 h-12 w-full cursor-pointer justify-start gap-3 rounded-xl px-4 text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              <FiSearch aria-hidden="true" className="size-4" />
              Search the site
            </Button>

            <nav aria-label="Mobile">
              <ul className="flex flex-col gap-1">
                {mainNavigation.map((item, index) => {
                  const active = isActivePath(pathname, item.href);

                  return (
                    <li
                      key={item.href}
                      style={{ animationDelay: `${index * 40}ms` }}
                      className={revealClass}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          rowClass,
                          active && "bg-primary/10 text-foreground",
                        )}
                      >
                        {active ? (
                          <span
                            aria-hidden="true"
                            className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-primary"
                          />
                        ) : null}
                        <span>{item.label}</span>
                        <FiArrowRight
                          aria-hidden="true"
                          className={cn(
                            "size-4 shrink-0 text-muted-foreground transition-all duration-200",
                            active
                              ? "text-primary opacity-100"
                              : "opacity-0 motion-safe:-translate-x-1 group-hover:opacity-100 motion-safe:group-hover:translate-x-0",
                          )}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {user && profileLinks.length > 0 ? (
              <nav
                aria-label="Account"
                className="mt-4 border-t border-border/70 pt-4"
              >
                <p className="px-4 pb-2 text-xs font-medium text-muted-foreground">
                  Account
                </p>
                <ul className="flex flex-col gap-1">
                  {profileLinks.map(({ label, href, icon: Icon = FiUser }) => {
                    const active = isActivePath(pathname, href);

                    return (
                      <li key={href}>
                        <Link
                          href={href}
                          onClick={() => setOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            rowClass,
                            "justify-start",
                            active && "bg-primary/10 text-foreground",
                          )}
                        >
                          <Icon
                            aria-hidden="true"
                            className="size-4 shrink-0 text-muted-foreground"
                          />
                          <span className="flex-1">{label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            ) : null}

            {/* Appearance: the desktop header has a theme switcher in ThemeToggle,
                but it lives outside this sheet, so mobile visitors had no way to
                reach it without closing the menu first. This mirrors it inline. */}
            <div className="mt-4 border-t border-border/70 pt-4">
              <p className="px-4 pb-2 text-xs font-medium text-muted-foreground">
                Appearance
              </p>
              <div
                role="radiogroup"
                aria-label="Theme"
                className="grid grid-cols-3 gap-1.5 px-1"
              >
                {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
                  const selected = mounted && activeTheme === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setTheme(value)}
                      className={cn(
                        "flex min-h-11 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        selected
                          ? "border-primary/30 bg-primary/10 text-foreground"
                          : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground",
                      )}
                    >
                      <Icon aria-hidden="true" className="size-4" />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-border/70 bg-muted/30 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {user ? (
              <Button
                type="button"
                variant="outline"
                disabled={signingOut}
                onClick={handleSignOut}
                className="h-11 w-full cursor-pointer justify-center gap-2 rounded-xl border-destructive/25 text-destructive transition-colors duration-200 hover:bg-destructive/10 hover:text-destructive"
              >
                <FiLogOut aria-hidden="true" className="size-4" />
                {signingOut ? "Signing out…" : "Sign out"}
              </Button>
            ) : checkingAuth ? (
              <span
                aria-hidden="true"
                className="h-11 w-full animate-pulse rounded-xl bg-muted"
              />
            ) : (
              <HeaderAuthLink
                onNavigate={() => setOpen(false)}
                className="w-full"
              />
            )}

            <Link
              href={primaryCta.href}
              onClick={() => setOpen(false)}
              className={cn(buttonVariants({ size: "lg" }), "group w-full")}
            >
              {primaryCta.label}
              <FiArrowRight
                aria-hidden="true"
                className="size-4 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5"
              />
            </Link>

            {email ? (
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center justify-center gap-2 rounded-md py-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <FiMail aria-hidden="true" className="size-4 shrink-0" />
                <span className="break-all">{email}</span>
              </a>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
