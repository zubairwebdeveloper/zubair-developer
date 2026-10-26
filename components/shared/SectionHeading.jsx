import { cn } from "@/lib/utils/cn";
import { Reveal } from "./Reveal";
const ALIGN_STYLES = {
  left: "items-start text-left",
  center: "mx-auto items-center text-center",
  right: "ml-auto items-end text-right",
};

/**
 * SectionHeading — the standard eyebrow / title / description block
 * used to introduce a page section, with an optional trailing action
 * (e.g. a "View all" link or CTA button) for left/right-aligned layouts.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  as: HeadingTag = "h2",
  actions,
  animate = true,
  className,
}) {
  const content = (
    <div
      className={cn(
        "flex max-w-2xl flex-col gap-3",
        ALIGN_STYLES[align] ?? ALIGN_STYLES.left,
        className,
      )}
    >
      {eyebrow ? (
        <p className="text-eyebrow text-brand flex items-center gap-2">
          <span
            aria-hidden="true"
            className="bg-brand h-1 w-1 shrink-0 rounded-full"
          />
          {eyebrow}
        </p>
      ) : null}

      <HeadingTag className="text-section-title text-balance">
        {title}
      </HeadingTag>

      {description ? (
        <p className="text-body-lg text-muted-foreground text-pretty max-w-prose">
          {description}
        </p>
      ) : null}
    </div>
  );

  // Heading + trailing action (e.g. "View all projects") sit on one row
  // for left/right alignment; centered headings stack actions below.
  const wrapped = actions ? (
    <div
      className={cn(
        "flex w-full gap-6",
        align === "center"
          ? "flex-col items-center"
          : "flex-col items-start justify-between sm:flex-row sm:items-end",
      )}
    >
      {content}
      <div className="shrink-0">{actions}</div>
    </div>
  ) : (
    content
  );

  if (!animate) return wrapped;

  return <Reveal direction="up">{wrapped}</Reveal>;
}
