import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

// Tailwind ko poori class strings chahiye, isliye tones literal likhe hain.
const TONES = {
  success: "border-success/25 bg-success/15 text-success",
  warning: "border-warning/25 bg-warning/15 text-warning",
  info: "border-info/25 bg-info/15 text-info",
  brand: "border-brand/25 bg-brand/15 text-brand",
  danger: "border-destructive/25 bg-destructive/15 text-destructive",
  neutral: "border-border bg-muted text-muted-foreground",
};

const STATUS_TONES = {
  published: "success",
  draft: "warning",
  archived: "neutral",
  new: "info",
  contacted: "info",
  qualified: "brand",
  proposal_sent: "brand",
  negotiation: "warning",
  won: "success",
  lost: "danger",
  handled: "success",
  active: "success",
  disabled: "danger",
  sent: "success",
  sending: "warning",
  failed: "danger",
  dead: "danger",
};

// In states mein kaam abhi chal raha hota hai, isliye dot halka sa pulse karta hai.
const LIVE_STATUSES = new Set(["sending"]);

export function StatusBadge({ status, label, showDot = true, className }) {
  const tone = TONES[STATUS_TONES[status]] ?? TONES.neutral;
  const text =
    label ?? (status ? String(status).replaceAll("_", " ") : "unknown");

  return (
    <Badge
      variant="secondary"
      className={cn("gap-1.5 border font-medium capitalize", tone, className)}
    >
      {showDot ? (
        <span
          aria-hidden="true"
          className={cn(
            "size-1.5 shrink-0 rounded-full bg-current",
            LIVE_STATUSES.has(status) && "motion-safe:animate-pulse",
          )}
        />
      ) : null}
      {text}
    </Badge>
  );
}
