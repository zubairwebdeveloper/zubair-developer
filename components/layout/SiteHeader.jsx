"use client";

import { Mail, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { HeaderAuthLink } from "@/components/auth/HeaderAuthLink";
import {
  CommandPalette,
  OPEN_PALETTE_EVENT,
} from "@/components/layout/CommandPalette";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useHeaderUser } from "@/components/layout/useHeaderUser";
import { Container } from "@/components/shared/Container";
import { Button, buttonVariants } from "@/components/ui/button";
import { mainNavigation, primaryCta, siteConfig } from "@/config/site";
import { cn } from "@/lib/utils/cn";

const HIDE_AFTER = 120; // px scrolled before the header may hide
const SHADOW_AFTER = 8; // px scrolled before the border/shadow appears
const SCROLL_DELTA = 6; // px of movement needed to toggle hide/show (stops jitter)

const DEFAULT_PROFILE_LINKS = [
  { label: "My account", href: "/account", icon: UserRound },
];

function isActivePath(pathname, href) {
  if (!pathname || !href) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const openPalette = () => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT));

function isTypingTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
}

/**
 * All props are optional. By default the header reads the signed-in user itself.
 * @param {{ name?: string, email?: string, photoURL?: string } | null} [user]
 * @param {Array<{ label: string, href: string, icon?: React.ElementType }>} [profileLinks]
 * @param {() => (void | Promise<void>)} [onSignOut]
 */
