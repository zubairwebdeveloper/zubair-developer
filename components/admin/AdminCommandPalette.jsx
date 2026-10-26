"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FiArrowLeft,
  FiCheck,
  FiClock,
  FiCornerUpLeft,
  FiExternalLink,
  FiGlobe,
  FiHelpCircle,
  FiLink,
  FiMaximize,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiStar,
  FiTrash2,
} from "react-icons/fi";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { adminNavigation } from "@/config/admin-nav";
import { hasPermission } from "@/lib/auth/permissions";

const RECENT_KEY = "admin-command-palette:recent";
// Same key the sidebar uses for pinned pages.
const FAVORITES_KEY = "admin-sidebar:favorites";
const MAX_RECENT = 4;
const DEFAULT_GROUP = "Pages";
const OPEN_EVENT = "admin-palette:open";

const SHORTCUTS = [
  { keys: ["MOD", "K"], label: "Open or close the command palette" },
  { keys: ["/"], label: "Open search" },
  { keys: ["?"], label: "Show keyboard shortcuts" },
  { keys: ["MOD", "B"], label: "Collapse or expand the sidebar (desktop)" },
  { keys: ["↑", "↓"], label: "Move through results" },
  { keys: ["Enter"], label: "Open the selected result" },
  { keys: ["MOD", "Enter"], label: "Open the selected page in a new tab" },
  { keys: ["Esc"], label: "Close the palette" },
];

const kbdClass =
  "rounded border border-border bg-muted/50 px-1.5 py-0.5 font-sans text-[11px] font-medium leading-none text-muted-foreground";

/* -------------------------------------------------------------------------- */
/*  Public helpers (used by the header and sidebar)                           */
/* -------------------------------------------------------------------------- */

/** Opens the palette from anywhere. view: "search" | "shortcuts" */
export function openAdminPalette(view = "search") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { view } }));
}

/** Platform-aware modifier label. Resolved after mount to avoid hydration mismatch. */
export function useShortcutLabel() {
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    if (/Mac|iPhone|iPad/i.test(navigator.userAgent)) setIsMac(true);
  }, []);
  return { isMac, mod: isMac ? "⌘" : "Ctrl" };
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function readList(key) {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((v) => typeof v === "string")
      : [];
  } catch {
    return [];
  }
}

function writeRecent(hrefs) {
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(hrefs));
  } catch {
    // Storage can be unavailable (private mode, quota). The palette still works.
  }
}

function isActivePath(pathname, href) {
  if (!pathname) return false;
  if (pathname === href) return true;
  const segments = href.split("/").filter(Boolean);
  return segments.length > 1 && pathname.startsWith(`${href}/`);
}

function isEditableTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * AdminCommandPalette
 *
 * @param {string}  [role]          Current admin role (filters pages by permission).
 * @param {string}  [variant]       "button" (default) or "field" (wide search box).
 * @param {Array}   [quickActions]  Optional [{ label, href, description? }] shown as "Create".
 */
