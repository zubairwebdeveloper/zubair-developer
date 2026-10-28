"use client";

import {
  ArrowRight,
  Briefcase,
  Check,
  Clock,
  Copy,
  FileText,
  Laptop,
  Link2,
  Mail,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

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
import { siteConfig } from "@/config/site";

/** Edit these to match the pages your site really has. */
const defaultItems = [
  { label: "Home", href: "/", description: "Start here" },
  { label: "Projects", href: "/projects", description: "Selected work" },
  {
    label: "Services",
    href: "/services",
    description: "What I can build for you",
  },
  {
    label: "Pricing",
    href: "/pricing",
    description: "Packages and starting prices",
  },
  { label: "Blog", href: "/blog", description: "Articles" },
  { label: "FAQ", href: "/faq", description: "Common questions" },
  {
    label: "Hire me",
    href: "/hire-me",
    description: "Request a quote for your project",
    icon: Briefcase,
  },
  { label: "Contact", href: "/contact", description: "Get in touch" },
];

const THEME_ACTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
];

/** Dispatch this from any button (for example in the navbar) to open the palette:
 *  window.dispatchEvent(new Event("open-command-palette"))  */
export const OPEN_PALETTE_EVENT = "open-command-palette";

const RECENT_KEY = "command-palette-recent";
const MAX_RECENT = 4;

const kbdClass =
  "rounded border border-border bg-muted/50 px-1.5 py-0.5 font-sans text-[11px] font-medium leading-none text-muted-foreground";

// Selected-row styling: the arrow slides in when cmdk marks the row as selected.
// Row styling. cmdk marks the hovered or keyboard-selected row with data-selected="true",
// so hover and arrow keys share one highlight (no double-highlighted rows).
const itemClass =
  "cursor-pointer gap-3 py-2 transition-[background-color,color,transform] duration-150 " +
  "data-[selected=true]:bg-primary/10 data-[selected=true]:text-foreground " +
  "active:scale-[0.99] data-[disabled=true]:cursor-not-allowed " +
  "motion-reduce:transition-none motion-reduce:active:scale-100 " +
  "[&[data-selected=true]_.palette-arrow]:translate-x-0 " +
  "[&[data-selected=true]_.palette-arrow]:text-primary " +
  "[&[data-selected=true]_.palette-arrow]:opacity-100 " +
  "[&[data-selected=true]_.palette-tile]:border-primary/40 " +
  "[&[data-selected=true]_.palette-tile]:bg-primary/10 " +
  "[&[data-selected=true]_.palette-tile]:text-primary";

const iconTileClass =
  "palette-tile flex size-8 shrink-0 items-center justify-center rounded-md border border-border/70 bg-muted/50 text-muted-foreground " +
  "transition-colors duration-200 motion-reduce:transition-none";

const isExternal = (href) => /^https?:\/\//i.test(href);
const subscribeClientReady = () => () => {};
const getClientReady = () => true;
const getServerNotReady = () => false;

function isCurrentPage(pathname, href) {
  if (!pathname || isExternal(href)) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function readRecent() {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((href) => typeof href === "string")
      : [];
  } catch {
    return [];
  }
}

function writeRecent(list) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    // Storage can be blocked (private mode); recent pages are optional.
  }
}

function SlideArrow() {
  return (
    <ArrowRight
      aria-hidden="true"
      className="palette-arrow size-4 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-all duration-200 motion-reduce:transition-none"
    />
  );
}

/**
 * CommandPalette
 *
 * @param {Array} [items]  Pages to list: { label, href, description?, icon? }.
 */
