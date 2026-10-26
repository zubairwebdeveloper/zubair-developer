import Link from "next/link";
import { FiInbox } from "react-icons/fi";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const SIZES = {
  sm: {
    wrapper: "gap-2 px-4 py-8",
    icon: "size-10",
    iconGlyph: "size-5",
    title: "text-base",
  },
  md: {
    wrapper: "gap-3 px-6 py-14",
    icon: "size-14",
    iconGlyph: "size-6",
    title: "text-card-title",
  },
};

/** Renders one action as a link (href) or a button (onClick). */
function EmptyAction({ action, variant }) {
  if (!action?.label) return null;

  const classes = cn(buttonVariants({ variant }), "gap-2");

  if (action.href) {
    return (
      <Link href={action.href} className={classes}>
        {action.label}
      </Link>
    );
  }

  if (typeof action.onClick === "function") {
    return (
      <button type="button" onClick={action.onClick} className={classes}>
        {action.label}
      </button>
    );
  }

  return null;
}

/**
 * @param {string} title
 * @param {string} [description]
 * @param {{ label: string, href?: string, onClick?: () => void }} [action]          Main action (link or button)
 * @param {{ label: string, href?: string, onClick?: () => void }} [secondaryAction] Quieter second action
 * @param {React.ElementType} [icon]   Any icon component, e.g. FiSearch (default: inbox)
 * @param {"sm" | "md"} [size]         "sm" for small panels and lists (default "md")
 * @param {"h2" | "h3" | "h4"} [as]    Heading level so the page outline stays correct (default "h3")
 * @param {boolean} [bordered]         Dashed border (default true). Turn off inside cards.
 * @param {React.ReactNode} [children] Extra content under the description, e.g. tips
 * @param {string} [className]
 */
export function EmptyState({
  title,
  description,
  action,
  secondaryAction,
  icon: Icon = FiInbox,
  size = "md",
  as: Heading = "h3",
  bordered = true,
  children,
  className,
}) {
  const sizing = SIZES[size] ?? SIZES.md;
  const hasActions = Boolean(action?.label || secondaryAction?.label);

  return (
    <div
      role="status"
      className={cn(
        "flex w-full flex-col items-center text-center",
        sizing.wrapper,
        bordered && "rounded-xl border border-dashed border-border",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "mb-1 grid shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary/10 via-muted to-brand/10 text-muted-foreground",
          sizing.icon,
        )}
      >
        <Icon className={sizing.iconGlyph} />
      </span>

      <Heading className={cn("text-balance font-semibold", sizing.title)}>
        {title}
      </Heading>

      {description ? (
        <p className="max-w-md text-pretty leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}

      {children ? (
        <div className="max-w-md text-sm text-muted-foreground">{children}</div>
      ) : null}

      {hasActions ? (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <EmptyAction action={action} variant="outline" />
          <EmptyAction action={secondaryAction} variant="ghost" />
        </div>
      ) : null}
    </div>
  );
}