export function AdminCommandPalette({
  role,
  variant = "button",
  quickActions,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { mod } = useShortcutLabel();

  const [open, setOpen] = useState(false);
  const [view, setView] = useState("search"); // search | shortcuts
  const [search, setSearch] = useState("");
  const [recent, setRecent] = useState([]);
  const [pinned, setPinned] = useState([]);
  const [canFullscreen, setCanFullscreen] = useState(false);
  const [copyStatus, setCopyStatus] = useState("idle"); // idle | copied | error
  const copyTimer = useRef(null);

  const items = useMemo(
    () =>
      adminNavigation.filter((item) => hasPermission(role, item.permission)),
    [role],
  );

  const groups = useMemo(() => {
    const map = new Map();
    for (const item of items) {
      const name = item.group ?? DEFAULT_GROUP;
      if (!map.has(name)) map.set(name, []);
      map.get(name).push(item);
    }
    return Array.from(map, ([heading, groupItems]) => ({
      heading,
      items: groupItems,
    }));
  }, [items]);

  const recentItems = useMemo(
    () =>
      recent
        .map((href) => items.find((item) => item.href === href))
        .filter((item) => item && !isActivePath(pathname, item.href)),
    [recent, items, pathname],
  );

  // Pages pinned from the sidebar, limited to ones this role can access.
  const pinnedItems = useMemo(
    () =>
      pinned
        .map((href) => items.find((item) => item.href === href))
        .filter(Boolean),
    [pinned, items],
  );

  const createActions = useMemo(
    () => (Array.isArray(quickActions) ? quickActions : []),
    [quickActions],
  );

  const exampleLabels = items
    .slice(0, 2)
    .map((item) => item.label.toLowerCase());

  const shortcutRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return SHORTCUTS.filter((row) => row.label.toLowerCase().includes(query));
  }, [search]);

  const showView = useCallback((next) => {
    setSearch("");
    setView(next);
  }, []);

  const openSearch = useCallback(() => {
    showView("search");
    setOpen(true);
  }, [showView]);

  /* Global shortcuts: Cmd/Ctrl + K toggles, "/" opens search, "?" opens shortcuts. */
  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
        return;
      }

      const plain = !event.metaKey && !event.ctrlKey && !event.altKey;
      if (!plain || isEditableTarget(event.target)) return;

      if (event.key === "/") {
        event.preventDefault();
        openSearch();
      } else if (event.key === "?") {
        event.preventDefault();
        showView("shortcuts");
        setOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openSearch, showView]);

  /* Open requests coming from the header and sidebar. */
  useEffect(() => {
    const onOpenRequest = (event) => {
      showView(event.detail?.view === "shortcuts" ? "shortcuts" : "search");
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, onOpenRequest);
    return () => window.removeEventListener(OPEN_EVENT, onOpenRequest);
  }, [showView]);

  /* Load saved lists when opening; reset transient state when closing. */
  useEffect(() => {
    if (open) {
      setRecent(readList(RECENT_KEY));
      setPinned(readList(FAVORITES_KEY));
      setCanFullscreen(Boolean(document.fullscreenEnabled));
    } else {
      setSearch("");
      setView("search");
      setCopyStatus("idle");
    }
  }, [open]);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const go = useCallback(
    (href, { remember = false } = {}) => {
      if (remember) {
        const next = [
          href,
          ...readList(RECENT_KEY).filter((value) => value !== href),
        ].slice(0, MAX_RECENT);
        writeRecent(next);
      }
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  async function copyPageLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopyStatus("idle"), 2200);
  }

  function clearRecent() {
    writeRecent([]);
    setRecent([]);
  }

  async function toggleFullscreen() {
    setOpen(false);
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      // The browser can refuse (permissions policy). Nothing to recover.
    }
  }

  /* Cmd/Ctrl + Enter opens the highlighted page in a new tab. */
  function onCommandKeyDown(event) {
    if (event.key !== "Enter" || !(event.metaKey || event.ctrlKey)) return;
    const selected = event.currentTarget.querySelector(
      '[cmdk-item][aria-selected="true"]',
    );
    const href = selected?.getAttribute("data-href");
    if (!href) return;

    event.preventDefault();
    window.open(href, "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  const emptySearch = search.trim() === "";
  const showPinned = emptySearch && pinnedItems.length > 0;
  const showRecent = emptySearch && recentItems.length > 0;

  function renderPageItem(item) {
    const Icon = item.icon;
    const active = isActivePath(pathname, item.href);

    return (
      <CommandItem
        key={item.href}
        value={`${item.label} ${item.href}`}
        keywords={[item.description, item.group].filter(Boolean)}
        data-href={item.href}
        onSelect={() => go(item.href, { remember: true })}
        className="gap-3 py-2.5"
      >
        {Icon ? (
          <Icon aria-hidden="true" className="shrink-0 text-muted-foreground" />
        ) : null}
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate">{item.label}</span>
          {item.description ? (
            <span className="truncate text-xs text-muted-foreground">
              {item.description}
            </span>
          ) : null}
        </span>
        {active ? (
          <span className="shrink-0 rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
            Current page
          </span>
        ) : null}
      </CommandItem>
    );
  }

  return (
    <>
      {variant === "field" ? (
        <>
          {/* Wide screens: a search field that opens the palette. */}
          <button
            type="button"
            onClick={openSearch}
            aria-label="Search admin pages"
            aria-keyshortcuts="Control+K Meta+K"
            className="hidden h-9 w-64 items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none xl:flex 2xl:w-80"
          >
            <FiSearch aria-hidden="true" className="size-4 shrink-0" />
            <span className="flex-1 truncate text-left">
              Search pages and actions…
            </span>
            <kbd className={kbdClass}>{mod} K</kbd>
          </button>

          {/* Smaller screens: compact icon button. */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="xl:hidden"
            aria-label="Search admin pages"
            aria-keyshortcuts="Control+K Meta+K"
            onClick={openSearch}
          >
            <FiSearch aria-hidden="true" />
          </Button>
        </>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openSearch}
          aria-label="Search admin pages"
          aria-keyshortcuts="Control+K Meta+K"
          className="gap-2"
        >
          <FiSearch aria-hidden="true" />
          <span className="hidden sm:inline">Search</span>
          <kbd className={`${kbdClass} hidden md:inline`}>{mod} K</kbd>
        </Button>
      )}

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={view === "shortcuts" ? "Keyboard shortcuts" : "Go to page"}
        description="Search admin pages, jump to a section, or run a quick action"
      >
        {/* CommandInput/List/Item must live inside a Command context. */}
        <Command className="bg-transparent" onKeyDown={onCommandKeyDown}>
          <CommandInput
            placeholder={
              view === "shortcuts"
                ? "Filter shortcuts…"
                : "Search pages and actions…"
            }
            value={search}
            onValueChange={setSearch}
          />

          <CommandList className="max-h-[min(60vh,26rem)]">
            {view === "shortcuts" ? (
              <>
                <CommandGroup forceMount>
                  <CommandItem
                    forceMount
                    value="back to search"
                    onSelect={() => showView("search")}
                    className="gap-3"
                  >
                    <FiArrowLeft
                      aria-hidden="true"
                      className="shrink-0 text-muted-foreground"
                    />
                    <span>Back to search</span>
                  </CommandItem>
                </CommandGroup>

                <div
                  role="group"
                  aria-label="Keyboard shortcuts"
                  className="px-1 pb-2"
                >
                  <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    Keyboard shortcuts
                  </p>
                  {shortcutRows.length === 0 ? (
                    <p className="px-2 py-4 text-center text-sm text-muted-foreground">
                      No shortcut matches “{search.trim()}”.
                    </p>
                  ) : (
                    shortcutRows.map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between gap-4 rounded-md px-2 py-2 text-sm"
                      >
                        <span>{row.label}</span>
                        <span className="flex shrink-0 items-center gap-1">
                          {row.keys.map((key) => (
                            <kbd key={key} className={kbdClass}>
                              {key === "MOD" ? mod : key}
                            </kbd>
                          ))}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                <CommandEmpty>
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm font-medium text-foreground">
                      No results for “{search.trim()}”
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {exampleLabels.length > 0
                        ? `Check the spelling, or try “${exampleLabels.join("” or “")}”.`
                        : "Check the spelling and try again."}{" "}
                      You may not have access to some pages.
                    </p>
                  </div>
                </CommandEmpty>

                {showPinned ? (
                  <>
                    <CommandGroup heading="Pinned">
                      {pinnedItems.map((item) => (
                        <CommandItem
                          key={`pinned-${item.href}`}
                          value={`pinned ${item.label} ${item.href}`}
                          data-href={item.href}
                          onSelect={() => go(item.href, { remember: true })}
                          className="gap-3"
                        >
                          <FiStar
                            aria-hidden="true"
                            className="shrink-0 fill-current text-primary"
                          />
                          <span className="truncate">{item.label}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandSeparator />
                  </>
                ) : null}

                {showRecent ? (
                  <>
                    <CommandGroup heading="Recent">
                      {recentItems.map((item) => (
                        <CommandItem
                          key={`recent-${item.href}`}
                          value={`recent ${item.label} ${item.href}`}
                          data-href={item.href}
                          onSelect={() => go(item.href, { remember: true })}
                          className="gap-3"
                        >
                          <FiClock
                            aria-hidden="true"
                            className="shrink-0 text-muted-foreground"
                          />
                          <span className="truncate">{item.label}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandSeparator />
                  </>
                ) : null}

                {createActions.length > 0 ? (
                  <>
                    <CommandGroup heading="Create">
                      {createActions.map((action) => (
                        <CommandItem
                          key={`create-${action.href}`}
                          value={`new create ${action.label}`}
                          keywords={
                            action.description
                              ? [action.description]
                              : undefined
                          }
                          data-href={action.href}
                          onSelect={() => go(action.href)}
                          className="gap-3 py-2.5"
                        >
                          <FiPlus
                            aria-hidden="true"
                            className="shrink-0 text-muted-foreground"
                          />
                          <span className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate">{action.label}</span>
                            {action.description ? (
                              <span className="truncate text-xs text-muted-foreground">
                                {action.description}
                              </span>
                            ) : null}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandSeparator />
                  </>
                ) : null}

                {groups.map((group) => (
                  <CommandGroup key={group.heading} heading={group.heading}>
                    {group.items.map((item) => renderPageItem(item))}
                  </CommandGroup>
                ))}

                <CommandSeparator />

                <CommandGroup heading="Quick actions">
                  <CommandItem
                    value="Copy link to this page"
                    keywords={["share", "url", "clipboard"]}
                    onSelect={copyPageLink}
                    className="gap-3"
                  >
                    {copyStatus === "copied" ? (
                      <FiCheck
                        aria-hidden="true"
                        className="shrink-0 text-primary"
                      />
                    ) : (
                      <FiLink
                        aria-hidden="true"
                        className="shrink-0 text-muted-foreground"
                      />
                    )}
                    <span>
                      {copyStatus === "copied"
                        ? "Link copied"
                        : copyStatus === "error"
                          ? "Copy failed. Copy it from the address bar."
                          : "Copy link to this page"}
                    </span>
                  </CommandItem>

                  <CommandItem
                    value="Refresh this page"
                    keywords={["reload", "update", "data", "fetch"]}
                    onSelect={() => {
                      setOpen(false);
                      router.refresh();
                    }}
                    className="gap-3"
                  >
                    <FiRefreshCw
                      aria-hidden="true"
                      className="shrink-0 text-muted-foreground"
                    />
                    <span>Refresh this page</span>
                  </CommandItem>

                  <CommandItem
                    value="Go back"
                    keywords={["previous", "return", "history"]}
                    onSelect={() => {
                      setOpen(false);
                      router.back();
                    }}
                    className="gap-3"
                  >
                    <FiCornerUpLeft
                      aria-hidden="true"
                      className="shrink-0 text-muted-foreground"
                    />
                    <span>Go back</span>
                  </CommandItem>

                  <CommandItem
                    value="View public site"
                    keywords={["portfolio", "website", "home"]}
                    data-href="/"
                    onSelect={() => go("/")}
                    className="gap-3"
                  >
                    <FiGlobe
                      aria-hidden="true"
                      className="shrink-0 text-muted-foreground"
                    />
                    <span>View public site</span>
                  </CommandItem>

                  <CommandItem
                    value="Open public site in a new tab"
                    keywords={["portfolio", "website", "home", "external"]}
                    onSelect={() => {
                      setOpen(false);
                      window.open("/", "_blank", "noopener,noreferrer");
                    }}
                    className="gap-3"
                  >
                    <FiExternalLink
                      aria-hidden="true"
                      className="shrink-0 text-muted-foreground"
                    />
                    <span>Open public site in a new tab</span>
                  </CommandItem>

                  {canFullscreen ? (
                    <CommandItem
                      value="Toggle full screen"
                      keywords={["maximize", "fullscreen", "focus"]}
                      onSelect={toggleFullscreen}
                      className="gap-3"
                    >
                      <FiMaximize
                        aria-hidden="true"
                        className="shrink-0 text-muted-foreground"
                      />
                      <span>Toggle full screen</span>
                    </CommandItem>
                  ) : null}

                  <CommandItem
                    value="Keyboard shortcuts"
                    keywords={["help", "keys", "hotkeys", "commands"]}
                    onSelect={() => showView("shortcuts")}
                    className="gap-3"
                  >
                    <FiHelpCircle
                      aria-hidden="true"
                      className="shrink-0 text-muted-foreground"
                    />
                    <span className="flex-1">Keyboard shortcuts</span>
                    <kbd className={kbdClass}>?</kbd>
                  </CommandItem>

                  {recent.length > 0 ? (
                    <CommandItem
                      value="Clear recent pages"
                      keywords={["history", "reset", "remove"]}
                      onSelect={clearRecent}
                      className="gap-3"
                    >
                      <FiTrash2
                        aria-hidden="true"
                        className="shrink-0 text-muted-foreground"
                      />
                      <span>Clear recent pages</span>
                    </CommandItem>
                  ) : null}
                </CommandGroup>
              </>
            )}
          </CommandList>

          <span role="status" aria-live="polite" className="sr-only">
            {copyStatus === "copied" ? "Page link copied to clipboard" : ""}
          </span>

          {/* Keyboard hints: shown on devices that have a keyboard. */}
          <div className="hidden items-center justify-between gap-4 border-t border-border px-3 py-2 text-xs text-muted-foreground sm:flex">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <kbd className={kbdClass}>↑</kbd>
                <kbd className={kbdClass}>↓</kbd>
                <span>Move</span>
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className={kbdClass}>Enter</kbd>
                <span>Open</span>
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className={kbdClass}>{mod} Enter</kbd>
                <span>New tab</span>
              </span>
            </div>
            <span className="flex items-center gap-1.5">
              <kbd className={kbdClass}>Esc</kbd>
              <span>Close</span>
            </span>
          </div>
        </Command>
      </CommandDialog>
    </>
  );
}
