// components/layout/ProfileMenu.jsx
"use client";

import {
  Check,
  Copy,
  Laptop,
  LayoutDashboard,
  Loader2,
  LogOut,
  Moon,
  Search,
  Sun,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { OPEN_PALETTE_EVENT } from "@/components/layout/CommandPalette";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils/cn";

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
];

const itemClass = "cursor-pointer gap-2 transition-colors duration-150";

function getInitials(name = "", email = "") {
  const source = name.trim() || email.trim();
  if (!source) return "?";
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[1][0] : "";
  return (first + last).toUpperCase();
}

function isActivePath(pathname, href) {
  if (!pathname || !href) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Avatar with a safe fallback: initials show if there is no photo or it fails to load. */
function Avatar({ user, className, textClass = "text-xs" }) {
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(user.photoURL) && !failed;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-semibold text-primary ring-1 ring-inset ring-primary/25",
        textClass,
        className,
      )}
    >
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.photoURL}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{getInitials(user.name, user.email)}</span>
      )}
    </span>
  );
}

/**
 * @param {{ name?: string, email?: string, photoURL?: string }} user
 * @param {Array<{ label: string, href: string, icon?: React.ElementType }>} [links]
 * @param {() => (void | Promise<void>)} [onSignOut]
 */
export function ProfileMenu({
  user,
  links = [],
  onSignOut,
  canAccessDashboard = false,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [copyStatus, setCopyStatus] = useState("idle"); // idle | copied | error
  const [shortcut, setShortcut] = useState("Ctrl K");
  const copyTimer = useRef(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMounted(true);
      if (/Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent)) {
        setShortcut("⌘K");
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  // Reset the copy feedback whenever the menu closes.
  useEffect(() => {
    if (!open) {
      const frame = window.requestAnimationFrame(() => setCopyStatus("idle"));
      return () => window.cancelAnimationFrame(frame);
    }
    return undefined;
  }, [open]);

  if (!user) return null;

  const displayName = user.name || user.email || "Account";
  const activeTheme = THEMES.find((option) => option.value === theme);

  async function handleCopyEmail() {
    if (!user.email) return;
    let status = "copied";
    try {
      await navigator.clipboard.writeText(user.email);
    } catch {
      status = "error";
    }
    setCopyStatus(status);
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopyStatus("idle"), 2000);
  }

  function handleSearch() {
    // Wait for the menu to release focus before the palette opens.
    setTimeout(() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT)), 150);
  }

  async function handleSignOut() {
    if (pending) return;
    setPending(true);
    try {
      await onSignOut?.();
    } catch (error) {
      console.error("[ProfileMenu] Sign out failed:", error);
    } finally {
      setPending(false);
      setOpen(false);
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        aria-label={`Account menu for ${displayName}`}
        className="group shrink-0 cursor-pointer rounded-full transition-all duration-200 hover:ring-2 hover:ring-primary/50 hover:ring-offset-2 hover:ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[popup-open]:ring-2 data-[popup-open]:ring-primary/60 data-[popup-open]:ring-offset-2"
      >
        <Avatar
          user={user}
          className="size-9 transition-transform duration-200 group-active:scale-95"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-72 overflow-hidden rounded-2xl border border-border/80 p-0 shadow-xl"
      >
        {/* Identity header: a quiet tinted band so the account card reads as
            one distinct zone before the action list begins. */}
        <div className="bg-muted/50 p-3">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex items-center gap-3 px-1 py-1 font-normal">
              <Avatar user={user} className="size-11" textClass="text-sm" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-semibold text-foreground">
                  {displayName}
                </span>
                {user.name && user.email ? (
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                ) : null}
              </span>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
        </div>

        <div className="p-1.5">
          {canAccessDashboard ? (
            <>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => router.push("/admin")}
                  className={itemClass}
                >
                  <LayoutDashboard
                    aria-hidden="true"
                    className="size-4 text-primary"
                  />
                  <span className="flex-1">Admin dashboard</span>
                  {isActivePath(pathname, "/admin") ? (
                    <span className="shrink-0 rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                      Current
                    </span>
                  ) : null}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
            </>
          ) : null}

          {links.length > 0 ? (
            <>
              <DropdownMenuGroup>
                {links.map(({ label, href, icon: Icon = User }) => (
                  <DropdownMenuItem
                    key={href}
                    onClick={() => router.push(href)}
                    className={itemClass}
                  >
                    <Icon
                      aria-hidden="true"
                      className="size-4 text-muted-foreground"
                    />
                    <span className="flex-1">{label}</span>
                    {isActivePath(pathname, href) ? (
                      <span className="shrink-0 rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                        Current
                      </span>
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
            </>
          ) : null}

          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleSearch} className={itemClass}>
              <Search
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
              <span className="flex-1">Search the site</span>
              <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>
            </DropdownMenuItem>

            {user.email ? (
              <DropdownMenuItem
                closeOnClick={false} // keep the menu open so the check mark is visible
                onClick={handleCopyEmail}
                className={itemClass}
              >
                {copyStatus === "copied" ? (
                  <Check aria-hidden="true" className="size-4 text-primary" />
                ) : (
                  <Copy
                    aria-hidden="true"
                    className="size-4 text-muted-foreground"
                  />
                )}
                <span className="flex-1">
                  {copyStatus === "copied"
                    ? "Email copied"
                    : copyStatus === "error"
                      ? "Copy failed"
                      : "Copy email address"}
                </span>
                <span role="status" aria-live="polite" className="sr-only">
                  {copyStatus === "copied"
                    ? "Email address copied to clipboard"
                    : copyStatus === "error"
                      ? "Copy failed"
                      : ""}
                </span>
              </DropdownMenuItem>
            ) : null}

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer gap-2">
                {mounted && activeTheme ? (
                  <activeTheme.icon
                    aria-hidden="true"
                    className="size-4 text-muted-foreground"
                  />
                ) : (
                  <Laptop
                    aria-hidden="true"
                    className="size-4 text-muted-foreground"
                  />
                )}
                <span className="flex-1">Theme</span>
                <span className="text-xs text-muted-foreground">
                  {mounted ? (activeTheme?.label ?? "System") : ""}
                </span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-40">
                <DropdownMenuRadioGroup
                  value={mounted && theme ? theme : ""}
                  onValueChange={(value) => setTheme(value)}
                >
                  {THEMES.map(({ value, label, icon: Icon }) => (
                    <DropdownMenuRadioItem
                      key={value}
                      value={value}
                      className="cursor-pointer gap-2"
                    >
                      <Icon
                        aria-hidden="true"
                        className="size-4 text-muted-foreground"
                      />
                      {label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuGroup>

          {onSignOut ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant="destructive"
                  closeOnClick={false} // stay open while signing out
                  onClick={handleSignOut}
                  disabled={pending}
                  className={itemClass}
                >
                  {pending ? (
                    <Loader2
                      aria-hidden="true"
                      className="size-4 animate-spin"
                    />
                  ) : (
                    <LogOut aria-hidden="true" className="size-4" />
                  )}
                  {pending ? "Signing out…" : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          ) : null}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