export function SiteHeader({
  user: userProp,
  profileLinks = DEFAULT_PROFILE_LINKS,
  onSignOut: onSignOutProp,
}) {
  const pathname = usePathname();
  const auth = useHeaderUser();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [shortcut, setShortcut] = useState("Ctrl K");
  const headerRef = useRef(null);
  const lastScrollY = useRef(0);

  const user = userProp ?? auth.user;
  const onSignOut = onSignOutProp ?? auth.signOut;
  const checkingAuth = userProp === undefined && auth.loading;

  // Optional: set `availability: "Available for new projects"` in siteConfig
  // to show a status pill on very wide screens. Nothing renders if it's unset.
  const availability =
    typeof siteConfig.availability === "string" &&
    siteConfig.availability.trim()
      ? siteConfig.availability.trim()
      : null;

  const email =
    siteConfig.contactEmail ??
    siteConfig.contact?.email ??
    siteConfig.email ??
    null;

  // Hide on scroll down, show on scroll up. A small delta threshold stops the
  // header flickering on tiny movements, and negative iOS overscroll is clamped.
  useEffect(() => {
    let ticking = false;
    let frame = 0;

    const update = () => {
      const y = Math.max(0, window.scrollY);
      setScrolled(y > SHADOW_AFTER);

      const delta = y - lastScrollY.current;

      if (y <= HIDE_AFTER) {
        setHidden(false);
        lastScrollY.current = y;
      } else if (Math.abs(delta) >= SCROLL_DELTA) {
        setHidden(delta > 0);
        lastScrollY.current = y;
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        frame = requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Always reveal the header after navigating to a new page.
  useEffect(() => {
    setHidden(false);
    lastScrollY.current = Math.max(0, window.scrollY);
  }, [pathname]);

  // Publish the header height so sticky sidebars and anchored sections can
  // offset themselves: `top: var(--site-header-height)`.
  useEffect(() => {
    const node = headerRef.current;
    if (!node) return undefined;

    const root = document.documentElement;
    const publish = () =>
      root.style.setProperty("--site-header-height", `${node.offsetHeight}px`);

    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(node);

    return () => {
      observer.disconnect();
      root.style.removeProperty("--site-header-height");
    };
  }, []);

  // Show the right shortcut hint for the visitor's platform.
  useEffect(() => {
    const platform =
      navigator.userAgentData?.platform ||
      navigator.platform ||
      navigator.userAgent;
    if (/Mac|iPhone|iPad/i.test(platform)) setShortcut("⌘K");
  }, []);

  // "/" opens search, the same convention GitHub and many docs sites use.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (
        event.key !== "/" ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.defaultPrevented ||
        isTypingTarget(event.target)
      ) {
        return;
      }
      event.preventDefault();
      openPalette();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Clicking the logo while already on the home page scrolls back to the top.
  const handleLogoClick = () => {
    if (pathname !== "/" || window.scrollY <= 0) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <>
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-background px-4 py-2 text-sm font-medium text-foreground shadow-lg ring-2 ring-ring focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <header
        ref={headerRef}
        className={cn(
          "sticky top-0 z-40 border-b backdrop-blur-md transition-[transform,background-color,border-color,box-shadow] duration-300 motion-reduce:transition-none print:hidden",
          "focus-within:translate-y-0", // never hide while someone is tabbing through it
          scrolled
            ? "border-border bg-background/85 shadow-sm"
            : "border-transparent bg-background/60",
          hidden && "-translate-y-full",
        )}
      >
        <Container className="flex h-16 items-center justify-between gap-2 sm:h-[4.5rem] sm:gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              onClick={handleLogoClick}
              className="group inline-flex min-w-0 items-center gap-2.5 rounded-md font-heading text-base font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-lg"
            >
              <span
                aria-hidden="true"
                className="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-inset ring-primary/20 transition-transform duration-300 motion-safe:group-hover:scale-105"
              >
                <span className="size-2 rounded-full bg-primary" />
              </span>
              <span className="truncate">{siteConfig.name}</span>
            </Link>

            {availability ? (
              <Link
                href={primaryCta.href}
                className="hidden items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background 2xl:inline-flex"
              >
                <span aria-hidden="true" className="relative flex size-2">
                  <span className="absolute inline-flex size-full rounded-full bg-emerald-500/60 motion-safe:animate-ping" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                {availability}
              </Link>
            ) : null}
          </div>

          <nav
            aria-label="Main"
            className="hidden items-center gap-0.5 lg:flex xl:gap-1"
          >
            {mainNavigation.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative whitespace-nowrap rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground xl:px-3",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    active && "text-foreground",
                  )}
                >
                  {item.label}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-2.5 -bottom-px h-0.5 origin-left rounded-full bg-primary transition-transform duration-300 motion-reduce:transition-none xl:inset-x-3",
                      active
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100",
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openPalette}
              aria-label="Search the site"
              aria-keyshortcuts="Control+K Meta+K /"
              className="cursor-pointer gap-2 px-2.5 text-muted-foreground transition-colors duration-200 hover:text-foreground xl:min-w-44 xl:justify-between"
            >
              <span className="inline-flex items-center gap-2">
                <Search aria-hidden="true" className="size-4" />
                <span className="hidden xl:inline">Search…</span>
              </span>
              <kbd className="hidden rounded border border-border bg-muted/50 px-1.5 py-0.5 font-sans text-[11px] font-medium leading-none xl:inline">
                {shortcut}
              </kbd>
            </Button>

            {email ? (
              <a
                href={`mailto:${email}`}
                aria-label={`Email ${email}`}
                title={email}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "hidden text-muted-foreground transition-colors duration-200 hover:text-foreground lg:inline-flex",
                )}
              >
                <Mail aria-hidden="true" className="size-[18px]" />
              </a>
            ) : null}

            <ThemeToggle />

            {user ? (
              <ProfileMenu
                user={user}
                links={profileLinks}
                onSignOut={onSignOut}
              />
            ) : checkingAuth ? (
              <span
                aria-hidden="true"
                className="hidden size-9 animate-pulse rounded-full bg-muted lg:block"
              />
            ) : (
              <HeaderAuthLink className="hidden lg:inline-flex" />
            )}

            <Link
              href={primaryCta.href}
              className={cn(
                buttonVariants(),
                "group hidden items-center gap-2 whitespace-nowrap sm:inline-flex",
              )}
            >
              {primaryCta.label}
            </Link>

            <MobileNavigation
              user={userProp}
              profileLinks={profileLinks}
              onSignOut={onSignOutProp}
            />
          </div>
        </Container>
      </header>

      <CommandPalette />
    </>
  );
}
