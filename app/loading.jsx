import { HeroSkeleton, TextSkeleton } from "@/components/shared/Skeletons";

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-16"
    >
      <span className="sr-only">Loading content…</span>
      <HeroSkeleton />
      <div className="mt-8">
        <TextSkeleton lines={3} />
      </div>
    </div>
  );
}
