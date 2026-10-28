import Link from "next/link";
import { Home, ArrowRight, LayoutGrid } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center px-4">
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid-subtle opacity-30"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 size-80 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl motion-safe:animate-pulse"
      />

      <div className="relative flex max-w-xl flex-col items-center gap-6 text-center">
        <div className="flex flex-col items-center gap-2">
          <span className="font-heading text-8xl font-bold tracking-tight text-foreground/10 sm:text-9xl">
            404
          </span>
          <div className="h-1 w-16 rounded-full bg-primary" />
        </div>

        <h1 className="text-page-title text-balance">
          Page not found
        </h1>

        <p className="max-w-md text-body-lg text-muted-foreground text-pretty">
          The link may be incorrect, or the page may have been moved or removed.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/" className={cn(buttonVariants({ size: "lg" }), "group gap-2")}>
            <Home aria-hidden="true" className="size-4" />
            Back to home
          </Link>
          <Link
            href="/services"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "group gap-2",
            )}
          >
            <LayoutGrid aria-hidden="true" className="size-4" />
            View services
          </Link>
          <Link
            href="/contact"
            className={cn(
              buttonVariants({ variant: "ghost", size: "lg" }),
              "group gap-2",
            )}
          >
            Get in touch
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
