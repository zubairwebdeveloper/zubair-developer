"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  FiCheck,
  FiChevronDown,
  FiChevronRight,
  FiChevronsLeft,
  FiCopy,
  FiExternalLink,
  FiHelpCircle,
  FiLogOut,
  FiMaximize,
  FiMenu,
  FiMinimize,
  FiPlus,
  FiRefreshCw,
  FiWifiOff,
} from "react-icons/fi";

import {
  AdminCommandPalette,
  openAdminPalette,
  useShortcutLabel,
} from "@/components/admin/AdminCommandPalette";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminNavigation } from "@/config/admin-nav";
import { cn } from "@/lib/utils/cn";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function getDisplayName(admin) {
  return admin?.name?.trim() || admin?.email || "Admin";
}

function getInitials(admin) {
  const source = admin?.name?.trim() || admin?.email || "A";
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "A";
  const second = admin?.name?.trim() ? parts[1]?.[0] : undefined;
  return `${first}${second ?? ""}`.toUpperCase();
}

function formatRole(role) {
  if (!role) return "Admin";
  const text = String(role).replace(/[_-]+/g, " ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getGreeting(hour) {
  if (hour < 5) return "Working late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function prettifySegment(segment) {
  let text = segment;
  try {
    text = decodeURIComponent(segment);
  } catch {
    // Keep the raw segment if it is not valid URI encoding.
  }
  // IDs (numeric or long generated strings) are not readable labels.
  if (/^\d+$/.test(text) || text.length >= 20) return "Details";
  const spaced = text.replace(/[-_]+/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** Builds breadcrumbs from the URL. Only real navigation pages become links. */
function buildTrail(pathname) {
  if (!pathname) return [];
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] !== "admin") return [];

  const labelFor = (href) =>
    adminNavigation.find((item) => item.href === href)?.label;

  const rest = segments.slice(1);
  if (rest.length === 0) {
    return [{ href: "/admin", label: labelFor("/admin") ?? "Dashboard" }];
  }

  const trail = [{ href: "/admin", label: "Admin" }];
  let href = "/admin";
  for (const segment of rest) {
    href += `/${segment}`;
    const label = labelFor(href);
    trail.push({
      href: label ? href : null,
      label: label ?? prettifySegment(segment),
    });
  }
  return trail;
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const menuItemClass = cn(
  "flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted motion-reduce:transition-none",
  focusRing,
);

const FOCUSABLE = "button:not([disabled]), a[href]";

/* -------------------------------------------------------------------------- */
/*  Shared dropdown behavior                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Open/close state, dismissal (outside click, Escape, focus leaving) and
 * arrow-key navigation shared by the account and "New" menus.
 */
function useDisclosureMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const panelId = useId();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setOpen(false));
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target))
        setOpen(false);
    };
    const onFocusIn = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target))
        setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // ArrowDown on the trigger opens the menu and focuses the first action.
  function onTriggerKeyDown(event) {
    if (event.key !== "ArrowDown") return;
    event.preventDefault();
    setOpen(true);
    requestAnimationFrame(() =>
      panelRef.current?.querySelector(FOCUSABLE)?.focus(),
    );
  }

  // Arrow keys, Home and End move between the actions inside the menu.
  function onPanelKeyDown(event) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const nodes = Array.from(
      panelRef.current?.querySelectorAll(FOCUSABLE) ?? [],
    );
    if (nodes.length === 0) return;

    event.preventDefault();
    const current = nodes.indexOf(document.activeElement);
    let next;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = nodes.length - 1;
    else if (event.key === "ArrowDown")
      next = current === -1 ? 0 : (current + 1) % nodes.length;
    else next = current <= 0 ? nodes.length - 1 : current - 1;

    nodes[next].focus();
  }

  return {
    open,
    setOpen,
    rootRef,
    triggerRef,
    panelRef,
    panelId,
    onTriggerKeyDown,
    onPanelKeyDown,
  };
}

const panelBase =
  "absolute right-0 z-40 mt-2 origin-top-right rounded-xl border border-border bg-popover p-2 shadow-lg transition duration-150 motion-reduce:transition-none";

const panelState = (open) =>
  open
    ? "visible translate-y-0 opacity-100"
    : "invisible pointer-events-none -translate-y-1 opacity-0";

/* -------------------------------------------------------------------------- */
/*  Avatar                                                                    */
/* -------------------------------------------------------------------------- */

