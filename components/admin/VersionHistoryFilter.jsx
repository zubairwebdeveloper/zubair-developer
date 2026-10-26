"use client";

import { useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";

import { RestoreVersionButton } from "@/components/admin/RestoreVersionButton";
import { formatDateTime } from "@/lib/utils/dates";

/**
 * VersionHistoryFilter
 *
 * @param {Array<{version: number|string, savedByName: string, savedAt: string|Date, enabled: boolean}>} versions
 *   Expected newest-first, same order the page already fetches from listAiVersions().
 */
export function VersionHistoryFilter({ versions }) {
  const [query, setQuery] = useState("");
  const [onlyEnabled, setOnlyEnabled] = useState(false);

  const currentVersion = versions[0]?.version;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return versions.filter((entry) => {
      if (onlyEnabled && !entry.enabled) return false;
      if (!q) return true;
      return (
        entry.savedByName?.toLowerCase().includes(q) ||
        String(entry.version).includes(q)
      );
    });
  }, [versions, query, onlyEnabled]);

  if (versions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No saved versions yet.</p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative max-w-xs flex-1">
          <FiSearch
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by editor or version…"
            aria-label="Search version history"
            className="h-9 w-full rounded-lg border border-border bg-background py-1.5 pr-3 pl-9 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={onlyEnabled}
            onChange={(event) => setOnlyEnabled(event.target.checked)}
            className="size-4 rounded border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          Enabled only
        </label>
        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} of {versions.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No versions match your search.
        </p>
      ) : (
        <ul className="flex max-w-2xl flex-col gap-2 text-sm">
          {filtered.map((entry) => {
            const isCurrent = entry.version === currentVersion;
            return (
              <li
                key={entry.version}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2"
              >
                <span className="font-medium">Version {entry.version}</span>
                <span className="text-muted-foreground">
                  {entry.savedByName} · {formatDateTime(entry.savedAt)} ·{" "}
                  {entry.enabled ? "enabled" : "disabled"}
                </span>
                {isCurrent ? (
                  <span className="text-xs text-muted-foreground">Current</span>
                ) : (
                  <RestoreVersionButton version={entry.version} />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
