"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }) {
  return (
    <div
      role="alert"
      className="mx-auto flex min-h-svh max-w-xl flex-col items-center justify-center gap-4 px-4 text-center"
    >
      <h1 className="text-page-title">Something went wrong</h1>
      <p className="text-muted-foreground">
        Ek unexpected error aaya hai. Please dobara try karein.
      </p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
