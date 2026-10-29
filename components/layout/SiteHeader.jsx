"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "motion/react";
import {
  ArrowRight,
  ArrowUp,
  Bot,
  Check,
  ChevronDown,
  Copy,
  Globe,
  Search,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { HeaderAuthLink } from "@/components/auth/HeaderAuthLink";
import {
  CommandPalette,
  OPEN_PALETTE_EVENT,
} from "@/components/layout/CommandPalette";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useHeaderUser } from "@/components/layout/useHeaderUser";
import { Button, buttonVariants } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/Magnetic";
import { mainNavigation, primaryCta, siteConfig } from "@/config/site";
import { isActivePath } from "@/lib/utils/is-active-path";
import { cn } from "@/lib/utils/cn";

const HIDE_AFTER = 120;
const SHADOW_AFTER = 8;
const SCROLL_DELTA = 6;
const BACK_TO_TOP_AFTER = 600;
const ANNOUNCE_KEY = "site-announcement-dismissed";
const subscribeStaticPlatform = () => () => {};

function isApplePlatform() {
  const platform =
    navigator.userAgentData?.platform || navigator.platform || navigator.userAgent;
  return /Mac|iPhone|iPad/i.test(platform);
}
const TIME_ZONE = "Asia/Karachi";
const TIME_LABEL = "Lahore";
const MENU_CLOSE_DELAY = 140;

const DEFAULT_PROFILE_LINKS = [
  { label: "My account", href: "/account", icon: UserRound },
];

// Dropdown menus, keyed by the nav item's href.
const MENUS = {
  "/services": {
    items: [
      {
        icon: Globe,
        title: "Web Development",
        description: "Websites, SaaS apps and dashboards",
        href: "/services?category=web",
      },
      {
        icon: Bot,
        title: "Chatbot & Automation",
        description: "ManyChat flows, DM and lead capture",
        href: "/services?category=automation",
      },
    ],
    footer: { label: "View all services", href: "/services" },
  },
};

// Keyboard-only focus indicator (never a permanent outline).
const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const openPalette = () => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT));

function isTypingTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
}

