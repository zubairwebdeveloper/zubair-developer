/**
 * SiteBackground
 *
 * A quiet, fixed backdrop: one soft glow at the top and a faint grid that fades out.
 * Both are mixed from your theme colors, so they work in light and dark mode.
 * Decorative only, and it never blocks clicks.
 */
export function SiteBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden print:hidden"
    >
      <div className="absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,color-mix(in_oklab,var(--primary)_10%,transparent),transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklab,var(--foreground)_4%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--foreground)_4%,transparent)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_top,black_10%,transparent_70%)]" />
    </div>
  );
}
