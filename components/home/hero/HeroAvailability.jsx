export function HeroAvailability({ availability }) {
  if (typeof availability !== "string" || !availability.trim()) return null;

  const status = availability.trim();
  return (
    <p
      role="status"
      aria-label={`Availability: ${status}`}
      className="inline-flex max-w-full items-center gap-2 rounded-full border border-border/80 bg-card/85 px-3 py-1.5 text-xs font-medium text-foreground"
    >
      <span aria-hidden="true" className="relative flex size-2 shrink-0">
        <span className="absolute inline-flex size-full rounded-full bg-success/50 motion-safe:animate-ping motion-reduce:animate-none" />
        <span className="relative inline-flex size-2 rounded-full bg-success" />
      </span>
      <span className="min-w-0 break-words">{status}</span>
    </p>
  );
}
