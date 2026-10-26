import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-svh max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-eyebrow text-brand">404</p>
      <h1 className="text-page-title">Ye page mojood nahi hai</h1>
      <p className="text-muted-foreground">
        Link ghalat ho sakta hai, ya page hata diya gaya ho.
      </p>
      <Link href="/" className={buttonVariants()}>
        Back to home
      </Link>
    </div>
  );
}
