"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  FiArrowRight,
  FiChevronDown,
  FiCommand,
  FiExternalLink,
  FiHelpCircle,
  FiSearch,
  FiStar,
  FiX,
} from "react-icons/fi";

import {
  openAdminPalette,
  useShortcutLabel,
} from "@/components/admin/AdminCommandPalette";
import { adminNavigation } from "@/config/admin-nav";
import { hasPermission } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils/cn";

const FAVORITES_KEY = "admin-sidebar:favorites";
const CLOSED_GROUPS_KEY = "admin-sidebar:closed-groups";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const kbdClass =
  "rounded border border-border bg-muted/50 px-1.5 py-0.5 font-sans text-[11px] font-medium leading-none text-muted-foreground";

const footerButtonClass =
  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground motion-reduce:transition-none";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function readList(key) {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((value) => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

function writeList(key, list) {
  try {
    window.localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // Storage can be unavailable. Preferences simply won't persist.
  }
}

/** Exact match for the item itself, or any route inside it (never a lookalike prefix). */
function isActive(pathname, item) {
  if (!pathname) return false;
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** Every typed word must appear in the label, description, or group. */
function matchesQuery(item, terms) {
  if (terms.length === 0) return true;
  const haystack =
    `${item.label} ${item.description ?? ""} ${item.group ?? ""}`.toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function Highlight({ text, terms }) {
  if (terms.length === 0) return text;
  const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "ig");
  // With one capture group, matches always land on odd indexes.
  return text.split(pattern).map((part, index) =>
    index % 2 === 1 ? (
      <mark key={index} className="bg-transparent font-semibold text-primary">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

/* -------------------------------------------------------------------------- */
/*  Nav item                                                                  */
/* -------------------------------------------------------------------------- */

function NavItem({
  item,
  terms,
  active,
  collapsed,
  favorite,
  onToggleFavorite,
  onNavigate,
}) {
  const Icon = item.icon;
  // While filtering, show why a page matched (its description).
  const showDescription = terms.length > 0 && Boolean(item.description);

  return (
    <li className="group/item relative my-1 ">
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        aria-label={collapsed ? item.label : undefined}
        title={collapsed ? item.label : item.description || undefined}
        className={cn(
          "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors motion-reduce:transition-none",
          active
            ? "bg-primary/10 text-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-foreground",
          collapsed ? "justify-center px-0" : "pr-10",
          focusRing,
        )}
      >
        {active ? (
          <span
            aria-hidden="true"
            className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary"
          />
        ) : null}

        {Icon ? (
          <Icon
            aria-hidden="true"
            className={cn(
              "size-4 shrink-0 transition-colors motion-reduce:transition-none",
              active
                ? "text-primary"
                : "text-muted-foreground group-hover:text-foreground",
            )}
          />
        ) : null}

        {collapsed ? null : (
          <>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate">
                <Highlight text={item.label} terms={terms} />
              </span>
              {showDescription ? (
                <span className="truncate text-xs font-normal text-muted-foreground">
                  <Highlight text={item.description} terms={terms} />
                </span>
              ) : null}
            </span>

            {/* Hover arrow: slides in on hover and keyboard focus. */}
            {active ? null : (
              <FiArrowRight
                aria-hidden="true"
                className="size-3.5 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:translate-x-0 motion-reduce:transition-none"
              />
            )}
          </>
        )}
      </Link>

      {collapsed ? null : (
        <button
          type="button"
          aria-pressed={favorite}
          aria-label={`${favorite ? "Unpin" : "Pin"} ${item.label}`}
          onClick={() => onToggleFavorite(item.href)}
          className={cn(
            "absolute right-1.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md transition-opacity hover:bg-background motion-reduce:transition-none",
            favorite
              ? "text-primary opacity-100"
              : "text-muted-foreground opacity-0 hover:text-foreground focus-visible:opacity-100 group-focus-within/item:opacity-100 group-hover/item:opacity-100 [@media(hover:none)]:opacity-100",
            focusRing,
          )}
        >
          <FiStar
            aria-hidden="true"
            className={cn("size-3.5", favorite && "fill-current")}
          />
        </button>
      )}
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sidebar                                                                   */
/* -------------------------------------------------------------------------- */

export function AdminSidebar({ role, collapsed = false, onNavigate }) {
  const router = useRouter();
  const pathname = usePathname();
  const uid = useId();
  const navRef = useRef(null);
  const filterRef = useRef(null);
  const { mod } = useShortcutLabel();

  const [favorites, setFavorites] = useState([]);
  const [closedGroups, setClosedGroups] = useState([]);
  const [query, setQuery] = useState("");

  const terms = useMemo(
    () => query.toLowerCase().split(/\s+/).filter(Boolean),
    [query],
  );
  const searching = terms.length > 0 && !collapsed;

  const items = useMemo(
    () =>
      adminNavigation.filter((item) => hasPermission(role, item.permission)),
    [role],
  );

  const hasGroups = useMemo(() => items.some((item) => item.group), [items]);

  // Every group heading (unfiltered), used by "Collapse all / Expand all".
  const allHeadings = useMemo(
    () => [...new Set(items.map((item) => item.group).filter(Boolean))],
    [items],
  );
  const allClosed =
    allHeadings.length > 0 &&
    allHeadings.every((heading) => closedGroups.includes(heading));

  const activeGroup = useMemo(
    () => items.find((item) => isActive(pathname, item))?.group,
    [items, pathname],
  );

  const groups = useMemo(() => {
    const map = new Map();
    for (const item of items) {
      if (!matchesQuery(item, searching ? terms : [])) continue;
      const name = item.group ?? "";
      if (!map.has(name)) map.set(name, []);
      map.get(name).push(item);
    }
    return Array.from(map, ([heading, groupItems]) => ({
      heading,
      items: groupItems,
    }));
  }, [items, terms, searching]);

  const resultCount = groups.reduce(
    (sum, group) => sum + group.items.length,
    0,
  );
  const firstMatch = groups[0]?.items[0];

  // Pinned pages, limited to ones this role can still access.
  const pinnedItems = useMemo(
    () =>
      favorites
        .map((href) => items.find((item) => item.href === href))
        .filter(Boolean),
    [favorites, items],
  );

  /* Load saved preferences once on the client. */
  useEffect(() => {
    setFavorites(readList(FAVORITES_KEY));
    setClosedGroups(readList(CLOSED_GROUPS_KEY));
  }, []);

  /* Always reveal the group of the page the user is on. */
  useEffect(() => {
    if (!activeGroup) return;
    setClosedGroups((previous) => {
      if (!previous.includes(activeGroup)) return previous;
      const next = previous.filter((name) => name !== activeGroup);
      writeList(CLOSED_GROUPS_KEY, next);
      return next;
    });
  }, [pathname, activeGroup]);

  /* Keep the active link visible in long lists. */
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      navRef.current
        ?.querySelector('[aria-current="page"]')
        ?.scrollIntoView({ block: "nearest" });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, collapsed]);

  function toggleFavorite(href) {
    setFavorites((previous) => {
      const next = previous.includes(href)
        ? previous.filter((value) => value !== href)
        : [...previous, href];
      writeList(FAVORITES_KEY, next);
      return next;
    });
  }

  function clearFavorites() {
    setFavorites([]);
    writeList(FAVORITES_KEY, []);
  }

  function toggleGroup(heading) {
    setClosedGroups((previous) => {
      const next = previous.includes(heading)
        ? previous.filter((name) => name !== heading)
        : [...previous, heading];
      writeList(CLOSED_GROUPS_KEY, next);
      return next;
    });
  }

  function setAllGroups(close) {
    const next = close ? allHeadings : [];
    setClosedGroups(next);
    writeList(CLOSED_GROUPS_KEY, next);
  }

  function clearSearch() {
    setQuery("");
    filterRef.current?.focus();
  }

  function openFirstMatch() {
    if (!firstMatch) return;
    onNavigate?.();
    router.push(firstMatch.href);
    setQuery("");
  }

  /** Links that can currently receive focus (not inside a collapsed group). */
  function getVisibleLinks() {
    return Array.from(navRef.current?.querySelectorAll("a[href]") ?? []).filter(
      (element) => !element.closest('[data-closed="true"]'),
    );
  }

  function onFilterKeyDown(event) {
    if (event.key === "Enter" && searching) {
      event.preventDefault();
      openFirstMatch();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      getVisibleLinks()[0]?.focus();
    } else if (event.key === "Escape" && query) {
      // Clear first; a second Escape then behaves normally (for example closing a drawer).
      event.preventDefault();
      event.stopPropagation();
      setQuery("");
    }
  }

  // Arrow keys, Home and End move between links once one of them is focused.
  function onNavKeyDown(event) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const links = getVisibleLinks();
    const current = links.indexOf(document.activeElement);
    if (current === -1) return;

    event.preventDefault();
    if (event.key === "ArrowUp" && current === 0 && filterRef.current) {
      filterRef.current.focus();
      return;
    }

    let next;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = links.length - 1;
    else if (event.key === "ArrowDown")
      next = Math.min(current + 1, links.length - 1);
    else next = Math.max(current - 1, 0);
    links[next]?.focus();
  }

  function openPaletteView(view) {
    // Close the mobile drawer first so two overlays never fight for focus.
    onNavigate?.();
    setTimeout(() => openAdminPalette(view), onNavigate ? 200 : 0);
  }

  const renderItem = (item) => (
    <NavItem
      key={item.href}
      item={item}
      terms={searching ? terms : []}
      active={isActive(pathname, item)}
      collapsed={collapsed}
      favorite={favorites.includes(item.href)}
      onToggleFavorite={toggleFavorite}
      onNavigate={onNavigate}
    />
  );

  const showToolbar =
    !collapsed && !searching && hasGroups && allHeadings.length > 1;

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center border-b border-border px-3">
        <Link
          href="/admin"
          onClick={onNavigate}
          aria-label="Zubair Developer admin home"
          className={cn(
            "flex min-w-0 items-center gap-3 rounded-lg p-1",
            collapsed && "mx-auto",
            focusRing,
          )}
        >
          <span
            aria-hidden="true"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary font-heading text-sm font-semibold text-primary-foreground"
          >
            ZD
          </span>
          {collapsed ? null : (
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate font-heading text-base font-semibold">
                Zubair Developer
              </span>
              <span className="truncate text-xs text-muted-foreground">
                Admin panel
              </span>
            </span>
          )}
        </Link>
      </div>

      {/* Page filter */}
      {collapsed || items.length === 0 ? null : (
        <div className="shrink-0 px-2 pt-2">
          <div className="relative">
            <FiSearch
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              ref={filterRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onFilterKeyDown}
              placeholder="Filter pages…"
              aria-label="Filter admin pages"
              aria-describedby={`${uid}-filter-hint`}
              autoComplete="off"
              spellCheck={false}
              className={cn(
                "h-9 w-full rounded-lg border border-input bg-background pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:appearance-none",
                focusRing,
              )}
            />
            {query ? (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear page filter"
                className={cn(
                  "absolute right-1.5 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground",
                  focusRing,
                )}
              >
                <FiX aria-hidden="true" className="size-3.5" />
              </button>
            ) : null}
          </div>
          <p id={`${uid}-filter-hint`} className="sr-only">
            Type to filter pages. Press Enter to open the first match, or the
            down arrow to move into the list.
          </p>
          <span role="status" aria-live="polite" className="sr-only">
            {searching
              ? resultCount === 0
                ? "No pages found"
                : `${resultCount} ${resultCount === 1 ? "page" : "pages"} found`
              : ""}
          </span>

          {/* Result summary while filtering */}
          {searching && resultCount > 0 ? (
            <p className="px-1 pt-2 text-xs text-muted-foreground">
              {resultCount} {resultCount === 1 ? "page" : "pages"} found
            </p>
          ) : null}
        </div>
      )}

      {/* Navigation */}
      <nav
        ref={navRef}
        aria-label="Admin"
        onKeyDown={onNavKeyDown}
        className="flex-1 overflow-y-auto overscroll-contain p-2"
      >
        {searching && resultCount === 0 ? (
          <div className="px-3 py-8 text-center">
            <p className="text-sm font-medium text-foreground">
              No pages match “{query.trim()}”
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Check the spelling. You may not have access to some pages.
            </p>
            <button
              type="button"
              onClick={clearSearch}
              className={cn(
                "mt-3 rounded-md px-2 py-1 text-xs font-medium text-primary hover:underline",
                focusRing,
              )}
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {/* Expand / collapse every group at once */}
            {showToolbar ? (
              <div className="flex justify-end px-1">
                <button
                  type="button"
                  onClick={() => setAllGroups(!allClosed)}
                  className={cn(
                    "rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground motion-reduce:transition-none",
                    focusRing,
                  )}
                >
                  {allClosed ? "Expand all" : "Collapse all"}
                </button>
              </div>
            ) : null}

            {/* Pinned pages */}
            {!collapsed && !searching && pinnedItems.length > 0 ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between px-3 pb-1 pt-1">
                  <p
                    id={`${uid}-pinned`}
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Pinned
                  </p>
                  <button
                    type="button"
                    onClick={clearFavorites}
                    aria-label="Unpin all pages"
                    className={cn(
                      "rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground motion-reduce:transition-none",
                      focusRing,
                    )}
                  >
                    Clear
                  </button>
                </div>
                <ul
                  aria-labelledby={`${uid}-pinned`}
                  className="flex flex-col gap-0.5"
                >
                  {pinnedItems.map(renderItem)}
                </ul>
              </div>
            ) : null}

            {groups.map((group, groupIndex) => {
              const hasHeading =
                hasGroups && Boolean(group.heading) && !collapsed;
              const canCollapse = hasHeading && !searching;
              const isOpen =
                !canCollapse || !closedGroups.includes(group.heading);
              const headingId = `${uid}-h${groupIndex}`;
              const listId = `${uid}-l${groupIndex}`;
              const hasPinnedAbove =
                !collapsed && !searching && pinnedItems.length > 0;
              const headingSpacing =
                groupIndex === 0 && !hasPinnedAbove && !showToolbar
                  ? "pt-1"
                  : "pt-4";
              const holdsActivePage = group.heading === activeGroup;

              return (
                <div
                  key={group.heading || "all"}
                  className="flex flex-col gap-1"
                >
                  {collapsed && groupIndex > 0 && hasGroups ? (
                    <div
                      className="mx-3 my-2 h-px bg-border"
                      role="presentation"
                    />
                  ) : null}

                  {canCollapse ? (
                    <button
                      type="button"
                      id={headingId}
                      aria-expanded={isOpen}
                      aria-controls={listId}
                      onClick={() => toggleGroup(group.heading)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md px-3 pb-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground motion-reduce:transition-none",
                        headingSpacing,
                        focusRing,
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        {group.heading}
                        <span className="font-normal tabular-nums opacity-70">
                          {group.items.length}
                        </span>
                        {/* A collapsed group still tells you where you are. */}
                        {!isOpen && holdsActivePage ? (
                          <>
                            <span
                              aria-hidden="true"
                              className="size-1.5 rounded-full bg-primary"
                            />
                            <span className="sr-only">
                              (contains current page)
                            </span>
                          </>
                        ) : null}
                      </span>
                      <FiChevronDown
                        aria-hidden="true"
                        className={cn(
                          "size-3.5 transition-transform duration-200 motion-reduce:transition-none",
                          !isOpen && "-rotate-90",
                        )}
                      />
                    </button>
                  ) : hasHeading ? (
                    <p
                      id={headingId}
                      className={cn(
                        "px-3 pb-1 text-xs font-medium text-muted-foreground",
                        headingSpacing,
                      )}
                    >
                      {group.heading}
                    </p>
                  ) : null}

                  <div
                    id={listId}
                    data-closed={isOpen ? undefined : "true"}
                    className={cn(
                      "grid [transition-property:grid-template-rows,visibility] duration-200 motion-reduce:transition-none",
                      isOpen
                        ? "visible grid-rows-[1fr]"
                        : "invisible grid-rows-[0fr]",
                    )}
                  >
                    <ul
                      aria-labelledby={hasHeading ? headingId : undefined}
                      className="-m-1 flex min-h-0 flex-col gap-0.5 overflow-hidden p-1"
                    >
                      {group.items.map(renderItem)}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="flex shrink-0 flex-col gap-0.5 border-t border-border p-2">
        <button
          type="button"
          onClick={() => openPaletteView("search")}
          aria-label={collapsed ? "Open command palette" : undefined}
          aria-keyshortcuts="Control+K Meta+K"
          title={collapsed ? `Command palette (${mod} K)` : undefined}
          className={cn(
            footerButtonClass,
            collapsed && "justify-center px-0",
            focusRing,
          )}
        >
          {collapsed ? (
            <FiSearch aria-hidden="true" className="size-4 shrink-0" />
          ) : (
            <FiCommand aria-hidden="true" className="size-4 shrink-0" />
          )}
          {collapsed ? null : (
            <>
              <span className="flex-1 truncate text-left">Command palette</span>
              <kbd className={kbdClass}>{mod} K</kbd>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => openPaletteView("shortcuts")}
          aria-label={collapsed ? "Keyboard shortcuts" : undefined}
          title={collapsed ? "Keyboard shortcuts (?)" : undefined}
          className={cn(
            footerButtonClass,
            collapsed && "justify-center px-0",
            focusRing,
          )}
        >
          <FiHelpCircle aria-hidden="true" className="size-4 shrink-0" />
          {collapsed ? null : (
            <>
              <span className="flex-1 truncate text-left">
                Keyboard shortcuts
              </span>
              <kbd className={kbdClass}>?</kbd>
            </>
          )}
        </button>

        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={
            collapsed ? "View public site (opens in a new tab)" : undefined
          }
          title={collapsed ? "View public site" : undefined}
          className={cn(
            footerButtonClass,
            collapsed && "justify-center px-0",
            focusRing,
          )}
        >
          <FiExternalLink aria-hidden="true" className="size-4 shrink-0" />
          {collapsed ? null : (
            <>
              <span className="truncate">View public site</span>
              <span className="sr-only">(opens in a new tab)</span>
            </>
          )}
        </Link>
      </div>
    </div>
  );
}
