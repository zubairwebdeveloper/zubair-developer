import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * AdminPageHeader
 *
 * Required: title
 * Optional:
 *  - description  Short sentence explaining what the page is for.
 *  - actions      Buttons or links shown on the right (stacks below on mobile).
 *  - icon         A component or element shown in a tile beside the title,
 *                 e.g. icon={FiUsers} or icon={<FiUsers />}.
 *  - badge        A short status or count shown next to the title, e.g. a <Badge>.
 *  - meta         Array of { label, value } shown as small details under the
 *                 description, e.g. [{ label: "Total", value: 24 }].
 *  - backHref     Adds a back link above the title.
 *  - backLabel    Text for the back link. Defaults to "Back".
 */
export function AdminPageHeader({
  title,
  description,
  actions,
  icon: Icon,
  badge,
  meta,
  backHref,
  backLabel = "Back",
}) {
  const metaItems = Array.isArray(meta)
    ? meta.filter(
        (item) =>
          item &&
          item.value !== undefined &&
          item.value !== null &&
          item.value !== "",
      )
    : [];

  const renderIcon = () => {
    if (!Icon) return null;
    // Accept either a component (FiUsers) or an element (<FiUsers />).
    const node =
      typeof Icon === "function" ||
      (typeof Icon === "object" &&
        Icon.$$typeof === undefined &&
        Icon.render) ? (
        <Icon aria-hidden="true" className="h-5 w-5" />
      ) : (
        Icon
      );

    return (
      <span
        aria-hidden="true"
        className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 sm:inline-flex"
      >
        {node}
      </span>
    );
  };

  return (
    <header className="flex flex-col gap-4 border-b border-border/60 pb-5 md:flex-row md:items-start md:justify-between md:gap-6">
      <div className="flex min-w-0 items-start gap-4">
        {renderIcon()}

        <div className="flex min-w-0 flex-col gap-1.5">
          {backHref ? (
            <Link
              href={backHref}
              className={`mb-1 inline-flex w-fit items-center gap-1.5 rounded-md py-1 pr-2 text-sm text-muted-foreground transition-colors hover:text-foreground motion-reduce:transition-none ${focusRing}`}
            >
              <FiArrowLeft aria-hidden="true" className="h-4 w-4" />
              <span>{backLabel}</span>
            </Link>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-balance font-heading text-[clamp(1.5rem,1.2rem+1.2vw,2rem)] font-semibold leading-tight tracking-tight">
              {title}
            </h1>
            {badge ? <div className="flex items-center">{badge}</div> : null}
          </div>

          {description ? (
            <p className="max-w-prose text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              {description}
            </p>
          ) : null}

          {metaItems.length > 0 ? (
            <dl className="mt-1 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
              {metaItems.map((item) => (
                <div key={item.label} className="flex items-baseline gap-1.5">
                  <dt className="text-muted-foreground">{item.label}</dt>
                  <dd className="font-medium text-foreground">{item.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </div>

      {actions ? (
        <div className="flex flex-wrap items-center gap-2 md:shrink-0 md:justify-end">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
