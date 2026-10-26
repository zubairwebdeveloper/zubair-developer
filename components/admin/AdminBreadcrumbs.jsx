"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";

/* -------------------------------------------------------------------------- */
/*  Content                                                                   */
/* -------------------------------------------------------------------------- */

const labels = {
  admin: "Admin",
  leads: "Leads",
  messages: "Messages",
  notifications: "Notifications",
  projects: "Projects",
  services: "Services",
  pricing: "Pricing",
  blog: "Blog",
  testimonials: "Testimonials",
  skills: "Skills",
  experience: "Experience",
  faq: "FAQ",
  media: "Media",
  profile: "Profile",
  "ai-assistant": "AI assistant",
  "ai-knowledge": "AI knowledge",
  settings: "Settings",
  team: "Team",
  "audit-logs": "Audit logs",
  "ai-conversations": "AI conversations",
  new: "New",
  edit: "Edit",
};

/** One plain sentence per section: what you can do here. */
const descriptions = {
  leads:
    "Track every project inquiry, follow up on time, and see which ones are ready for a proposal.",
  messages: "Read and reply to messages sent through your contact form.",
  notifications:
    "Review alerts about new leads, messages, and system activity.",
  projects: "Manage the case studies and work samples shown on your portfolio.",
  services:
    "Edit the services you offer, their deliverables, and how they are described to clients.",
  pricing:
    "Update your packages, what each one includes, and what clients pay for.",
  blog: "Write, edit, and publish articles that show your expertise.",
  testimonials: "Manage verified client feedback displayed on your site.",
  skills:
    "Keep your technology stack and capabilities accurate and up to date.",
  experience: "Maintain your work history and career timeline.",
  faq: "Answer the questions clients ask before they get in touch.",
  media: "Upload and organize the images and files used across your site.",
  profile: "Update your public bio, photo, and contact details.",
  "ai-assistant":
    "Configure how your chatbot greets visitors and responds to them.",
  "ai-knowledge":
    "Control the information your AI assistant uses to answer questions.",
  "ai-conversations":
    "Review chatbot conversations and spot questions it could answer better.",
  settings: "Manage site-wide preferences, integrations, and security.",
  team: "Invite people and manage what each person can access.",
  "audit-logs": "See who changed what, and when, across the admin area.",
  new: "Fill in the details below, then save to create it.",
  edit: "Update the details below, then save your changes.",
};

const fallbackDescription = "Review and manage this record.";

const sectionGroups = [
  {
    title: "Inbox",
    items: ["leads", "messages", "notifications"],
  },
  {
    title: "Content",
    items: [
      "projects",
      "services",
      "pricing",
      "blog",
      "testimonials",
      "skills",
      "experience",
      "faq",
      "media",
      "profile",
    ],
  },
  {
    title: "AI assistant",
    items: ["ai-assistant", "ai-knowledge", "ai-conversations"],
  },
  {
    title: "System",
    items: ["settings", "team", "audit-logs"],
  },
];

const getLabel = (segment) => labels[segment] ?? "Details";
const getDescription = (segment) =>
  descriptions[segment] ?? fallbackDescription;

/* -------------------------------------------------------------------------- */
/*  Icons (inline SVG, no extra dependency)                                   */
/* -------------------------------------------------------------------------- */

