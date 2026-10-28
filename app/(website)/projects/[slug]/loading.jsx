import { ProjectCardSkeleton } from "@/components/shared/Skeletons";

export default function ProjectDetailLoading() {
  return (
    <div
      role="status"
      aria-label="Loading case study"
      aria-busy="true"
      className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
    >
      <span className="sr-only">Loading case study…</span>
      <div
        aria-hidden="true"
        className="mb-10 flex flex-col gap-4"
      >
        <div className="h-4 w-24 animate-pulse rounded bg-muted motion-reduce:animate-none" />
        <div className="h-10 w-2/3 max-w-xl animate-pulse rounded bg-muted motion-reduce:animate-none" />
        <div className="h-5 w-full max-w-2xl animate-pulse rounded bg-muted motion-reduce:animate-none" />
      </div>
      <ProjectCardSkeleton featured />
    </div>
  );
}
