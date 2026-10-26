import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  ScrollText,
  ShieldCheck,
  Users,
} from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AuditLogList } from "@/components/admin/AuditLogList";
import { ReloadButton } from "@/components/admin/ReloadButton";
import { EmptyState } from "@/components/shared/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { requirePageAdmin } from "@/lib/auth/require-admin";
import { formatDateTime } from "@/lib/utils/dates";
import { isValidDocId } from "@/lib/utils/slugs";
import { listActivity } from "@/services/audit.service";
import { listTeam } from "@/services/team.service";

export const metadata = { title: "Audit logs" };

const BASE = "/admin/audit-logs";

function describeActor(actor, names) {
  if (actor?.type === "admin")
    return (
      names.get(actor.uid) ??
      `${actor.role ?? "Admin"} (${actor.uid?.slice(0, 6)}…)`
    );
  return actor?.type ?? "system";
}

function stringifyMeta(meta) {
  if (!meta) return null;
  try {
    return JSON.stringify(meta, null, 2);
  } catch {
    return null;
  }
}

export default async function AuditLogsPage({ searchParams }) {
  await requirePageAdmin(PERMISSIONS.AUDIT_VIEW);

  const { after } = await searchParams;
  const cursor = isValidDocId(after) ? after : null;

  let data = null;
  const names = new Map();

  try {
    data = await listActivity({ after: cursor });
    // Actor ke naam dikhane ke liye team list (chhoti hoti hai). TEAM_MANAGE na ho to UID hi dikhega.
    (await listTeam().catch(() => [])).forEach((member) =>
      names.set(member.id, member.displayName ?? member.email),
    );
  } catch (error) {
    console.error("[admin] failed to list audit logs:", error);
  }

  const items = (data?.logs ?? []).map((log) => ({
    id: String(log.id),
    action: String(log.action ?? ""),
    entityType: String(log.entityType ?? ""),
    entityId: log.entityId ? String(log.entityId) : "",
    actorLabel: describeActor(log.actor, names),
    whenLabel: formatDateTime(log.createdAt),
    metaText: stringifyMeta(log.meta),
    // Sirf highlight ke liye: action ke naam ma delete/remove ho to
    risky: /delete|remove/i.test(String(log.action ?? "")),
  }));

  const stats = [
    { icon: ScrollText, label: "Entries on this page", value: items.length },
    {
      icon: Users,
      label: "People on this page",
      value: new Set(items.map((i) => i.actorLabel)).size,
    },
    {
      icon: Boxes,
      label: "Entity types",
      value: new Set(items.map((i) => i.entityType).filter(Boolean)).size,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Audit logs"
        description="A record of every admin action. It does not contain personal data."
      />

      {data === null ? (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/5 flex max-w-2xl flex-col items-start gap-3 rounded-2xl border p-5"
        >
          <p className="text-destructive font-medium">
            Could not load audit logs.
          </p>
          <p className="text-muted-foreground text-sm leading-6">
            This is usually temporary. The technical details are in your server
            logs.
          </p>
          <ReloadButton />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No activity yet"
          description="Admin actions will be recorded here."
        />
      ) : (
        <>
          <dl className="grid gap-4 sm:grid-cols-3">
            {stats.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="border-border bg-card flex items-center gap-3 rounded-2xl border p-4"
              >
                <span
                  aria-hidden="true"
                  className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg"
                >
                  <Icon className="size-5" />
                </span>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <dd className="font-heading text-xl font-semibold tracking-tight tabular-nums">
                    {value}
                  </dd>
                  <dt className="text-muted-foreground truncate text-xs">
                    {label}
                  </dt>
                </div>
              </div>
            ))}
          </dl>

          <div className="border-border bg-muted/40 flex items-start gap-3 rounded-xl border p-4 text-sm">
            <ShieldCheck
              aria-hidden="true"
              className="text-primary mt-0.5 size-4 shrink-0"
            />
            <p className="text-muted-foreground leading-6">
              This log is read-only. Entries are shown newest first.
            </p>
          </div>

          <AuditLogList items={items} />

          {data.nextCursor || cursor ? (
            <nav
              aria-label="Pagination"
              className="flex flex-wrap items-center gap-3"
            >
              {cursor ? (
                <Link
                  href={BASE}
                  className={buttonVariants({ variant: "outline" })}
                >
                  <ArrowLeft aria-hidden="true" className="size-4" />
                  Back to newest
                </Link>
              ) : null}
              {data.nextCursor ? (
                <Link
                  href={`${BASE}?after=${data.nextCursor}`}
                  className={buttonVariants({ variant: "outline" })}
                >
                  Older entries
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              ) : null}
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
}