function Avatar({ admin, size = "sm" }) {
  const dimensions = size === "lg" ? "h-11 w-11 text-base" : "h-8 w-8 text-xs";
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary ring-1 ring-primary/20 ${dimensions}`}
    >
      {getInitials(admin)}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sign-out confirmation                                                     */
/* -------------------------------------------------------------------------- */

function SignOutDialog({ open, onOpenChange, admin, returnFocusRef }) {
  const name = getDisplayName(admin);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md"
        onCloseAutoFocus={(event) => {
          // The menu item that opened this dialog is hidden, so restore focus ourselves.
          event.preventDefault();
          returnFocusRef.current?.focus();
        }}
      >
        <div className="flex flex-col gap-4 p-6">
          <DialogHeader>
            <DialogTitle>Sign out of the admin panel?</DialogTitle>
            <DialogDescription>
              You will need to sign in again to manage the site. Any unsaved
              changes on this page will be lost.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3">
            <Avatar admin={admin} size="lg" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Signed in as</p>
              <p className="truncate text-sm font-semibold text-foreground">
                {name}
              </p>
              {admin?.name && admin?.email ? (
                <p className="truncate text-sm text-muted-foreground">
                  {admin.email}
                </p>
              ) : null}
            </div>
            <Badge variant="secondary" className="ml-auto shrink-0">
              {formatRole(admin?.role)}
            </Badge>
          </div>

          {/* Cancel comes first so it receives focus: the safe choice is the default. */}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Stay signed in
            </Button>
            {/* LogoutButton keeps its own sign-out logic; it is the confirm action. */}
            <div className="[&_button]:w-full sm:[&_button]:w-auto">
              <LogoutButton />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*  Account menu                                                              */
/* -------------------------------------------------------------------------- */

function AccountMenu({ admin }) {
  const menu = useDisclosureMenu();
  const { open, setOpen, rootRef, triggerRef, panelRef, panelId } = menu;
  const [copied, setCopied] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [greeting, setGreeting] = useState("Welcome");
  const copyTimer = useRef(null);

  const name = getDisplayName(admin);
  const role = formatRole(admin?.role);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  // Greeting uses the visitor's local time, so it is resolved on the client.
  useEffect(() => {
    if (!open) return undefined;
    const frame = window.requestAnimationFrame(() =>
      setGreeting(getGreeting(new Date().getHours())),
    );
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  async function copyEmail() {
    if (!admin?.email) return;
    try {
      await navigator.clipboard.writeText(admin.email);
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Account menu for ${name}`}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={menu.onTriggerKeyDown}
        className={`flex items-center gap-2 rounded-full border border-border bg-background py-1 pl-1 pr-2 transition-colors hover:bg-muted motion-reduce:transition-none sm:pr-3 ${focusRing}`}
      >
        <Avatar admin={admin} />
        <span className="hidden max-w-[10rem] truncate text-sm font-medium text-foreground lg:inline">
          {name}
        </span>
        <FiChevronDown
          aria-hidden="true"
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        ref={panelRef}
        id={panelId}
        role="region"
        aria-label="Account"
        onKeyDown={menu.onPanelKeyDown}
        className={cn(
          panelBase,
          "w-[min(19rem,calc(100vw-2rem))]",
          panelState(open),
        )}
      >
        <div className="flex items-center gap-3 rounded-lg px-2 py-2.5">
          <Avatar admin={admin} size="lg" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{greeting}</p>
            <p className="truncate text-sm font-semibold text-foreground">
              {name}
            </p>
            {admin?.name && admin?.email ? (
              <p className="truncate text-sm text-muted-foreground">
                {admin.email}
              </p>
            ) : null}
            <Badge variant="secondary" className="mt-1.5">
              {role}
            </Badge>
          </div>
        </div>

        <div className="my-1 h-px bg-border" role="separator" />

        {admin?.email ? (
          <button type="button" onClick={copyEmail} className={menuItemClass}>
            <span>{copied ? "Email copied" : "Copy email address"}</span>
            {copied ? (
              <FiCheck aria-hidden="true" className="h-4 w-4 text-primary" />
            ) : (
              <FiCopy
                aria-hidden="true"
                className="h-4 w-4 text-muted-foreground"
              />
            )}
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => {
            setOpen(false);
            openAdminPalette("shortcuts");
          }}
          className={menuItemClass}
        >
          <span>Keyboard shortcuts</span>
          <FiHelpCircle
            aria-hidden="true"
            className="h-4 w-4 text-muted-foreground"
          />
        </button>

        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={menuItemClass}
        >
          <span>View public site</span>
          <FiExternalLink
            aria-hidden="true"
            className="h-4 w-4 text-muted-foreground"
          />
          <span className="sr-only">(opens in a new tab)</span>
        </Link>

        <div className="my-1 h-px bg-border" role="separator" />

        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setSignOutOpen(true);
          }}
          className={cn(menuItemClass, "text-destructive")}
        >
          <span>Sign out</span>
          <FiLogOut aria-hidden="true" className="h-4 w-4" />
        </button>

        <span role="status" aria-live="polite" className="sr-only">
          {copied ? "Email address copied to clipboard" : ""}
        </span>
      </div>

      <SignOutDialog
        open={signOutOpen}
        onOpenChange={setSignOutOpen}
        admin={admin}
        returnFocusRef={triggerRef}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  "New" menu (only renders when quickActions are provided)                  */
