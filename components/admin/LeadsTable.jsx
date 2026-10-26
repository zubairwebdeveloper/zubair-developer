"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LEAD_STATUS_LABELS } from "@/constants/lead-status";
import { labelFor, serviceCategoryOptions } from "@/constants/options";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/dates";
import { sendJson } from "@/lib/utils/submit-form";

const statusOptions = Object.entries(LEAD_STATUS_LABELS);

const sortOptions = [
  { value: "default", label: "Default order" },
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "followup", label: "Follow-up soonest" },
  { value: "priority", label: "Priority, high to low" },
  { value: "name", label: "Name A to Z" },
];

const priorityRank = { high: 3, medium: 2, low: 1 };

const priorityStyles = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-primary/10 text-foreground",
  low: "bg-muted text-muted-foreground",
};

const timeOf = (value) => {
  const time = value ? Date.parse(value) : NaN;
  return Number.isNaN(time) ? null : time;
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function PriorityChip({ priority }) {
  if (!priority) return <span className="text-muted-foreground">—</span>;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        priorityStyles[priority] ?? priorityStyles.low,
      )}
    >
      {priority}
    </span>
  );
}

export function LeadsTable({ leads, canManage = false }) {
  const router = useRouter();
  const [selected, setSelected] = useState(() => new Set());
  const [bulkStatus, setBulkStatus] = useState("contacted");
  const [pending, setPending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("default");
  const [mounted, setMounted] = useState(false); // time-based flags render after mount

  useEffect(() => setMounted(true), []);

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    const matches = term
      ? leads.filter((lead) =>
          [lead.name, lead.email, lead.reference]
            .map((value) => String(value ?? "").toLowerCase())
            .some((value) => value.includes(term)),
        )
      : [...leads];

    switch (sort) {
      case "newest":
        matches.sort(
          (a, b) => (timeOf(b.createdAt) ?? 0) - (timeOf(a.createdAt) ?? 0),
        );
        break;
      case "oldest":
        matches.sort(
          (a, b) => (timeOf(a.createdAt) ?? 0) - (timeOf(b.createdAt) ?? 0),
        );
        break;
      case "followup":
        // Soonest first; leads without a follow-up go last.
        matches.sort(
          (a, b) =>
            (timeOf(a.followUpAt) ?? Number.POSITIVE_INFINITY) -
            (timeOf(b.followUpAt) ?? Number.POSITIVE_INFINITY),
        );
        break;
      case "priority":
        matches.sort(
          (a, b) =>
            (priorityRank[b.priority] ?? 0) - (priorityRank[a.priority] ?? 0),
        );
        break;
      case "name":
        matches.sort((a, b) =>
          String(a.name ?? "").localeCompare(String(b.name ?? "")),
        );
        break;
      default:
        break; // keep the order the server sent
    }
    return matches;
  }, [leads, query, sort]);

  // Only the selection that is currently on screen.
  const selectedIds = useMemo(
    () => rows.filter((lead) => selected.has(lead.id)).map((lead) => lead.id),
    [rows, selected],
  );
  const allSelected = rows.length > 0 && selectedIds.length === rows.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  function toggleOne(id, checked) {
    setSelected((previous) => {
      const next = new Set(previous);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function run() {
    setPending(true);
    try {
      const result = await sendJson("POST", "/api/admin/leads/bulk", {
        ids: selectedIds,
        status: bulkStatus,
      });

      const parts = [`${result.updated} updated`];
      if (result.skipped)
        parts.push(
          `${result.skipped} skipped (change not allowed from their current status)`,
        );
      if (result.missing) parts.push(`${result.missing} not found`);
      if (result.failed) parts.push(`${result.failed} failed`);

      const notify =
        result.skipped || result.missing || result.failed
          ? toast.warning
          : toast.success;
      notify(parts.join(", "));

      setSelected(new Set());
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPending(false);
      setConfirming(false);
    }
  }

  function apply() {
    if (bulkStatus === "archived") setConfirming(true);
    else run();
  }

  if (leads.length === 0) {
    return (
      <EmptyState
        title="No leads found"
        description="New project briefs will appear here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape" && query) {
                event.preventDefault();
                setQuery("");
              }
            }}
            placeholder="Search name, email, or reference…"
            aria-label="Search leads"
            className="w-full sm:w-72"
          />
          <label htmlFor="leads-sort" className="sr-only">
            Sort leads
          </label>
          <select
            id="leads-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className={cn(
              "h-9 rounded-md border border-input bg-background px-3 text-sm",
              focusRing,
            )}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <p
          role="status"
          aria-live="polite"
          className="text-sm text-muted-foreground"
        >
          {rows.length === leads.length
            ? `${leads.length} ${leads.length === 1 ? "lead" : "leads"}`
            : `${rows.length} of ${leads.length} leads`}
        </p>
      </div>

      {/* Bulk actions */}
      {canManage && selectedIds.length > 0 ? (
        <div
          role="region"
          aria-label="Bulk actions"
          className="sticky top-20 z-10 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card/95 px-4 py-3 text-sm shadow-md backdrop-blur supports-[backdrop-filter]:bg-card/85"
        >
          <span className="font-medium">{selectedIds.length} selected</span>
          <Select value={bulkStatus} onValueChange={setBulkStatus}>
            <SelectTrigger
              aria-label="Move selected leads to status"
              className="w-44"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" size="sm" disabled={pending} onClick={apply}>
            {pending ? "Applying…" : "Apply"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={() => setSelected(new Set())}
          >
            Clear selection
          </Button>
          <p className="w-full text-xs text-muted-foreground">
            Leads that cannot move to this status from their current one are
            skipped.
          </p>
        </div>
      ) : null}

      {/* Table */}
      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3">
          <EmptyState
            title="No leads match your search"
            description="Check the spelling, or search by email or reference number."
          />
          <Button type="button" variant="outline" onClick={() => setQuery("")}>
            Clear search
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                {canManage ? (
                  <TableHead className="w-10">
                    <Checkbox
                      checked={
                        allSelected
                          ? true
                          : someSelected
                            ? "indeterminate"
                            : false
                      }
                      onCheckedChange={(checked) =>
                        setSelected(
                          checked === true
                            ? new Set(rows.map((lead) => lead.id))
                            : new Set(),
                        )
                      }
                      aria-label="Select all leads shown"
                    />
                  </TableHead>
                ) : null}
                <TableHead>Lead</TableHead>
                <TableHead className="hidden md:table-cell">Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Priority</TableHead>
                <TableHead className="hidden lg:table-cell">
                  Follow-up
                </TableHead>
                <TableHead className="hidden md:table-cell">Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((lead) => {
                const followUpTime = timeOf(lead.followUpAt);
                const overdue =
                  mounted && followUpTime !== null && followUpTime < Date.now();

                return (
                  <TableRow
                    key={lead.id}
                    data-state={selected.has(lead.id) ? "selected" : undefined}
                  >
                    {canManage ? (
                      <TableCell>
                        <Checkbox
                          checked={selected.has(lead.id)}
                          onCheckedChange={(checked) =>
                            toggleOne(lead.id, checked === true)
                          }
                          aria-label={`Select ${lead.name}`}
                        />
                      </TableCell>
                    ) : null}

                    <TableCell className="max-w-[14rem] sm:max-w-xs">
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className={cn(
                          "block truncate rounded-sm font-medium underline-offset-4 hover:underline",
                          focusRing,
                        )}
                      >
                        {lead.name}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        <a
                          href={`mailto:${lead.email}`}
                          className={cn(
                            "rounded-sm hover:text-foreground hover:underline",
                            focusRing,
                          )}
                        >
                          {lead.email}
                        </a>
                        {lead.reference ? ` · ${lead.reference}` : ""}
                      </p>
                      {/* Extra details for small screens, where columns are hidden */}
                      <p className="mt-0.5 truncate text-xs text-muted-foreground md:hidden">
                        {labelFor(serviceCategoryOptions, lead.service)}
                        {lead.createdAt
                          ? ` · Received ${formatDate(lead.createdAt)}`
                          : ""}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 sm:hidden">
                        <PriorityChip priority={lead.priority} />
                      </div>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      {labelFor(serviceCategoryOptions, lead.service)}
                    </TableCell>

                    <TableCell>
                      <StatusBadge
                        status={lead.status}
                        label={LEAD_STATUS_LABELS[lead.status]}
                      />
                    </TableCell>

                    <TableCell className="hidden sm:table-cell">
                      <PriorityChip priority={lead.priority} />
                    </TableCell>

                    <TableCell className="hidden lg:table-cell">
                      {lead.followUpAt ? (
                        <div className="flex flex-col items-start gap-0.5">
                          <span>{formatDate(lead.followUpAt)}</span>
                          {overdue ? (
                            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                              Overdue
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      {formatDate(lead.createdAt)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={`Archive ${selectedIds.length} lead(s)?`}
        description="Archived leads are removed from the active list. You can reopen them later."
        confirmLabel="Archive"
        destructive
        pending={pending}
        onConfirm={run}
      />
    </div>
  );
}