export function CommandPalette({ items = defaultItems }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [recent, setRecent] = useState([]);
  const mounted = useSyncExternalStore(
    subscribeClientReady,
    getClientReady,
    getServerNotReady,
  );
  const [feedback, setFeedback] = useState({ id: null, status: "idle" }); // idle | copied | error
  const feedbackTimer = useRef(null);

  const email = siteConfig?.contact?.email ?? siteConfig?.email ?? null;

  // Ctrl or Cmd + K toggles the palette. A custom event can open it from a button.
  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    const onOpenRequest = () => setOpen(true);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpenRequest);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpenRequest);
    };
  }, []);

  // Load recent pages when opening; reset search and feedback when closing.
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (open) {
        setRecent(readRecent());
      } else {
        setSearch("");
        setFeedback({ id: null, status: "idle" });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  // Close after any navigation, including back/forward.
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setOpen(false));
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => () => clearTimeout(feedbackTimer.current), []);

  const go = useCallback(
    (href) => {
      const next = [href, ...recent.filter((entry) => entry !== href)].slice(
        0,
        MAX_RECENT,
      );
      setRecent(next);
      writeRecent(next);
      setOpen(false);

      if (isExternal(href)) {
        window.open(href, "_blank", "noopener,noreferrer");
        return;
      }
      router.push(href);
    },
    [recent, router],
  );

  async function copyText(id, text) {
    let status = "copied";
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      status = "error";
    }
    setFeedback({ id, status });
    clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(
      () => setFeedback({ id: null, status: "idle" }),
      2200,
    );
  }

  const feedbackFor = (id) => (feedback.id === id ? feedback.status : "idle");

  const recentItems = recent
    .map((href) => items.find((item) => item.href === href))
    .filter(Boolean);

  const showRecent = search.trim() === "" && recentItems.length > 0;

  function renderPageItem(item, prefix = "page") {
    const Icon = item.icon ?? FileText;

    return (
      <CommandItem
        key={`${prefix}-${item.href}`}
        value={`${prefix} ${item.label} ${item.href}`}
        keywords={item.description ? [item.description] : undefined}
        onSelect={() => go(item.href)}
        className={itemClass}
      >
        <span className={iconTileClass}>
          <Icon aria-hidden="true" className="size-4" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-medium">{item.label}</span>
          {item.description ? (
            <span className="truncate text-xs text-muted-foreground">
              {item.description}
            </span>
          ) : null}
        </span>
        {isCurrentPage(pathname, item.href) ? (
          <span className="shrink-0 rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
            Current page
          </span>
        ) : null}
        <SlideArrow />
      </CommandItem>
    );
  }

  const linkStatus = feedbackFor("copy-link");
  const emailStatus = feedbackFor("copy-email");

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search the site"
      description="Jump to a page or run a quick action"
    >
      <Command>
        <CommandInput
          value={search}
          onValueChange={setSearch}
          placeholder="Search pages and actions…"
        />
        <CommandList className="max-h-[min(60vh,26rem)]">
          <CommandEmpty>
            <div className="px-4 py-8 text-center">
              <p className="text-sm font-medium text-foreground">
                No results found
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a page name like “projects” or “hire me”, or an action like
                “dark”.
              </p>
            </div>
          </CommandEmpty>

          {showRecent ? (
            <>
              <CommandGroup heading="Recent">
                {recentItems.map((item) => {
                  const Icon = item.icon ?? Clock;

                  return (
                    <CommandItem
                      key={`recent-${item.href}`}
                      value={`recent ${item.label} ${item.href}`}
                      onSelect={() => go(item.href)}
                      className={itemClass}
                    >
                      <span className={iconTileClass}>
                        <Icon aria-hidden="true" className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1 truncate font-medium">
                        {item.label}
                      </span>
                      <SlideArrow />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              <CommandSeparator />
            </>
          ) : null}

          <CommandGroup heading="Pages">
            {items.map((item) => renderPageItem(item))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Quick actions">
            <CommandItem
              value="Copy link to this page"
              keywords={["share", "url", "clipboard"]}
              onSelect={() => copyText("copy-link", window.location.href)}
              className={itemClass}
            >
              <span className={iconTileClass}>
                {linkStatus === "copied" ? (
                  <Check aria-hidden="true" className="size-4 text-primary" />
                ) : (
                  <Link2 aria-hidden="true" className="size-4" />
                )}
              </span>
              <span className="flex-1">
                {linkStatus === "copied"
                  ? "Link copied"
                  : linkStatus === "error"
                    ? "Copy failed. Copy it from the address bar."
                    : "Copy link to this page"}
              </span>
            </CommandItem>

            {email ? (
              <>
                <CommandItem
                  value={`Send an email ${email}`}
                  keywords={["contact", "mail", "write"]}
                  onSelect={() => {
                    setOpen(false);
                    window.location.assign(`mailto:${email}`);
                  }}
                  className={itemClass}
                >
                  <span className={iconTileClass}>
                    <Mail aria-hidden="true" className="size-4" />
                  </span>
                  <span className="flex-1">Send an email</span>
                  <SlideArrow />
                </CommandItem>

                <CommandItem
                  value={`Copy email address ${email}`}
                  keywords={["contact", "mail", "clipboard"]}
                  onSelect={() => copyText("copy-email", email)}
                  className={itemClass}
                >
                  <span className={iconTileClass}>
                    {emailStatus === "copied" ? (
                      <Check
                        aria-hidden="true"
                        className="size-4 text-primary"
                      />
                    ) : (
                      <Copy aria-hidden="true" className="size-4" />
                    )}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span>
                      {emailStatus === "copied"
                        ? "Email copied"
                        : emailStatus === "error"
                          ? "Copy failed"
                          : "Copy email address"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {email}
                    </span>
                  </span>
                </CommandItem>
              </>
            ) : null}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Appearance">
            {THEME_ACTIONS.map(({ value, label, icon: Icon }) => (
              <CommandItem
                key={value}
                value={`Switch to ${label} theme`}
                keywords={["appearance", "mode", "theme", "dark", "light"]}
                onSelect={() => {
                  setTheme(value);
                  setOpen(false);
                }}
                className={itemClass}
              >
                <span className={iconTileClass}>
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                <span className="flex-1">Switch to {label} theme</span>
                {mounted && theme === value ? (
                  <Check
                    aria-label="Active theme"
                    className="size-4 shrink-0 text-primary"
                  />
                ) : null}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>

        <span role="status" aria-live="polite" className="sr-only">
          {linkStatus === "copied"
            ? "Page link copied to clipboard"
            : emailStatus === "copied"
              ? "Email address copied to clipboard"
              : linkStatus === "error" || emailStatus === "error"
                ? "Copy failed. Copy it manually."
                : ""}
        </span>

        <div className="hidden items-center justify-between gap-4 border-t border-border px-3 py-2 text-xs text-muted-foreground sm:flex">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <kbd className={kbdClass}>↑</kbd>
              <kbd className={kbdClass}>↓</kbd>
              <span>Move</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className={kbdClass}>Enter</kbd>
              <span>Select</span>
            </span>
          </div>
          <span className="flex items-center gap-1.5">
            <kbd className={kbdClass}>Esc</kbd>
            <span>Close</span>
          </span>
        </div>
      </Command>
    </CommandDialog>
  );
}
