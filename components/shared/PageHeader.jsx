import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";

import { Container } from "@/components/shared/Container";
import { Reveal } from "@/components/shared/Reveal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

function Breadcrumbs({ items, centered }) {
  const list = Array.isArray(items) ? items.filter((item) => item?.label) : [];
  if (list.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb">
      <ol
        className={cn(
          "flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground",
          centered && "justify-center",
        )}
      >
        {list.map((item, index) => {
          const isLast = index === list.length - 1;

          return (
            <li
              key={`${item.href ?? ""}::${item.label}`}
              className="flex items-center gap-1.5"
            >
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="rounded-sm py-0.5 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn(isLast && "font-medium text-foreground")}
                >
                  {item.label}
                </span>
              )}
              {isLast ? null : (
                <FiChevronRight
                  aria-hidden="true"
                  className="size-3.5 shrink-0"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function HeaderAction({ action, variant }) {
  if (!action?.label || !action?.href) return null;

  return (
    <Link
      href={action.href}
      className={cn(
        buttonVariants({ size: "lg", variant }),
        "w-full whitespace-normal sm:w-auto",
      )}
    >
      {action.label}
    </Link>
  );
}

/**
 * @param {string} [eyebrow]
 * @param {string} title
 * @param {string} [description]
 * @param {Array<{ label: string, href?: string }>} [breadcrumbs]  Last item is the current page
 * @param {{ label: string, href: string }} [action]               Main button
 * @param {{ label: string, href: string }} [secondaryAction]      Quieter second button
 * @param {"left" | "center"} [align]                              Default "left"
 * @param {React.ReactNode} [children]                             Extra content under the buttons, e.g. a search box
 * @param {string} [className]
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
  action,
  secondaryAction,
  align = "left",
  children,
  className,
}) {
  const centered = align === "center";
  const hasActions = Boolean(
    (action?.label && action?.href) ||
    (secondaryAction?.label && secondaryAction?.href),
  );

  return (
    <header
      className={cn(
        "relative overflow-hidden border-b border-border bg-muted/40 py-12 sm:py-14 md:py-20",
        className,
      )}
    >
      {/* Subtle grid background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid-subtle opacity-30"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-noise opacity-25"
      />
      {/* Soft brand glow, uses theme tokens so it follows light and dark mode */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -top-24 size-80 rounded-full bg-primary/10 blur-3xl",
          centered ? "left-1/2 -translate-x-1/2" : "-right-20",
        )}
      />

      <Container className="relative">
        <Reveal
          className={cn(
            "flex max-w-3xl flex-col gap-4",
            centered && "mx-auto items-center text-center",
          )}
        >
          <Breadcrumbs items={breadcrumbs} centered={centered} />

          {eyebrow ? (
            <p className="text-eyebrow text-brand">{eyebrow}</p>
          ) : null}

          <h1 className="text-page-title text-balance">{title}</h1>

          {description ? (
            <p className="text-body-lg max-w-prose text-pretty text-muted-foreground">
              {description}
            </p>
          ) : null}

          {hasActions ? (
            <div
              className={cn(
                "mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row",
                centered && "justify-center",
              )}
            >
              <HeaderAction action={action} variant="default" />
              <HeaderAction action={secondaryAction} variant="outline" />
            </div>
          ) : null}

          {children ? <div className="mt-2 w-full">{children}</div> : null}
        </Reveal>
      </Container>
    </header>
  );
}
