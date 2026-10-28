import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LeadsTable } from "@/components/admin/LeadsTable";
import { ReloadButton } from "@/components/admin/ReloadButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Reveal } from "@/components/shared/Reveal";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LEAD_STATUS, LEAD_STATUS_LABELS } from "@/constants/lead-status";
import { hasPermission, PERMISSIONS } from "@/lib/auth/permissions";
import { requirePageAdmin } from "@/lib/auth/require-admin";
import { parseLeadSearch } from "@/lib/leads/search";
import { isValidDocId } from "@/lib/utils/slugs";
import { listLeads, searchLeads } from "@/services/leads.service";

export const metadata = { title: "Leads" };

const BASE = "/admin/leads";

function buildHref(params) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value),
  ).toString();
  return query ? `${BASE}?${query}` : BASE;
}

export default async function LeadsPage({ searchParams }) {
  const admin = await requirePageAdmin(PERMISSIONS.LEADS_READ);
  const canManage = hasPermission(admin.role, PERMISSIONS.LEADS_MANAGE);

  const { status, after, q } = await searchParams;
  const activeStatus = Object.values(LEAD_STATUS).includes(status)
    ? status
    : null;
  const cursor = isValidDocId(after) ? after : null;
  const search = typeof q === "string" ? q.trim().slice(0, 100) : "";
  const searchValid = parseLeadSearch(search) !== null;

  let data = null;
  try {
    data =
      search && searchValid
        ? {
            leads: await searchLeads(search, { status: activeStatus }),
            nextCursor: null,
          }
        : search
          ? { leads: [], nextCursor: null }
          : await listLeads({ status: activeStatus, after: cursor });
  } catch (error) {
    console.error("[admin] failed to list leads:", error);
  }

  const filters = [
    { value: null, label: "All" },
    ...Object.values(LEAD_STATUS).map((value) => ({
      value,
      label: LEAD_STATUS_LABELS[value],
    })),
  ];

  const leads = data?.leads ?? [];

  // Is page par maujood leads ka status breakdown (sirf loaded data se)
  const breakdown = Object.values(LEAD_STATUS)
    .map((value) => ({
      value,
      count: leads.filter((lead) => lead.status === value).length,
    }))
    .filter((item) => item.count > 0);

  const activeFilterLabel = activeStatus
    ? LEAD_STATUS_LABELS[activeStatus]
    : null;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Leads"
        description="Project briefs submitted from the website."
        actions={
          <Link
            href="/api/admin/leads/export/"
            prefetch={false}
            download
            className={buttonVariants({ variant: "outline" })}
          >
            <Download aria-hidden="true" className="size-4" />
            Export CSV
          </Link>
        }
      />

      {/* Search */}
      <Reveal direction="up">
        <div className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-4 sm:p-5">
          <form
            action={BASE}
            method="get"
            role="search"
            className="flex flex-col gap-2 sm:flex-row sm:items-center"
          >
            {activeStatus ? (
              <input type="hidden" name="status" value={activeStatus} />
            ) : null}
            <div className="relative min-w-0 flex-1">
              <Search
                aria-hidden="true"
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              />
              <Input
                type="search"
                name="q"
                defaultValue={search}
                placeholder="Reference (ZD-XXXXXXXX) or start of an email"
                aria-label="Search leads by reference or email"
                autoComplete="off"
                className="min-h-11 w-full pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="min-h-11 flex-1 sm:flex-none">
                Search
              </Button>
              {search ? (
                <Link
                  href={buildHref({ status: activeStatus })}
                  className={`${buttonVariants({ variant: "ghost" })} min-h-11`}
                >
                  Clear
                </Link>
              ) : null}
            </div>
          </form>

          <p className="text-muted-foreground text-xs leading-5">
            Search matches the start of a reference or email, not names. Enter
            at least 3 characters.
          </p>

          {search && !searchValid ? (
            <p
              role="status"
              className="border-border bg-muted/40 text-muted-foreground rounded-lg border p-3 text-sm leading-6"
            >
              Please enter at least 3 characters. Search works only from the
              start of a reference or email, not by name.
            </p>
          ) : null}

          {/* Status filters */}
          <nav
            aria-label="Filter leads by status"
            className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0"
          >
            {filters.map((filter) => {
              const selected = activeStatus === filter.value;
              return (
                <Link
                  key={filter.label}
                  href={buildHref({ status: filter.value, q: search })}
                  aria-current={selected ? "page" : undefined}
                  className={`${buttonVariants({
                    size: "sm",
                    variant: selected ? "default" : "outline",
                  })} shrink-0`}
                >
                  {filter.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </Reveal>

      {data ? (
        <>
          {/* Summary */}
          <p
            className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-2 text-sm"
            role="status"
          >
            <span className="inline-flex items-center gap-2">
              <Users aria-hidden="true" className="size-4" />
              <span className="text-foreground font-medium tabular-nums">
                {leads.length}
              </span>{" "}
              {leads.length === 1 ? "lead" : "leads"} on this page
            </span>
            {activeFilterLabel ? (
              <span>· Status: {activeFilterLabel}</span>
            ) : null}
            {search && searchValid ? <span>· Matching “{search}”</span> : null}
          </p>

          {breakdown.length > 1 ? (
            <ul
              aria-label="Status breakdown for this page"
              className="flex flex-wrap items-center gap-3"
            >
              {breakdown.map((item) => (
                <li key={item.value} className="flex items-center gap-1.5">
                  <StatusBadge
                    status={item.value}
                    label={LEAD_STATUS_LABELS[item.value]}
                  />
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {item.count}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          {leads.length === 0 ? (
            <div className="border-border bg-card flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-12 text-center">
              <span
                aria-hidden="true"
                className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-xl"
              >
                <Search className="size-5" />
              </span>
              <h2 className="font-heading text-lg font-semibold tracking-tight">
                {search || activeStatus ? "No leads match" : "No leads yet"}
              </h2>
              <p className="text-muted-foreground max-w-sm text-sm leading-6">
                {search || activeStatus
                  ? "Try a different reference, email start or status."
                  : "Project briefs sent from the website will appear here."}
              </p>
              {search || activeStatus ? (
                <Link
                  href={BASE}
                  className={buttonVariants({ variant: "outline" })}
                >
                  Reset filters
                </Link>
              ) : null}
            </div>
          ) : (
            <Reveal direction="up">
              <LeadsTable leads={leads} canManage={canManage} />
            </Reveal>
          )}

          {data.nextCursor || cursor ? (
            <nav
              aria-label="Pagination"
              className="flex flex-wrap items-center gap-3"
            >
              {cursor ? (
                <Link
                  href={buildHref({ status: activeStatus })}
                  className={buttonVariants({ variant: "outline" })}
                >
                  <ArrowLeft aria-hidden="true" className="size-4" />
                  Back to newest
                </Link>
              ) : null}
              {data.nextCursor ? (
                <Link
                  href={buildHref({
                    status: activeStatus,
                    after: data.nextCursor,
                  })}
                  className={buttonVariants({ variant: "outline" })}
                >
                  Next page
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              ) : null}
            </nav>
          ) : null}

          <div className="border-border bg-muted/40 flex items-start gap-3 rounded-xl border p-4 text-sm">
            <ShieldCheck
              aria-hidden="true"
              className="text-primary mt-0.5 size-4 shrink-0"
            />
            <p className="text-muted-foreground leading-6">
              Leads contain personal data. Export and share them only when
              needed.
            </p>
          </div>
        </>
      ) : (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/5 flex max-w-2xl flex-col items-start gap-3 rounded-2xl border p-5"
        >
          <p className="text-destructive font-medium">Could not load leads.</p>
          <p className="text-muted-foreground text-sm leading-6">
            Check your Firebase configuration and indexes. The technical details
            are in your server logs.
          </p>
          <ReloadButton />
        </div>
      )}
    </div>
  );
}
