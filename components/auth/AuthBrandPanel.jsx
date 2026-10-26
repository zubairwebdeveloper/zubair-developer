import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { siteConfig } from "@/config/site";
import { AuthBrandContent } from "@/components/auth/AuthBrandContent";

/** What the brand does. These match the site's positioning. */
const expertise = [
  "Full stack web development",
  "SaaS solutions",
  "AI chatbot automation",
];

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-foreground";

export function AuthBrandPanel() {
  return (
    <aside
      aria-label={`${siteConfig.name} account benefits`}
      className="relative isolate hidden overflow-hidden bg-foreground p-12 text-background lg:flex lg:flex-col lg:justify-between xl:p-16"
    >
      {/* Decorative background: fine grid, soft accent glows, one outlined shape */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklab,var(--background)_6%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--background)_6%,transparent)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_top_right,black_20%,transparent_75%)]" />
        <div className="absolute -right-24 -top-24 size-80 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 size-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-24 right-12 size-28 rotate-12 rounded-3xl border border-background/15" />
      </div>

      <Link
        href="/"
        className={`relative w-fit rounded-md font-heading text-xl font-semibold tracking-tight ${focusRing}`}
      >
        {siteConfig.name}
      </Link>

      <div className="relative flex max-w-md flex-col gap-8">
        {/* Route ke mutabiq badalne wala hissa */}
        <AuthBrandContent />

        {/* Static hissa: transition ke dauran stable rehta hai */}
        <div className="flex flex-col gap-3 border-t border-background/15 pt-6">
          <p className="text-sm text-background/70">
            Built by {siteConfig.name}
          </p>
          <ul className="flex flex-wrap gap-2">
            {expertise.map((item) => (
              <li
                key={item}
                className="rounded-full border border-background/15 bg-background/5 px-3 py-1 text-xs font-medium text-background/80"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm text-background/70">
        <p>
          &copy; {new Date().getFullYear()} {siteConfig.name}
        </p>
        <Link
          href="/"
          className={`inline-flex items-center gap-1.5 rounded-md transition-colors hover:text-background motion-reduce:transition-none ${focusRing}`}
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back to site
        </Link>
      </div>
    </aside>
  );
}