function formatLocalTime() {
  try {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: TIME_ZONE,
    }).format(new Date());
  } catch {
    return "";
  }
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
  announcement,
}) {
  const pathname = usePathname();
  const auth = useHeaderUser();
  const reduce = useReducedMotion();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const isApple = useSyncExternalStore(
    subscribeStaticPlatform,
    isApplePlatform,
    () => false,
  );
  const shortcut = isApple ? "⌘K" : "Ctrl K";
  const [announceOpen, setAnnounceOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [copied, setCopied] = useState(false);
  const [localTime, setLocalTime] = useState("");
  const headerRef = useRef(null);
  const lastScrollY = useRef(0);
  const closeTimer = useRef(null);
  const copyTimer = useRef(null);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    mass: 0.3,
  });

  const user = userProp ?? auth.user;
  const onSignOut = onSignOutProp ?? auth.signOut;
  const checkingAuth = userProp === undefined && auth.loading;

  const availability =
    typeof siteConfig.availability === "string" &&
    siteConfig.availability.trim()
      ? siteConfig.availability.trim()
      : null;

  const isAnnouncementActive = useCallback((item) => {
    if (!item || !item.enabled || !String(item.message || "").trim()) {
      return false;
    }

    const now = Date.now();
    if (item.startsAt && new Date(item.startsAt).getTime() > now) return false;
    if (item.endsAt && new Date(item.endsAt).getTime() <= now) return false;

    return true;
  }, []);

  const announcementMessage = useMemo(
    () =>
      announcement && isAnnouncementActive(announcement)
        ? {
            message: String(announcement.message || "").trim(),
            href: announcement.href || "",
            linkLabel: announcement.linkLabel || "Learn more",
          }
        : null,
    [announcement, isAnnouncementActive],
  );

  const email =
    siteConfig.contactEmail ??
    siteConfig.contact?.email ??
    siteConfig.email ??
    null;

  /* ── Announcement bar ───────────────────────────────────────────── */
  useEffect(() => {
    const banner = announcementMessage || (availability ? { message: availability } : null);
    if (!banner) return;
    const frame = window.requestAnimationFrame(() => {
      try {
        setAnnounceOpen(sessionStorage.getItem(ANNOUNCE_KEY) !== "1");
      } catch {
        setAnnounceOpen(true);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [announcementMessage, availability]);

  const dismissAnnouncement = () => {
    setAnnounceOpen(false);
    try {
      sessionStorage.setItem(ANNOUNCE_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  /* ── Live local time ────────────────────────────────────────────── */
  useEffect(() => {
    const frame = window.requestAnimationFrame(() =>
      setLocalTime(formatLocalTime()),
    );
    const id = window.setInterval(() => setLocalTime(formatLocalTime()), 30000);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(id);
    };
  }, []);

  /* ── Scroll behaviour ───────────────────────────────────────────── */
  useEffect(() => {
    let ticking = false;
    let frame = 0;

    const update = () => {
      const y = Math.max(0, window.scrollY);
      setScrolled(y > SHADOW_AFTER);
      setShowTop(y > BACK_TO_TOP_AFTER);

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
        ticking = true;
        frame = requestAnimationFrame(update);
      }
    };

    frame = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Hide the header → also close any open dropdown
  useEffect(() => {
    if (!hidden) return undefined;
    const frame = window.requestAnimationFrame(() => setOpenMenu(null));
    return () => window.cancelAnimationFrame(frame);
  }, [hidden]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setHidden(false);
      setOpenMenu(null);
      lastScrollY.current = Math.max(0, window.scrollY);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

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

  /* ── Keyboard: "/" opens search, Escape closes dropdown ─────────── */
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
        return;
      }
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

  useEffect(
    () => () => {
      window.clearTimeout(closeTimer.current);
      window.clearTimeout(copyTimer.current);
    },
    [],
  );

  /* ── Dropdown helpers ───────────────────────────────────────────── */
  const openNow = useCallback((href) => {
    window.clearTimeout(closeTimer.current);
    setOpenMenu(href);
  }, []);

  const closeSoon = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(
      () => setOpenMenu(null),
      MENU_CLOSE_DELAY,
    );
  }, []);

  const handleBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) closeSoon();
  };

  /* ── Actions ────────────────────────────────────────────────────── */
  const handleLogoClick = () => {
    if (pathname !== "/" || window.scrollY <= 0) return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  };

  const scrollToTop = () => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  };

  const copyEmail = async () => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <>
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-background px-4 py-2 text-sm font-medium text-foreground shadow-lg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <header
        id="top"
        ref={headerRef}
        className={cn(
          "sticky top-0 z-40 transition-[transform,box-shadow,background-color] duration-300 motion-reduce:transition-none print:hidden",
          "focus-within:translate-y-0",
          scrolled
            ? "glass border-b border-border/50 shadow-md shadow-black/5 dark:shadow-black/30"
            : "bg-background shadow-none",
          hidden && "-translate-y-full",
        )}
      >
        {/* Announcement bar */}
        {(announcementMessage || availability) && announceOpen ? (
          <div className="bg-foreground text-background">
            <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2 text-xs sm:px-6 sm:text-sm">
              <span
                aria-hidden="true"
                className="relative flex size-2 shrink-0"
              >
                <span className="absolute inline-flex size-full rounded-full bg-emerald-400/70 motion-safe:animate-ping" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              <p className="truncate">
                {announcementMessage?.message || availability}
              </p>

              {localTime && !announcementMessage ? (
                <span className="hidden shrink-0 items-center gap-1.5 opacity-70 md:inline-flex">
                  <span aria-hidden="true">·</span>
                  <span>
                    {TIME_LABEL} {localTime}
                  </span>
                </span>
              ) : null}

              {announcementMessage?.href ? (
                <Link
                  href={announcementMessage.href}
                  className={cn(
                    "group hidden shrink-0 items-center gap-1 rounded-sm font-medium underline-offset-4 hover:underline sm:inline-flex",
                    FOCUS,
                  )}
                >
                  {announcementMessage.linkLabel}
                  <ArrowRight
                    aria-hidden="true"
                    className="size-3.5 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5"
                  />
                </Link>
              ) : (
                <Link
                  href={primaryCta.href}
                  className={cn(
                    "group hidden shrink-0 items-center gap-1 rounded-sm font-medium underline-offset-4 hover:underline sm:inline-flex",
                    FOCUS,
                  )}
                >
                  {primaryCta.label}
                  <ArrowRight
                    aria-hidden="true"
                    className="size-3.5 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5"
                  />
                </Link>
              )}
              <button
                type="button"
                onClick={dismissAnnouncement}
                aria-label="Dismiss announcement"
                className={cn(
                  "ml-1 inline-flex size-6 shrink-0 items-center justify-center rounded-sm opacity-70 transition-opacity hover:opacity-100",
                  FOCUS,
                )}
              >
                <X aria-hidden="true" className="size-3.5" />
              </button>
            </div>
          </div>
        ) : null}

        <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:h-[4.25rem] sm:gap-4 sm:px-6">
          {/* Brand */}
          <Link
            href="/"
            onClick={handleLogoClick}
            className={cn(
              "group inline-flex min-w-0 items-center gap-2.5 rounded-md font-heading text-base font-semibold tracking-tight text-foreground transition-colors duration-200 motion-safe:group-hover:text-foreground sm:text-lg",
              FOCUS,
            )}
          >
            <span
              aria-hidden="true"
              className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary text-primary-foreground shadow-sm ring-1 ring-inset ring-primary/20 transition-all duration-200 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:scale-[1.04]"
            >
             Z
            </span>
            <span className="truncate min-[380px]:inline">{siteConfig.name}</span>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {mainNavigation.map((item) => {
              const active = isActivePath(pathname, item.href);
              const menu = MENUS[item.href];
              const isOpen = openMenu === item.href;

              const linkClasses = cn(
                "group relative inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground",
                (active || isOpen) && "text-foreground",
                FOCUS,
              );

              const underline = (
                <motion.span
                  aria-hidden="true"
                  className="absolute -bottom-1 left-0 h-0.5 w-full origin-left rounded-full bg-primary"
                  initial={false}
                  animate={{ scaleX: active || isOpen ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              );

              if (!menu) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={linkClasses}
                  >
                    <span className="relative">
                      {item.label}
                      {underline}
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className={cn(
                        "size-3.5 -translate-x-1 opacity-0 transition-all duration-300 ease-out motion-reduce:transition-none",
                        "w-0 group-hover:ml-1.5 group-hover:w-3.5 group-hover:translate-x-0 group-hover:opacity-100",
                        "group-focus-visible:ml-1.5 group-focus-visible:w-3.5 group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
                      )}
                    />
                  </Link>
                );
              }

              return (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => openNow(item.href)}
                  onMouseLeave={closeSoon}
                  onFocus={() => openNow(item.href)}
                  onBlur={handleBlur}
                >
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    className={linkClasses}
                  >
                    <span className="relative">
                      {item.label}
                      {underline}
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className={cn(
                        "ml-1 size-3.5 transition-transform duration-200 motion-reduce:transition-none",
                        isOpen && "rotate-180",
                      )}
                    />
                  </Link>

                  <AnimatePresence>
                    {isOpen ? (
                      <motion.div
                        initial={reduce ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduce ? undefined : { opacity: 0, y: 4 }}
                        transition={{ duration: 0.16, ease: "easeOut" }}
                        className="absolute left-0 top-full z-50 w-80 pt-3"
                      >
                        <div className="overflow-hidden rounded-xl bg-card p-2 shadow-2xl shadow-black/15 dark:shadow-black/50">
                          <ul className="flex flex-col">
                            {menu.items.map(
                              ({ icon: Icon, title, description, href }) => (
                                <li key={href}>
                                  <Link
                                    href={href}
                                    onClick={() => setOpenMenu(null)}
                                    className={cn(
                                      "group/item flex items-start gap-3 rounded-lg p-3 transition-colors duration-150 hover:bg-muted",
                                      FOCUS,
                                    )}
                                  >
                                    <span
                                      aria-hidden="true"
                                      className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"
                                    >
                                      <Icon className="size-[18px]" />
                                    </span>
                                    <span className="flex min-w-0 flex-1 flex-col">
                                      <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
                                        {title}
                                        <ArrowRight
                                          aria-hidden="true"
                                          className="size-3.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover/item:translate-x-0 group-hover/item:opacity-100"
                                        />
                                      </span>
                                      <span className="text-xs leading-relaxed text-muted-foreground">
                                        {description}
                                      </span>
                                    </span>
                                  </Link>
                                </li>
                              ),
                            )}
                          </ul>
                          {menu.footer ? (
                            <Link
                              href={menu.footer.href}
                              onClick={() => setOpenMenu(null)}
                              className={cn(
                                "group/foot mt-1 flex items-center justify-between rounded-lg bg-muted px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/70",
                                FOCUS,
                              )}
                            >
                              {menu.footer.label}
                              <ArrowRight
                                aria-hidden="true"
                                className="size-4 transition-transform duration-200 group-hover/foot:translate-x-1"
                              />
                            </Link>
                          ) : null}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={openPalette}
              aria-label="Search the site"
              aria-keyshortcuts="Control+K Meta+K /"
              className={cn(
                "cursor-pointer gap-2 rounded-md bg-muted px-2.5 text-muted-foreground transition-colors duration-200 hover:bg-muted/70 hover:text-foreground xl:min-w-40 xl:justify-between",
                FOCUS,
              )}
            >
              <span className="inline-flex items-center gap-2">
                <Search aria-hidden="true" className="size-4" />
                <span className="hidden xl:inline">Search…</span>
              </span>
              <kbd className="hidden rounded bg-background px-1.5 py-0.5 font-sans text-[11px] font-medium leading-none shadow-sm xl:inline">
                {shortcut}
              </kbd>
            </Button>

            {/* Copy email with feedback */}
            {email ? (
              <div className="relative hidden xl:block">
                <button
                  type="button"
                  onClick={copyEmail}
                  aria-label={copied ? "Email copied" : `Copy email ${email}`}
                  title={email}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "rounded-md text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground",
                    copied && "text-emerald-600 dark:text-emerald-400",
                    FOCUS,
                  )}
                >
                  {copied ? (
                    <Check aria-hidden="true" className="size-[18px]" />
                  ) : (
                    <Copy aria-hidden="true" className="size-[18px]" />
                  )}
                </button>
                <span
                  role="status"
                  aria-live="polite"
                  className={cn(
                    "pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background shadow-lg transition-all duration-200",
                    copied
                      ? "translate-y-0 opacity-100"
                      : "-translate-y-1 opacity-0",
                  )}
                >
                  {copied ? "Email copied" : ""}
                </span>
              </div>
            ) : null}

            <ThemeToggle />

            {user ? (
              <ProfileMenu
                user={user}
                links={profileLinks}
                onSignOut={onSignOut}
                canAccessDashboard={auth.canAccessDashboard}
              />
            ) : checkingAuth ? (
              <span
                aria-hidden="true"
                className="hidden size-9 animate-pulse rounded-full bg-muted lg:block"
              />
            ) : (
              <HeaderAuthLink className="hidden lg:inline-flex" />
            )}

            <Magnetic strength={0.3}>
              <Link
                href={primaryCta.href}
                className={cn(
                  buttonVariants(),
                  "group hidden items-center gap-1.5 whitespace-nowrap rounded-md bg-primary text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 md:inline-flex",
                  FOCUS,
                )}
              >
                <span className="hidden lg:inline">Start a Project</span>
                <span className="lg:hidden">Start project</span>
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-200 motion-safe:group-hover:translate-x-1"
                />
              </Link>
            </Magnetic>

            <Link
              href="/services"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "group hidden items-center gap-1.5 whitespace-nowrap rounded-md text-foreground transition-all duration-200 hover:bg-muted xl:inline-flex",
                FOCUS,
              )}
            >
              View Services
            </Link>

            <MobileNavigation
              user={user}
              profileLinks={profileLinks}
              onSignOut={onSignOut}
              canAccessDashboard={auth.canAccessDashboard}
              checkingAuth={checkingAuth}
            />
          </div>
        </div>

      </header>

      <CommandPalette />
    </>
  );
}

export { SiteHeader as Navbar };
