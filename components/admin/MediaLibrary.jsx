"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowUpDown,
  Check,
  CheckCircle2,
  Circle,
  Copy,
  ExternalLink,
  ImageIcon,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ALLOWED_UPLOAD_LABEL, MAX_UPLOAD_BYTES } from "@/constants/media";
import { cn } from "@/lib/utils";
import { sendJson } from "@/lib/utils/submit-form";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_UPLOAD_MB = Math.round(MAX_UPLOAD_BYTES / (1024 * 1024));
const EASE = [0.22, 1, 0.36, 1];

const SORTS = [
  { id: "default", label: "Default order" },
  { id: "name-asc", label: "Name A to Z" },
  { id: "name-desc", label: "Name Z to A" },
];

const selectClass =
  "border-border bg-background focus-visible:ring-ring h-10 rounded-lg border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

/* -------------------------------------------------------------------------- */
/*  Small presentational pieces                                               */
/* -------------------------------------------------------------------------- */

function Thumbnail({ item }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
      <Image
        src={item.url}
        alt={item.alt || item.name}
        fill
        sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 50vw"
        className="object-cover transition-transform duration-300 motion-safe:group-hover/thumb:scale-[1.03]"
      />
    </div>
  );
}

function MediaSkeleton({ count = 8 }) {
  return (
    <ul
      aria-hidden="true"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {Array.from({ length: count }, (_, index) => (
        <li
          key={index}
          className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-3"
        >
          <div className="aspect-video w-full rounded-lg bg-muted motion-safe:animate-pulse" />
          <div className="h-4 w-2/3 rounded bg-muted motion-safe:animate-pulse" />
          <div className="h-9 w-full rounded-md bg-muted motion-safe:animate-pulse" />
        </li>
      ))}
    </ul>
  );
}

function UploadDropzone({ id, uploading, progress, onFiles }) {
  const [dragActive, setDragActive] = useState(false);

  function handleDrop(event) {
    event.preventDefault();
    setDragActive(false);
    if (uploading) return;
    onFiles(Array.from(event.dataTransfer.files ?? []));
  }

  function handleChange(event) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    onFiles(files);
  }

  const percent =
    progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <Field className="max-w-xl">
      <FieldLabel htmlFor={id}>Upload images</FieldLabel>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!uploading) setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center transition-colors motion-reduce:transition-none",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
          dragActive
            ? "border-primary bg-primary/10"
            : "border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5",
          uploading && "pointer-events-none opacity-80",
        )}
      >
        <span className="inline-flex size-11 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
          {uploading ? (
            <Loader2
              className="size-5 motion-safe:animate-spin"
              aria-hidden="true"
            />
          ) : (
            <UploadCloud className="size-5" aria-hidden="true" />
          )}
        </span>
        <p className="text-sm font-medium">
          {uploading
            ? `Uploading ${Math.min(progress.done + 1, progress.total)} of ${progress.total}…`
            : dragActive
              ? "Drop to upload"
              : "Drag and drop, click to browse, or paste an image"}
        </p>
        <p className="text-xs text-muted-foreground">{ALLOWED_UPLOAD_LABEL}</p>

        {uploading ? (
          <div
            role="progressbar"
            aria-label="Upload progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="mt-1 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full origin-left rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none"
              style={{ width: `${percent}%` }}
            />
          </div>
        ) : null}

        <Input
          id={id}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(",")}
          disabled={uploading}
          onChange={handleChange}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 file:cursor-pointer"
        />
      </div>
      <FieldDescription>
        Up to {MAX_UPLOAD_MB} MB per image. You can select several at once.
      </FieldDescription>
    </Field>
  );
}