function Icon({ children, className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

const HomeIcon = (p) => (
  <Icon {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V20h14V9.5" />
    <path d="M10 20v-5h4v5" />
  </Icon>
);
const ChevronRight = (p) => (
  <Icon {...p}>
    <path d="m9 6 6 6-6 6" />
  </Icon>
);
const ChevronDown = (p) => (
  <Icon {...p}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
);
const ArrowLeft = (p) => (
  <Icon {...p}>
    <path d="M19 12H5" />
    <path d="m11 6-6 6 6 6" />
  </Icon>
);
const ExternalLink = (p) => (
  <Icon {...p}>
    <path d="M14 4h6v6" />
    <path d="M20 4 10 14" />
    <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </Icon>
);
const LinkIcon = (p) => (
  <Icon {...p}>
    <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" />
    <path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
  </Icon>
);
const CheckIcon = (p) => (
  <Icon {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Icon>
);
const GridIcon = (p) => (
  <Icon {...p}>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
  </Icon>
);

/* -------------------------------------------------------------------------- */
/*  Shared styles                                                             */
/* -------------------------------------------------------------------------- */

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const actionButton = [
  "inline-flex min-h-9 items-center gap-2 rounded-lg border border-border/70 bg-card px-3 text-sm font-medium text-foreground",
  "transition-colors duration-150 motion-reduce:transition-none",
  "hover:border-primary/40 hover:bg-primary/5",
  focusRing,
].join(" ");

/* -------------------------------------------------------------------------- */
/*  Section switcher                                                          */
/* -------------------------------------------------------------------------- */

function SectionSwitcher({ activeSection }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuId = useId();

  // Close on outside click and on Escape (returning focus to the trigger).
  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        className={actionButton}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <GridIcon className="h-4 w-4 text-muted-foreground" />
        <span>Go to section</span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        id={menuId}
        role="region"
        aria-label="Admin sections"
        className={[
          "absolute right-0 z-30 mt-2 w-[min(20rem,calc(100vw-2rem))] origin-top-right rounded-xl border border-border/70 bg-popover p-2 shadow-lg",
          "max-h-[min(70vh,28rem)] overflow-y-auto",
          "transition duration-150 motion-reduce:transition-none",
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-1 opacity-0 pointer-events-none",
        ].join(" ")}
      >
        {sectionGroups.map((group) => (
          <div key={group.title} className="py-1">
            <p className="px-2 pb-1 pt-1.5 text-xs font-medium text-muted-foreground">
              {group.title}
            </p>
            <ul>
              {group.items.map((key) => {
                const isActive = key === activeSection;
                return (
                  <li key={key}>
                    <Link
                      href={`/admin/${key}`}
                      tabIndex={open ? 0 : -1}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={[
                        "flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm transition-colors motion-reduce:transition-none",
                        isActive
                          ? "bg-primary/10 font-medium text-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        focusRing,
                      ].join(" ")}
                    >
                      <span className="truncate">{getLabel(key)}</span>
                      {isActive ? (
                        <CheckIcon className="h-4 w-4 shrink-0 text-primary" />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Copy link                                                                 */
/* -------------------------------------------------------------------------- */

function CopyLinkButton() {
  const [status, setStatus] = useState("idle"); // idle | copied | error
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setStatus("idle"), 2200);
  };

  const text =
    status === "copied"
      ? "Link copied"
      : status === "error"
        ? "Copy failed"
        : "Copy link";

  return (
    <>
      <button type="button" onClick={handleCopy} className={actionButton}>
        {status === "copied" ? (
          <CheckIcon className="h-4 w-4 text-primary" />
        ) : (
          <LinkIcon className="h-4 w-4 text-muted-foreground" />
        )}
        <span>{text}</span>
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {status === "copied"
          ? "Page link copied to clipboard"
          : status === "error"
            ? "Could not copy the link. Copy it from the address bar instead."
            : ""}
      </span>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Breadcrumb trail                                                          */
/* -------------------------------------------------------------------------- */

function Separator() {
  return (
    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
  );
}

const crumbLink = [
  "rounded-md px-1.5 py-1 text-muted-foreground transition-colors motion-reduce:transition-none",
  "hover:bg-muted hover:text-foreground",
  focusRing,
].join(" ");

function Trail({ crumbs }) {
  const [expanded, setExpanded] = useState(false);

  // On small screens, keep the first and last two crumbs; fold the rest behind "…".
  const canCollapse = crumbs.length > 3;
  const lastIndex = crumbs.length - 1;
  const isFolded = (index) =>
    canCollapse && !expanded && index > 0 && index < lastIndex - 1;

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-0.5 gap-y-1 text-sm">
        {crumbs.map((crumb, index) => {
          const isLast = index === lastIndex;
          const folded = isFolded(index);
          // Show the fold button once, in place of the first folded crumb.
          const showFoldButton = canCollapse && !expanded && index === 1;

          return (
            <li
              key={crumb.href}
              className={
                folded && !showFoldButton ? "hidden sm:contents" : "contents"
              }
            >
              {showFoldButton ? (
                <span className="flex items-center gap-0.5 sm:hidden">
                  <button
                    type="button"
                    onClick={() => setExpanded(true)}
                    className={crumbLink}
                    aria-label={`Show ${crumbs.length - 3} hidden levels`}
                  >
                    …
                  </button>
                  <Separator />
                </span>
              ) : null}

              <span
                className={`items-center gap-0.5 ${
                  folded ? "hidden sm:flex" : "flex"
                }`}
              >
                {isLast ? (
                  <span
                    aria-current="page"
                    className="max-w-[16rem] truncate rounded-md bg-primary/10 px-2 py-1 font-medium text-foreground"
                  >
                    {crumb.label}
                  </span>
                ) : (
                  <>
                    <Link
                      href={crumb.href}
                      className={`${crumbLink} flex items-center gap-1.5`}
                    >
                      {index === 0 ? <HomeIcon className="h-4 w-4" /> : null}
                      <span>{crumb.label}</span>
                    </Link>
                    <Separator />
                  </>
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */

/**
 * AdminBreadcrumbs
 *
 * @param {boolean} showHeader  Show the page title, description and quick actions
 *                              under the trail. Set to false for the trail only.
 */
export function AdminBreadcrumbs({ showHeader = true }) {
  const pathname = usePathname() ?? "";
  const segments = useMemo(
    () => pathname.split("/").filter(Boolean),
    [pathname],
  );

  const crumbs = useMemo(
    () =>
      segments.map((segment, index) => ({
        segment,
        label: getLabel(segment),
        href: `/${segments.slice(0, index + 1).join("/")}`,
      })),
    [segments],
  );

  if (segments.length <= 1) return null;

  const current = crumbs[crumbs.length - 1];
  const parent = crumbs.length > 2 ? crumbs[crumbs.length - 2] : null;
  const activeSection = segments[1];

  return (
    <header
      className={showHeader ? "mb-6 border-b border-border/60 pb-5" : "mb-4"}
    >
      <Trail crumbs={crumbs} />

      {showHeader ? (
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0 max-w-2xl">
            <h1 className="text-balance text-[clamp(1.5rem,1.2rem+1.2vw,2.125rem)] font-semibold leading-tight tracking-tight text-foreground">
              {current.label}
            </h1>
            <p className="mt-1.5 max-w-prose text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              {getDescription(current.segment)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {parent ? (
              <Link href={parent.href} className={actionButton}>
                <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                <span>Back to {parent.label.toLowerCase()}</span>
              </Link>
            ) : null}

            <SectionSwitcher activeSection={activeSection} />
            <CopyLinkButton />

            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={actionButton}
            >
              <span>View live site</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">(opens in a new tab)</span>
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
