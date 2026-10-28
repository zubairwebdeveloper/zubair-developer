"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils/cn";

const COLLAPSED_KEY = "admin-shell:sidebar-collapsed";
const DESKTOP_QUERY = "(min-width: 768px)"; // Tailwind `md`

export function AdminShell({ admin, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Restore the sidebar preference after mount (avoids a hydration mismatch).
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        if (window.localStorage.getItem(COLLAPSED_KEY) === "true")
          setCollapsed(true);
      } catch {
        // Storage can be unavailable. The sidebar simply starts expanded.
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  // Close the mobile drawer if the window grows to desktop size while it is open.
  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);
    const onChange = (event) => {
      if (event.matches) setMobileOpen(false);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  function toggleCollapsed() {
    setCollapsed((value) => {
      const next = !value;
      try {
        window.localStorage.setItem(COLLAPSED_KEY, String(next));
      } catch {
        // Ignore storage errors; the toggle still works for this session.
      }
      return next;
    });
  }

  return (
    <div className="min-h-svh bg-background md:flex">
      {/* Lets keyboard and screen reader users skip the sidebar and header. */}
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:border focus:border-border focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Skip to main content
      </a>

      <aside
        aria-label="Admin sidebar"
        className={cn(
          "sticky top-0 hidden h-svh shrink-0 border-r border-border bg-card transition-[width] duration-200 motion-reduce:transition-none md:block",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <AdminSidebar role={admin.role} collapsed={collapsed} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 max-w-[85vw] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Admin menu</SheetTitle>
            <SheetDescription>Navigate the admin panel</SheetDescription>
          </SheetHeader>
          <AdminSidebar
            role={admin.role}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          admin={admin}
          isCollapsed={collapsed}
          onOpenMenu={() => setMobileOpen(true)}
          onToggleCollapse={toggleCollapsed}
        />

        <main
          id="admin-main"
          tabIndex={-1}
          className="flex-1 px-4 py-6 focus:outline-none sm:px-6 sm:py-8"
        >
          <div className="mx-auto flex w-full max-w-screen-2xl flex-col">
            {/* Trail only: each page supplies its own title through AdminPageHeader. */}
            <AdminBreadcrumbs showHeader={false} />
            {children}
          </div>
        </main>

        <footer className="border-t border-border/60 px-4 py-4 sm:px-6">
          <div className="mx-auto flex w-full max-w-screen-2xl flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <p>Zubair Developer admin</p>
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md underline-offset-4 transition-colors hover:text-foreground hover:underline motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              View public site
              <span className="sr-only"> (opens in a new tab)</span>
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