function UploadQueue({ queue, uploading, onRetry, onDismiss }) {
  if (queue.length === 0) return null;
  const failedRetryable = queue.filter(
    (entry) => entry.status === "error" && entry.retryable,
  ).length;

  return (
    <section
      aria-label="Upload results"
      className="flex max-w-xl flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium">Uploads</h3>
        <div className="flex flex-wrap gap-2">
          {failedRetryable > 0 && !uploading ? (
            <Button type="button" size="sm" variant="outline" onClick={onRetry}>
              <RotateCcw className="size-4" aria-hidden="true" />
              Retry failed ({failedRetryable})
            </Button>
          ) : null}
          {!uploading ? (
            <Button type="button" size="sm" variant="ghost" onClick={onDismiss}>
              Dismiss
            </Button>
          ) : null}
        </div>
      </div>
      <ul className="flex max-h-56 flex-col gap-2 overflow-y-auto">
        {queue.map((entry) => (
          <li key={entry.key} className="flex items-start gap-2.5 text-sm">
            {entry.status === "done" ? (
              <CheckCircle2
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
            ) : entry.status === "error" ? (
              <AlertCircle
                className="mt-0.5 size-4 shrink-0 text-destructive"
                aria-hidden="true"
              />
            ) : entry.status === "uploading" ? (
              <Loader2
                className="mt-0.5 size-4 shrink-0 motion-safe:animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Circle
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            )}
            <div className="flex min-w-0 flex-col">
              <span className="truncate" title={entry.name}>
                {entry.name}
              </span>
              <span
                className={cn(
                  "text-xs",
                  entry.status === "error"
                    ? "text-destructive"
                    : "text-muted-foreground",
                )}
              >
                {entry.status === "done"
                  ? "Uploaded"
                  : entry.status === "uploading"
                    ? "Uploading…"
                    : entry.status === "queued"
                      ? "Waiting"
                      : entry.message}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Manage mode card                                                          */
/* -------------------------------------------------------------------------- */

function ManageCard({ item, index, onSaved, onDelete }) {
  const reduce = useReducedMotion();
  const [alt, setAlt] = useState(item.alt ?? "");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const dirty = alt !== (item.alt ?? "");
  const missing = !(item.alt ?? "").trim();

  async function saveAlt() {
    if (!dirty || saving) return;
    setSaving(true);
    try {
      await sendJson("PATCH", `/api/admin/media/${item.id}`, { alt });
      toast.success("Description saved");
      onSaved();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopied(true);
      toast.success("Image URL copied");
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy the URL.");
    }
  }

  return (
    <motion.li
      layout={reduce ? false : "position"}
      initial={{ opacity: 0, y: reduce ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduce ? 0.01 : 0.3,
        ease: EASE,
        delay: reduce ? 0 : Math.min(index, 8) * 0.04,
      }}
      className="group/thumb flex min-w-0 flex-col gap-3 rounded-xl border border-border/70 bg-card p-3 transition-colors hover:border-primary/40 motion-reduce:transition-none"
    >
      <Thumbnail item={item} />
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium" title={item.name}>
          {item.name}
        </p>
        {missing ? (
          <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
            No description
          </span>
        ) : null}
      </div>
      <Field>
        <FieldLabel htmlFor={`alt-${item.id}`}>Image description</FieldLabel>
        <Input
          id={`alt-${item.id}`}
          value={alt}
          maxLength={160}
          placeholder="Describe the image for accessibility"
          onChange={(event) => setAlt(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              saveAlt();
            }
          }}
        />
        <FieldDescription>
          {alt.length}/160 · Press Enter to save
        </FieldDescription>
      </Field>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={saving || !dirty}
          onClick={saveAlt}
        >
          {saving ? (
            <>
              <Loader2
                className="size-4 motion-safe:animate-spin"
                aria-hidden="true"
              />
              Saving…
            </>
          ) : (
            "Save"
          )}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={copyUrl}>
          {copied ? (
            <Check className="size-4 text-primary" aria-hidden="true" />
          ) : (
            <Copy className="size-4" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy URL"}
        </Button>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ size: "sm", variant: "ghost" })}
          aria-label={`Open ${item.name} in a new tab`}
        >
          <ExternalLink className="size-4" aria-hidden="true" />
          Open
        </a>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => onDelete(item)}
          className="ml-auto text-muted-foreground hover:text-destructive"
          aria-label={`Delete ${item.name}`}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Delete
        </Button>
      </div>
    </motion.li>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */

export function MediaLibrary({ mode = "manage", onSelect }) {
  const isPick = mode === "pick";
  const reduce = useReducedMotion();
  const uploadId = useId();
  const searchId = useId();
  const sortId = useId();

  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("default");
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [queue, setQueue] = useState([]);
  const [deleting, setDeleting] = useState(null);
  const [deletePending, setDeletePending] = useState(false);

  const [reloadToken, setReloadToken] = useState(0);
  const reload = useCallback(() => setReloadToken((value) => value + 1), []);
  const uploadingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchItems() {
      try {
        const response = await fetch("/api/admin/media");
        const body = await response.json().catch(() => ({}));
        if (!response.ok)
          throw new Error(body?.error?.message ?? "Could not load media.");
        if (cancelled) return;
        setItems(body.items);
        setError("");
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    }

    fetchItems();
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const missingCount = useMemo(
    () => (items ? items.filter((item) => !(item.alt ?? "").trim()).length : 0),
    [items],
  );

  const visibleItems = useMemo(() => {
    if (!items) return null;
    const term = query.trim().toLowerCase();
    let list = items.filter((item) => {
      if (!isPick && onlyMissing && (item.alt ?? "").trim()) return false;
      if (!term) return true;
      return (
        item.name?.toLowerCase().includes(term) ||
        item.alt?.toLowerCase().includes(term)
      );
    });
    if (sort !== "default") {
      list = [...list].sort((a, b) => {
        const result = (a.name ?? "").localeCompare(b.name ?? "", undefined, {
          sensitivity: "base",
          numeric: true,
        });
        return sort === "name-asc" ? result : -result;
      });
    }
    return list;
  }, [items, query, sort, onlyMissing, isPick]);

  const filtersActive = query.trim() !== "" || (!isPick && onlyMissing);

  function retry() {
    setError("");
    setItems(null);
    reload();
  }

  function resetFilters() {
    setQuery("");
    setOnlyMissing(false);
  }

  /* ----------------------------- Uploading ------------------------------ */

  async function uploadOne(file) {
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/admin/media", {
      method: "POST",
      body: form,
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body?.error?.message ?? "Upload failed.");
  }

  function patchEntry(key, patch) {
    setQueue((current) =>
      current.map((entry) =>
        entry.key === key ? { ...entry, ...patch } : entry,
      ),
    );
  }

  async function runUploads(entries) {
    if (entries.length === 0 || uploadingRef.current) return;
    uploadingRef.current = true;
    setUploading(true);
    setProgress({ done: 0, total: entries.length });
    setQueue((current) =>
      current.map((entry) =>
        entries.some((e) => e.key === entry.key)
          ? { ...entry, status: "queued", message: "" }
          : entry,
      ),
    );

    let succeeded = 0;
    let failed = 0;
    for (const entry of entries) {
      patchEntry(entry.key, { status: "uploading" });
      try {
        await uploadOne(entry.file);
        patchEntry(entry.key, { status: "done" });
        succeeded += 1;
      } catch (err) {
        patchEntry(entry.key, {
          status: "error",
          message: err.message,
          retryable: true,
        });
        failed += 1;
      }
      setProgress((current) => ({ ...current, done: current.done + 1 }));
    }

    if (succeeded > 0) {
      toast.success(
        succeeded === 1 ? "Image uploaded" : `${succeeded} images uploaded`,
      );
      reload();
    }
    if (failed > 0) {
      toast.error(
        failed === 1
          ? "1 image could not be uploaded."
          : `${failed} images could not be uploaded.`,
      );
    }
    uploadingRef.current = false;
    setUploading(false);
  }

  const onFiles = useCallback(
    (files) => {
      if (files.length === 0 || uploadingRef.current) return;

      const rejected = [];
      const valid = [];
      files.forEach((file, index) => {
        const key = `${Date.now()}-${index}-${file.name}`;
        if (!ACCEPTED_TYPES.includes(file.type)) {
          rejected.push({
            key,
            name: file.name,
            status: "error",
            message: "Unsupported file type.",
            retryable: false,
          });
        } else if (file.size > MAX_UPLOAD_BYTES) {
          rejected.push({
            key,
            name: file.name,
            status: "error",
            message: `Must be ${MAX_UPLOAD_MB} MB or smaller.`,
            retryable: false,
          });
        } else {
          valid.push({
            key,
            file,
            name: file.name,
            status: "queued",
            message: "",
            retryable: false,
          });
        }
      });

      setQueue([...rejected, ...valid]);
      if (rejected.length > 0 && valid.length === 0) {
        toast.error("None of the selected files can be uploaded.");
      }
      runUploads(valid);
    },
    // runUploads only uses stable setters and refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  function retryFailed() {
    const again = queue.filter(
      (entry) => entry.status === "error" && entry.retryable,
    );
    runUploads(again);
  }

  // Paste an image from the clipboard (screenshots, copied images)
  useEffect(() => {
    function onPaste(event) {
      const target = event.target;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        return;
      }
      const files = Array.from(event.clipboardData?.files ?? []).filter(
        (file) => file.type.startsWith("image/"),
      );
      if (files.length === 0) return;
      event.preventDefault();
      onFiles(files);
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [onFiles]);

  /* ------------------------------ Deleting ------------------------------ */

  async function confirmDelete() {
    setDeletePending(true);
    try {
      await sendJson("DELETE", `/api/admin/media/${deleting.id}`);
      toast.success("Image deleted");
      setDeleting(null);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletePending(false);
    }
  }

  const hasItems = items !== null && items.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <UploadDropzone
        id={isPick ? `pick-${uploadId}` : `media-${uploadId}`}
        uploading={uploading}
        progress={progress}
        onFiles={onFiles}
      />

      <UploadQueue
        queue={queue}
        uploading={uploading}
        onRetry={retryFailed}
        onDismiss={() => setQueue([])}
      />

      {hasItems ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p
              className="text-sm text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              {filtersActive
                ? `${visibleItems.length} of ${items.length} images`
                : `${items.length} ${items.length === 1 ? "image" : "images"}`}
            </p>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-64">
                <label htmlFor={searchId} className="sr-only">
                  Search images
                </label>
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id={searchId}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by name or description"
                  className="h-10 pr-10 pl-9"
                />
                {query ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Clear search"
                    onClick={() => setQuery("")}
                    className="absolute top-1/2 right-1 size-8 -translate-y-1/2 text-muted-foreground"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </Button>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor={sortId} className="sr-only">
                  Sort images
                </label>
                <ArrowUpDown
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground"
                />
                <select
                  id={sortId}
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className={cn(selectClass, "w-full sm:w-auto")}
                >
                  {SORTS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {!isPick && missingCount > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                aria-pressed={onlyMissing}
                onClick={() => setOnlyMissing((value) => !value)}
                className={cn(
                  "inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none",
                  onlyMissing
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                Needs description
                <span
                  className={cn(
                    "rounded-full px-1.5 text-xs tabular-nums",
                    onlyMissing ? "bg-primary-foreground/20" : "bg-muted",
                  )}
                >
                  {missingCount}
                </span>
              </button>
              <span className="text-xs text-muted-foreground">
                Descriptions help screen readers and SEO.
              </span>
            </div>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="flex flex-col items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm text-destructive">{error}</p>
          <Button type="button" size="sm" variant="outline" onClick={retry}>
            <RefreshCw className="size-4" aria-hidden="true" />
            Try again
          </Button>
        </div>
      ) : null}

      {items === null && !error ? (
        <div role="status" aria-label="Loading images">
          <span className="sr-only">Loading…</span>
          <MediaSkeleton />
        </div>
      ) : items === null ? null : items.length === 0 ? (
        <EmptyState
          title="No images yet"
          description="Upload your first image above."
        />
      ) : visibleItems.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-12 text-center">
          <ImageIcon
            className="size-8 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="text-sm text-muted-foreground">
            {query.trim() ? (
              <>No images match &ldquo;{query.trim()}&rdquo;.</>
            ) : (
              "No images need a description."
            )}
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={resetFilters}
          >
            Reset filters
          </Button>
        </div>
      ) : isPick ? (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {visibleItems.map((item, index) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, y: reduce ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduce ? 0.01 : 0.25,
                ease: EASE,
                delay: reduce ? 0 : Math.min(index, 8) * 0.03,
              }}
            >
              <button
                type="button"
                onClick={() => onSelect?.(item)}
                aria-label={`Select ${item.name}`}
                className="group/thumb w-full rounded-xl border border-border/70 bg-card p-1.5 text-left transition-colors hover:border-brand focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-safe:active:scale-[0.98] motion-reduce:transition-none"
              >
                <Thumbnail item={item} />
                <span className="mt-1.5 block truncate px-1 text-xs text-muted-foreground">
                  {item.name}
                </span>
              </button>
            </motion.li>
          ))}
        </ul>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleItems.map((item, index) => (
            <ManageCard
              key={item.id}
              item={item}
              index={index}
              onSaved={reload}
              onDelete={setDeleting}
            />
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this image?"
        description="This permanently deletes the image. If it is used in a project or post, it can't be deleted."
        confirmLabel="Delete"
        destructive
        pending={deletePending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
