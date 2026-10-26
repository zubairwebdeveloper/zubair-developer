"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ContentForm } from "@/components/admin/ContentForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getContentConfig } from "@/config/admin-content";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/dates";
import { sendJson } from "@/lib/utils/submit-form";

const PAGE_SIZE = 20;

const filters = [
  { value: "active", label: "Active" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

const toTime = (value) => {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function ContentManager({ resource, items }) {
  const config = getContentConfig(resource);
  const router = useRouter();
  const hasOrder = config.fields.some((field) => field.name === "order");

  const [editing, setEditing] = useState(null); // null | "new" | item
  const [archiving, setArchiving] = useState(null);
  const [bulkArchiving, setBulkArchiving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [bulkPending, setBulkPending] = useState(false);
  const [selected, setSelected] = useState(() => new Set());
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("active");
  const [sort, setSort] = useState("default");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const searchRef = useRef(null);

  const sortOptions = useMemo(
    () => [
      { value: "default", label: "Default order" },
      { value: "updated", label: "Recently updated" },
      { value: "title-asc", label: "Title A to Z" },
      { value: "title-desc", label: "Title Z to A" },
      ...(hasOrder ? [{ value: "order", label: "Display order" }] : []),
    ],
    [hasOrder],
  );

  // Press "/" anywhere on the page to jump to search.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey)
        return;
      const target = event.target;
      const typing =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
      if (typing) return;
      event.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const counts = useMemo(
    () => ({
      active: items.filter((item) => item.status !== "archived").length,
      published: items.filter((item) => item.status === "published").length,
      draft: items.filter((item) => item.status === "draft").length,
      archived: items.filter((item) => item.status === "archived").length,
    }),
    [items],
  );

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    const matches = items.filter((item) => {
      const matchesFilter =
        filter === "active"
          ? item.status !== "archived"
          : item.status === filter;
      const matchesQuery =
        !term ||
        String(item[config.titleField] ?? "")
          .toLowerCase()
          .includes(term);
      return matchesFilter && matchesQuery;
    });

    const titleOf = (item) => String(item[config.titleField] ?? "");
    const sorted = [...matches];
    switch (sort) {
      case "updated":
        sorted.sort((a, b) => toTime(b.updatedAt) - toTime(a.updatedAt));
        break;
      case "title-asc":
        sorted.sort((a, b) => titleOf(a).localeCompare(titleOf(b)));
        break;
      case "title-desc":
        sorted.sort((a, b) => titleOf(b).localeCompare(titleOf(a)));
        break;
      case "order":
        sorted.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        break;
      default:
        break; // keep the order the server sent
    }
    return sorted;
  }, [items, query, filter, sort, config.titleField]);

  // Only the rows currently on screen can be selected and acted on.
  const shown = useMemo(() => visible.slice(0, limit), [visible, limit]);
  const remaining = visible.length - shown.length;

  const selectedIds = useMemo(
    () => shown.filter((item) => selected.has(item.id)).map((item) => item.id),
    [shown, selected],
  );
  const allSelected = shown.length > 0 && selectedIds.length === shown.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  const hasActiveControls =
    query.trim() !== "" || filter !== "active" || sort !== "default";

  function changeQuery(value) {
    setQuery(value);
    setLimit(PAGE_SIZE);
  }

  function changeFilter(value) {
    setFilter(value);
    setLimit(PAGE_SIZE);
  }

  function changeSort(value) {
    setSort(value);
    setLimit(PAGE_SIZE);
  }

  function resetControls() {
    setQuery("");
    setFilter("active");
    setSort("default");
    setLimit(PAGE_SIZE);
  }

  function toggleOne(id, checked) {
    setSelected((previous) => {
      const next = new Set(previous);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggleAll(checked) {
    setSelected(checked ? new Set(shown.map((item) => item.id)) : new Set());
  }

  async function run(item, request, successMessage) {
    setBusyId(item.id);
    try {
      await request();
      toast.success(successMessage);
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusyId(null);
    }
  }

  const setStatus = (item, status, message) =>
    run(
      item,
      () =>
        sendJson("PATCH", `/api/admin/content/${resource}/${item.id}`, {
          status,
        }),
      message,
    );

  async function confirmArchive() {
    const item = archiving;
    await run(
      item,
      () => sendJson("DELETE", `/api/admin/content/${resource}/${item.id}`),
      "Archived",
    );
    setArchiving(null);
  }

  async function runBulk(status, label) {
    setBulkPending(true);
    try {
      const result = await sendJson(
        "POST",
        `/api/admin/content/${resource}/bulk`,
        {
          ids: selectedIds,
          status,
        },
      );
      toast.success(`${result.count} item(s) ${label}`);
      setSelected(new Set());
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBulkPending(false);
      setBulkArchiving(false);
    }
  }

  function onSaved() {
    setEditing(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => changeQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape" && query) {
                    event.preventDefault();
                    changeQuery("");
                  }
                }}
                placeholder={`Search ${config.label.toLowerCase()}…`}
                aria-label={`Search ${config.label}`}
                aria-keyshortcuts="/"
                className="w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="content-sort" className="sr-only">
                Sort by
              </label>
              <select
                id="content-sort"
                value={sort}
                onChange={(event) => changeSort(event.target.value)}
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
          </div>

          <Button type="button" onClick={() => setEditing("new")}>
            New {config.singular}
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter by status"
          >
            {filters.map((item) => (
              <Button
                key={item.value}
                type="button"
                size="sm"
                variant={filter === item.value ? "default" : "outline"}
                aria-pressed={filter === item.value}
                onClick={() => changeFilter(item.value)}
                className="gap-1.5"
              >
                <span>{item.label}</span>
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    filter === item.value
                      ? "opacity-80"
                      : "text-muted-foreground",
                  )}
                >
                  {counts[item.value]}
                </span>
              </Button>
            ))}
          </div>

          <p
            role="status"
            aria-live="polite"
            className="text-sm text-muted-foreground"
          >
            Showing {shown.length} of {visible.length}
            {visible.length !== items.length ? ` (${items.length} total)` : ""}
          </p>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedIds.length > 0 ? (
        <div
          role="region"
          aria-label="Bulk actions"
          className="sticky top-20 z-10 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card/95 px-4 py-3 text-sm shadow-md backdrop-blur supports-[backdrop-filter]:bg-card/85"
        >
          <span className="mr-1 font-medium">
            {selectedIds.length} selected
          </span>
          <Button
            type="button"
            size="sm"
            disabled={bulkPending}
            onClick={() => runBulk("published", "published")}
          >
            Publish
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={bulkPending}
            onClick={() => runBulk("draft", "moved to draft")}
          >
            Unpublish
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={bulkPending}
            onClick={() => setBulkArchiving(true)}
          >
            Archive
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={bulkPending}
            onClick={() => setSelected(new Set())}
          >
            Clear selection
          </Button>
        </div>
      ) : null}

      {/* List */}
      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3">
          <EmptyState
            title={
              items.length === 0
                ? `No ${config.label.toLowerCase()} yet`
                : "Nothing matches"
            }
            description={
              items.length === 0
                ? `Create your first ${config.singular} to get started.`
                : "Try a different search or status filter."
            }
          />
          {items.length === 0 ? (
            <Button type="button" onClick={() => setEditing("new")}>
              New {config.singular}
            </Button>
          ) : hasActiveControls ? (
            <Button type="button" variant="outline" onClick={resetControls}>
              Clear search and filters
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={
                      allSelected
                        ? true
                        : someSelected
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={(checked) => toggleAll(checked === true)}
                    aria-label="Select all items shown"
                  />
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                {hasOrder ? (
                  <TableHead className="hidden sm:table-cell">Order</TableHead>
                ) : null}
                <TableHead className="hidden md:table-cell">Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shown.map((item) => {
                const busy = busyId === item.id;
                const title = item[config.titleField];

                return (
                  <TableRow
                    key={item.id}
                    data-state={selected.has(item.id) ? "selected" : undefined}
                    className={cn(
                      busy && "opacity-60",
                      "transition-opacity motion-reduce:transition-none",
                    )}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selected.has(item.id)}
                        onCheckedChange={(checked) =>
                          toggleOne(item.id, checked === true)
                        }
                        aria-label={`Select ${title}`}
                      />
                    </TableCell>
                    <TableCell className="max-w-[14rem] sm:max-w-xs">
                      <div className="flex flex-col">
                        <span className="truncate font-medium">{title}</span>
                        <span className="text-xs text-muted-foreground md:hidden">
                          Updated {formatDate(item.updatedAt)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    {hasOrder ? (
                      <TableCell className="hidden sm:table-cell">
                        {item.order ?? 0}
                      </TableCell>
                    ) : null}
                    <TableCell className="hidden md:table-cell">
                      {formatDate(item.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={busy}
                          onClick={() => setEditing(item)}
                        >
                          Edit
                        </Button>
                        {item.status === "published" ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={busy}
                            onClick={() =>
                              setStatus(item, "draft", "Unpublished")
                            }
                          >
                            Unpublish
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            disabled={busy}
                            onClick={() =>
                              setStatus(item, "published", "Published")
                            }
                          >
                            Publish
                          </Button>
                        )}
                        {item.status === "archived" ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            disabled={busy}
                            onClick={() =>
                              setStatus(item, "draft", "Restored as draft")
                            }
                          >
                            Restore
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            disabled={busy}
                            onClick={() => setArchiving(item)}
                          >
                            Archive
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {remaining > 0 ? (
            <div className="flex items-center justify-center border-t border-border px-4 py-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setLimit((value) => value + PAGE_SIZE)}
              >
                Show {Math.min(PAGE_SIZE, remaining)} more ({remaining}{" "}
                remaining)
              </Button>
            </div>
          ) : null}
        </div>
      )}

      <Sheet
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <SheetContent
          side="right"
          className="w-full overflow-y-auto sm:max-w-xl"
        >
          <SheetHeader>
            <SheetTitle>
              {editing === "new"
                ? `New ${config.singular}`
                : `Edit ${config.singular}`}
            </SheetTitle>
            <SheetDescription>
              Only Published items appear on your public site.
            </SheetDescription>
          </SheetHeader>
          {editing !== null ? (
            <ContentForm
              key={editing === "new" ? "new" : editing.id}
              config={config}
              item={editing === "new" ? null : editing}
              onSaved={onSaved}
              onCancel={() => setEditing(null)}
            />
          ) : null}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={archiving !== null}
        onOpenChange={(open) => !open && setArchiving(null)}
        title={`Archive this ${config.singular}?`}
        description="It will be removed from your public site. You can restore it later."
        confirmLabel="Archive"
        destructive
        pending={busyId !== null}
        onConfirm={confirmArchive}
      />

      <ConfirmDialog
        open={bulkArchiving}
        onOpenChange={setBulkArchiving}
        title={`Archive ${selectedIds.length} selected item(s)?`}
        description="They will be removed from your public site. You can restore them later."
        confirmLabel="Archive all"
        destructive
        pending={bulkPending}
        onConfirm={() => runBulk("archived", "archived")}
      />
    </div>
  );
}
