"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";
import { Accessibility, Check, ImageIcon, Lightbulb } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];
const OFFSET = 36;

const TABS = [
  {
    id: "descriptions",
    label: "Descriptions",
    icon: Accessibility,
    intro:
      "A description (alt text) tells screen reader users and search engines what an image shows.",
    good: [
      "Describe what is in the image, in one short sentence.",
      "Mention text that appears inside the image.",
      "Write for someone who cannot see it.",
    ],
    avoid: [
      "Starting with “image of” or “picture of”.",
      "Repeating the file name, such as IMG_2041.",
      "Stuffing keywords to rank in search.",
    ],
    example: {
      bad: "dashboard-final-2.png",
      good: "Analytics dashboard showing weekly visitors in a line chart",
    },
  },
  {
    id: "preparing",
    label: "Preparing images",
    icon: ImageIcon,
    intro:
      "A little preparation keeps pages fast and images sharp on every screen.",
    good: [
      "Crop to the subject before uploading.",
      "Use JPEG for photos, PNG for sharp UI or text, WebP for smaller files.",
      "Give files a clear name, such as crm-dashboard.webp.",
    ],
    avoid: [
      "Uploading huge originals straight from a camera.",
      "Screenshots with private data, emails or tokens visible.",
      "Images with a lot of tiny text that is unreadable on mobile.",
    ],
    example: {
      bad: "Screenshot 2026-03-01 at 10.22.14.png",
      good: "client-portal-dashboard.webp",
    },
  },
  {
    id: "using",
    label: "Using images",
    icon: Lightbulb,
    intro:
      "Where an image is used decides how it should look and what it needs.",
    good: [
      "Cover images work best in a wide landscape shape.",
      "Use Copy URL to place an image where a link is needed.",
      "Use Open to check the full image in a new tab.",
    ],
    avoid: [
      "Deleting an image that is still used in a project or post. It will be refused.",
      "Reusing one image for unrelated content.",
      "Leaving the description empty on images used in content.",
    ],
    example: {
      bad: "Same cover image on every post",
      good: "A relevant cover image for each post or project",
    },
  },
];

const IDS = TABS.map((t) => t.id);

export function MediaGuide() {
  const reduce = useReducedMotion();
  const [view, setView] = useState({ id: "descriptions", dir: 1 });
  const tabRefs = useRef({});

  const index = IDS.indexOf(view.id);
  const tab = TABS[index];

  function go(id, focus = false) {
    if (id === view.id) return;
    setView({ id, dir: IDS.indexOf(id) > index ? 1 : -1 });
    if (focus) tabRefs.current[id]?.focus();
  }

  function onKeyDown(event) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % TABS.length;
    else if (event.key === "ArrowLeft")
      next = (index - 1 + TABS.length) % TABS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = TABS.length - 1;
    else return;
    event.preventDefault();
    go(IDS[next], true);
  }

  const custom = { dir: view.dir, reduce: Boolean(reduce) };
  const variants = {
    enter: ({ dir, reduce: r }) => ({ opacity: 0, x: r ? 0 : dir * OFFSET }),
    center: { opacity: 1, x: 0 },
    exit: ({ dir, reduce: r }) => ({ opacity: 0, x: r ? 0 : -dir * OFFSET }),
  };

  return (
    <section
      aria-label="Media guide"
      className="border-border bg-card flex min-w-0 flex-col gap-5 rounded-2xl border p-4 sm:p-6"
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-lg font-semibold tracking-tight">
          Media guide
        </h2>
        <p className="text-muted-foreground text-sm leading-6">
          Short tips for clear, accessible and fast images.
        </p>
      </div>

      <LayoutGroup id="media-guide-tabs">
        <div
          role="tablist"
          aria-label="Media guide topics"
          onKeyDown={onKeyDown}
          className="bg-muted flex gap-1 overflow-x-auto rounded-xl p-1"
        >
          {TABS.map(({ id, label, icon: Icon }) => {
            const selected = view.id === id;
            return (
              <button
                key={id}
                ref={(node) => {
                  tabRefs.current[id] = node;
                }}
                type="button"
                role="tab"
                id={`media-guide-tab-${id}`}
                aria-selected={selected}
                aria-controls={`media-guide-panel-${id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => go(id)}
                className={`focus-visible:ring-ring relative flex min-h-10 flex-1 shrink-0 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium whitespace-nowrap outline-none transition-colors focus-visible:ring-2 motion-reduce:transition-none ${
                  selected
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {selected ? (
                  <motion.span
                    layoutId="media-guide-indicator"
                    aria-hidden="true"
                    className="bg-background absolute inset-0 rounded-lg shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 36 }
                    }
                  />
                ) : null}
                <Icon aria-hidden="true" className="relative z-10 size-4" />
                <span className="relative z-10">{label}</span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>

      <div className="overflow-x-clip">
        <AnimatePresence mode="wait" initial={false} custom={custom}>
          <motion.div
            key={view.id}
            custom={custom}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduce ? 0.01 : 0.28, ease: EASE }}
            role="tabpanel"
            id={`media-guide-panel-${view.id}`}
            aria-labelledby={`media-guide-tab-${view.id}`}
            className="flex flex-col gap-5"
          >
            <p className="text-muted-foreground max-w-[68ch] leading-7">
              {tab.intro}
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="border-border bg-background rounded-xl border p-4">
                <h3 className="mb-3 text-sm font-medium">Do</h3>
                <ul className="flex flex-col gap-2.5">
                  {tab.good.map((line) => (
                    <li key={line} className="flex items-start gap-2.5 text-sm">
                      <Check
                        aria-hidden="true"
                        className="text-primary mt-0.5 size-4 shrink-0"
                      />
                      <span className="text-foreground/85 leading-6">
                        {line}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-border bg-background rounded-xl border p-4">
                <h3 className="mb-3 text-sm font-medium">Avoid</h3>
                <ul className="flex flex-col gap-2.5">
                  {tab.avoid.map((line) => (
                    <li key={line} className="flex items-start gap-2.5 text-sm">
                      <span
                        aria-hidden="true"
                        className="bg-muted-foreground/50 mt-2.5 h-px w-3 shrink-0"
                      />
                      <span className="text-foreground/85 leading-6">
                        {line}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <dl className="bg-muted/40 grid gap-3 rounded-xl p-4 text-sm sm:grid-cols-2">
              <div className="min-w-0">
                <dt className="text-muted-foreground mb-1 text-xs">
                  Instead of
                </dt>
                <dd className="font-mono text-xs leading-5 break-words">
                  {tab.example.bad}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-muted-foreground mb-1 text-xs">Try</dt>
                <dd className="font-mono text-xs leading-5 break-words">
                  {tab.example.good}
                </dd>
              </div>
            </dl>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