/* -------------------------------------------------------------------------- */

function QuickCreateMenu({ actions }) {
  const menu = useDisclosureMenu();
  const { open, setOpen, rootRef, triggerRef, panelRef, panelId } = menu;

  if (!actions || actions.length === 0) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Create new"
        onClick={() => setOpen((value) => !value)}
        onKeyDown={menu.onTriggerKeyDown}
        className={cn(
          buttonVariants({ variant: "default", size: "sm" }),
          "gap-1.5",
        )}
      >
        <FiPlus aria-hidden="true" className="h-4 w-4" />
        <span className="hidden sm:inline">New</span>
        <FiChevronDown
          aria-hidden="true"
          className={cn(
            "hidden h-3.5 w-3.5 transition-transform duration-200 motion-reduce:transition-none sm:block",
            open && "rotate-180",
          )}
        />
      </button>

      <div
        ref={panelRef}
        id={panelId}
        role="region"
        aria-label="Create new"
        onKeyDown={menu.onPanelKeyDown}
        className={cn(
          panelBase,
          "w-[min(16rem,calc(100vw-2rem))]",
          panelState(open),
        )}
      >
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={cn(menuItemClass, "flex-col items-start gap-0.5")}
          >
            <span className="font-medium">{action.label}</span>
            {action.description ? (
              <span className="text-xs text-muted-foreground">
                {action.description}
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Header                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * AdminHeader
 *
 * @param {object}   admin             Signed-in admin ({ name?, email, role }).
 * @param {Function} onOpenMenu        Opens the mobile navigation drawer.
 * @param {Function} onToggleCollapse  Collapses or expands the desktop sidebar.
 * @param {boolean}  [isCollapsed]     Optional. Reflects the sidebar state for assistive tech.
 * @param {Array}    [quickActions]    Optional. [{ label, href, description? }]. Shows a "New" menu.
 */
export function AdminHeader({
  admin,
  onOpenMenu,
  onToggleCollapse,
  isCollapsed,
  quickActions,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { mod } = useShortcutLabel();
  const hasCollapseState = typeof isCollapsed === "boolean";

  const [online, setOnline] = useState(true);
  const [reconnected, setReconnected] = useState(false);
  const [canFullscreen, setCanFullscreen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, startRefresh] = useTransition();
  const wasOffline = useRef(false);
  const wasRefreshing = useRef(false);
  const reconnectTimer = useRef(null);

  const trail = useMemo(() => buildTrail(pathname), [pathname]);
  const currentLabel = trail[trail.length - 1]?.label;

  // Connection status: admin actions fail silently offline, so say so.
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setOnline(navigator.onLine);
      wasOffline.current = !navigator.onLine;
    });

    const goOnline = () => {
      setOnline(true);
      if (wasOffline.current) {
        wasOffline.current = false;
        setReconnected(true);
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = setTimeout(() => setReconnected(false), 4000);
      }
    };
    const goOffline = () => {
      wasOffline.current = true;
      setReconnected(false);
      setOnline(false);
    };

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.cancelAnimationFrame(frame);
      clearTimeout(reconnectTimer.current);
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // "Updated at" time: set on every page load and after each manual refresh.
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setLastUpdated(new Date()));
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    if (wasRefreshing.current && !isRefreshing) setLastUpdated(new Date());
    wasRefreshing.current = isRefreshing;
  }, [isRefreshing]);

  // Fullscreen is not supported everywhere (for example iPhone Safari).
  useEffect(() => {
    const sync = () => setIsFullscreen(Boolean(document.fullscreenElement));
    const frame = window.requestAnimationFrame(() => {
      setCanFullscreen(Boolean(document.fullscreenEnabled));
      sync();
    });
    document.addEventListener("fullscreenchange", sync);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("fullscreenchange", sync);
    };
  }, []);

  // Cmd/Ctrl + B toggles the desktop sidebar.
  useEffect(() => {
    if (!onToggleCollapse) return undefined;

    const onKeyDown = (event) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "b")
        return;
      if (event.target instanceof HTMLElement && event.target.isContentEditable)
        return;
      if (!window.matchMedia("(min-width: 768px)").matches) return;
      event.preventDefault();
      onToggleCollapse();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onToggleCollapse]);

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      // The browser can refuse (permissions policy). Nothing to recover.
    }
  }

  function refreshData() {
    startRefresh(() => router.refresh());
  }

  const collapseLabel = hasCollapseState
    ? isCollapsed
      ? "Expand sidebar"
      : "Collapse sidebar"
    : "Collapse or expand sidebar";

  const refreshTitle = lastUpdated
    ? `Refresh page data (updated ${formatTime(lastUpdated)})`
    : "Refresh page data";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:px-6">
      {/* Thin progress line while page data is refreshing */}
      {isRefreshing ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -bottom-px h-0.5 animate-pulse bg-primary motion-reduce:animate-none"
        />
      ) : null}

      {/* Left: navigation controls and location */}
      <div className="flex min-w-0 items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="md:hidden"
          aria-label="Open admin menu"
          onClick={onOpenMenu}
        >
          <FiMenu aria-hidden="true" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hidden md:inline-flex"
          aria-label={collapseLabel}
          title={`${collapseLabel} (${mod} B)`}
          aria-keyshortcuts="Control+B Meta+B"
          aria-pressed={hasCollapseState ? isCollapsed : undefined}
          onClick={onToggleCollapse}
        >
          <FiChevronsLeft
            aria-hidden="true"
            className={`transition-transform duration-200 motion-reduce:transition-none ${
              hasCollapseState && isCollapsed ? "rotate-180" : ""
            }`}
          />
        </Button>

        <span
          className="mx-1 hidden h-6 w-px bg-border md:block"
          aria-hidden="true"
        />

        {/* Tablet: current page title. Desktop: full breadcrumb. */}
        {currentLabel ? (
          <p className="hidden min-w-0 truncate text-sm font-medium text-foreground sm:block lg:hidden">
            {currentLabel}
          </p>
        ) : null}

        {trail.length > 0 ? (
          <nav aria-label="Breadcrumb" className="hidden min-w-0 lg:block">
            <ol className="flex items-center gap-1.5 text-sm">
              {trail.map((crumb, index) => {
                const isLast = index === trail.length - 1;
                return (
                  <li
                    key={`${crumb.label}-${index}`}
                    className="flex min-w-0 items-center gap-1.5"
                  >
                    {index > 0 ? (
                      <FiChevronRight
                        aria-hidden="true"
                        className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                      />
                    ) : null}
                    {isLast ? (
                      <span
                        aria-current="page"
                        className="truncate font-medium text-foreground"
                      >
                        {crumb.label}
                      </span>
                    ) : crumb.href ? (
                      <Link
                        href={crumb.href}
                        className={cn(
                          "truncate rounded-sm text-muted-foreground transition-colors hover:text-foreground motion-reduce:transition-none",
                          focusRing,
                        )}
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="truncate text-muted-foreground">
                        {crumb.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        ) : null}
      </div>

      {/* Right: status, tools, search, site link, role, and account */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {!online ? (
          <Badge variant="destructive" className="gap-1.5" aria-hidden="true">
            <FiWifiOff className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Offline</span>
          </Badge>
        ) : reconnected ? (
          <Badge variant="secondary" className="gap-1.5" aria-hidden="true">
            <FiCheck className="h-3.5 w-3.5 text-primary" />
            <span className="hidden sm:inline">Back online</span>
          </Badge>
        ) : null}
        <span role="status" aria-live="polite" className="sr-only">
          {!online
            ? "You are offline. Changes may not be saved."
            : reconnected
              ? "You are back online."
              : isRefreshing
                ? "Refreshing page data"
                : ""}
        </span>

        <QuickCreateMenu actions={quickActions} />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Refresh page data"
          title={refreshTitle}
          aria-busy={isRefreshing}
          disabled={isRefreshing}
          onClick={refreshData}
          className="hidden sm:inline-flex"
        >
          <FiRefreshCw
            aria-hidden="true"
            className={cn(
              isRefreshing && "animate-spin motion-reduce:animate-none",
            )}
          />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Keyboard shortcuts"
          title="Keyboard shortcuts (?)"
          onClick={() => openAdminPalette("shortcuts")}
          className="hidden lg:inline-flex"
        >
          <FiHelpCircle aria-hidden="true" />
        </Button>

        {canFullscreen ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"}
            title={isFullscreen ? "Exit full screen" : "Enter full screen"}
            aria-pressed={isFullscreen}
            onClick={toggleFullscreen}
            className="hidden lg:inline-flex"
          >
            {isFullscreen ? (
              <FiMinimize aria-hidden="true" />
            ) : (
              <FiMaximize aria-hidden="true" />
            )}
          </Button>
        ) : null}

        <AdminCommandPalette role={admin?.role} variant="field" />

        {/* Link styled as a button (a <button> must not wrap a link). */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "hidden gap-1.5 2xl:inline-flex",
          )}
        >
          <span>View site</span>
          <FiExternalLink
            aria-hidden="true"
            className="h-3.5 w-3.5 text-muted-foreground"
          />
          <span className="sr-only">(opens in a new tab)</span>
        </Link>

        <Badge variant="secondary" className="hidden 2xl:inline-flex">
          {formatRole(admin?.role)}
        </Badge>

        <AccountMenu admin={admin} />
      </div>
    </header>
  );
}
