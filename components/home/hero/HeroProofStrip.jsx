import { Check } from "lucide-react";

import { buildTrustItems } from "@/lib/hero/hero-content";

export function HeroProofStrip({ siteConfig, stats }) {
  const items = buildTrustItems({ siteConfig, stats });

  return (
    <ul
      aria-label="Project assurances"
      className="flex flex-wrap gap-x-4 gap-y-2 text-xs leading-relaxed text-muted-foreground sm:text-sm"
    >
      {items.map((item) => (
        <li key={item.id} className="inline-flex items-start gap-1.5">
          <Check
            aria-hidden="true"
            className="mt-0.5 size-3.5 shrink-0 text-primary"
          />
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
