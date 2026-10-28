import { cn } from "@/lib/utils/cn";

/**
 * Skeleton loading states.
 * Use these while data is loading to prevent layout shift.
 * All skeletons match the dimensions of their target components.
 */

/**
 * Card skeleton - for service cards, project cards, etc.
 */
export function CardSkeleton({ className }) {
  return (
    <div
      className={cn(
        "surface-card rounded-2xl p-6 sm:p-8",
        "animate-pulse",
        className,
      )}
    >
      <div className="mb-4 h-6 w-1/2 rounded bg-muted" />
      <div className="mb-6 h-24 w-full rounded bg-muted" />
      <div className="mb-4 h-4 w-3/4 rounded bg-muted" />
      <div className="h-10 w-32 rounded bg-muted" />
    </div>
  );
}

/**
 * Text skeleton - for paragraphs, descriptions
 */
export function TextSkeleton({ lines = 3, className }) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-4 rounded bg-muted animate-pulse",
            i === lines - 1 ? "w-2/3" : "w-full",
          )}
        />
      ))}
    </div>
  );
}

/**
 * Hero skeleton - for the hero section
 */
export function HeroSkeleton({ className }) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="h-8 w-32 rounded bg-muted animate-pulse" />
      <div className="h-16 w-3/4 rounded bg-muted animate-pulse" />
      <div className="h-6 w-full max-w-2xl rounded bg-muted animate-pulse" />
      <div className="flex gap-3">
        <div className="h-12 w-40 rounded bg-muted animate-pulse" />
        <div className="h-12 w-32 rounded bg-muted animate-pulse" />
      </div>
    </div>
  );
}

/**
 * Pricing skeleton - for pricing cards
 */
export function PricingSkeleton({ className }) {
  return (
    <div
      className={cn(
        "surface-card rounded-2xl p-6 sm:p-8",
        "animate-pulse",
        className,
      )}
    >
      <div className="mb-4 h-8 w-1/2 rounded bg-muted" />
      <div className="mb-6 h-12 w-24 rounded bg-muted" />
      <div className="mb-6 space-y-3">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
        <div className="h-4 w-4/5 rounded bg-muted" />
      </div>
      <div className="h-12 w-full rounded bg-muted" />
    </div>
  );
}

/**
 * Avatar skeleton - for user avatars
 */
export function AvatarSkeleton({ size = "md", className }) {
  const sizes = {
    sm: "size-8",
    md: "size-10",
    lg: "size-12",
    xl: "size-16",
  };
  return (
    <div
      className={cn(
        sizes[size] || sizes.md,
        "rounded-full bg-muted animate-pulse",
        className,
      )}
    />
  );
}

/**
 * Table skeleton - for data tables
 */
export function TableSkeleton({ rows = 5, columns = 4, className }) {
  return (
    <div className={cn("w-full", className)}>
      <div className="mb-4 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-8 flex-1 rounded bg-muted animate-pulse" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {Array.from({ length: columns }).map((_, j) => (
              <div key={j} className="h-12 flex-1 rounded bg-muted animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProjectCardSkeleton({ featured = false }) {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-2xl border border-border bg-card"
    >
      <div
        className={cn(
          "animate-pulse bg-muted motion-reduce:animate-none",
          featured ? "aspect-video md:aspect-[16/6]" : "aspect-video",
        )}
      />
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        <div className="h-5 w-24 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
        <div className="h-7 w-3/4 animate-pulse rounded bg-muted motion-reduce:animate-none" />
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-muted motion-reduce:animate-none" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted motion-reduce:animate-none" />
        </div>
        <div className="flex gap-2">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-6 w-16 animate-pulse rounded-md bg-muted motion-reduce:animate-none"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
