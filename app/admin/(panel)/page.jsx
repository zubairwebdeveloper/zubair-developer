import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BellRing,
  CalendarClock,
  FolderKanban,
  Image as ImageIcon,
  Inbox,
  MessagesSquare,
  Settings,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LeadsChart } from "@/components/admin/LeadsChart";
import { ReloadButton } from "@/components/admin/ReloadButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { StatusOverview } from "@/components/admin/StatusOverview";
import { CountUp } from "@/components/faq/CountUp";
import { Reveal } from "@/components/shared/Reveal";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LEAD_STATUS_LABELS } from "@/constants/lead-status";
import { hasPermission, PERMISSIONS } from "@/lib/auth/permissions";
import { requirePageAdmin } from "@/lib/auth/require-admin";
import { formatDate, formatDateTime } from "@/lib/utils/dates";
import {
  DEFAULT_RANGE,
  getOverview,
  RANGES,
} from "@/services/dashboard.service";

export const metadata = { title: "Overview" };

const STATUS_COLORS = [
  "bg-primary",
  "bg-primary/70",
  "bg-primary/45",
  "bg-primary/25",
  "bg-muted-foreground/40",
  "bg-border",
];

function isOverdue(value) {
  if (!value) return false;
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return false;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return time < startOfToday.getTime();
}

function StatCard({ icon: Icon, label, value, hint, href, accent }) {
  const body = (
    <div
      className={`border-border bg-card group flex h-full min-w-0 flex-col gap-4 rounded-2xl border p-5 transition-colors duration-200 motion-reduce:transition-none ${
        href ? "hover:border-primary/40" : ""
      } ${accent ? "border-primary/40 bg-primary/5" : ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          aria-hidden="true"
          className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg"
        >
          <Icon className="size-5" />
        </span>
        {href ? (
          <ArrowRight
            aria-hidden="true"
            className="text-muted-foreground size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        ) : null}
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-heading text-3xl font-semibold tracking-tight tabular-nums">
          {typeof value === "number" ? <CountUp value={value} /> : value}
        </p>
        <p className="text-muted-foreground text-sm">{label}</p>
        {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
      </div>
    </div>
  );

  return href ? (
    <Link
      href={href}
      className="focus-visible:ring-ring block h-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      {body}
    </Link>
  ) : (
    body
  );
}

function LeadList({ leads, empty, showOverdue = false }) {
  if (leads.length === 0)
    return <p className="text-muted-foreground text-sm">{empty}</p>;

  return (
    <ul className="divide-border flex flex-col divide-y">
      {leads.map((lead) => {
        const overdue = showOverdue && isOverdue(lead.followUpAt);
        return (
          <li key={lead.id}>
            <Link
              href={`/admin/leads/${lead.id}`}
              className="hover:bg-muted/50 focus-visible:ring-ring -mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-sm outline-none transition-colors focus-visible:ring-2 motion-reduce:transition-none"
            >
              <span className="min-w-0 truncate font-medium">{lead.name}</span>
              <span className="flex shrink-0 items-center gap-2">
                {overdue ? (
                  <span className="border-primary/50 text-primary rounded-full border px-2 py-0.5 text-xs">
                    Overdue
                  </span>
                ) : null}
                <span className="text-muted-foreground tabular-nums">
                  {formatDate(lead.followUpAt ?? lead.createdAt)}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default async function AdminOverviewPage({ searchParams }) {
  const admin = await requirePageAdmin(PERMISSIONS.DASHBOARD_VIEW);
  const { range } = await searchParams;
  const activeRange = Object.hasOwn(RANGES, range) ? range : DEFAULT_RANGE;
  const can = (permission) => hasPermission(admin.role, permission);
  const canSeeLeads = can(PERMISSIONS.LEADS_READ);
  const canSeeAudit = can(PERMISSIONS.AUDIT_VIEW);

  let data = null;
  try {
    data = await getOverview({
      range: activeRange,
      includeActivity: canSeeAudit,
    });
  } catch (error) {
    console.error("[admin] overview failed:", error);
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-6">
        <AdminPageHeader title="Overview" />
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/5 flex max-w-2xl flex-col items-start gap-3 rounded-2xl border p-5"
        >
          <p className="text-destructive font-medium">Could not load data.</p>
          <p className="text-muted-foreground text-sm leading-6">
            Check your Firebase configuration. The technical details are in your
            server logs.
          </p>
          <ReloadButton />
        </div>
      </div>
    );
  }

  const today = new Intl.DateTimeFormat("en", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const dueCount = data.dueFollowUps?.length ?? 0;
  const overdueCount = (data.dueFollowUps ?? []).filter((lead) =>
    isOverdue(lead.followUpAt),
  ).length;

  const stats = [
    {
      icon: Users,
      label: `Leads (${data.days} days)`,
      value: data.totalInRange,
      href: canSeeLeads ? "/admin/leads" : undefined,
    },
    {
      icon: Inbox,
      label: `Inquiries (${data.days} days)`,
      value: data.inquiriesInRange,
    },
    {
      icon: BellRing,
      label: "New leads waiting",
      value: data.newLeadsNow,
      hint: data.newLeadsNow > 0 ? "Needs a first reply" : "All caught up",
      href: canSeeLeads ? "/admin/leads" : undefined,
      accent: data.newLeadsNow > 0,
    },
    {
      icon: FolderKanban,
      label: "Published projects",
      value: data.publishedProjects,
    },
  ];

  // Attention items: sirf wahi jo data se sabit hon
  const attention = [
    canSeeLeads &&
      data.newLeadsNow > 0 && {
        text: `${data.newLeadsNow} new ${data.newLeadsNow === 1 ? "lead is" : "leads are"} waiting.`,
        href: "/admin/leads",
        action: "Open leads",
      },
    canSeeLeads &&
      dueCount > 0 && {
        text:
          overdueCount > 0
            ? `${dueCount} follow-up${dueCount === 1 ? "" : "s"} due, ${overdueCount} overdue.`
            : `${dueCount} follow-up${dueCount === 1 ? "" : "s"} due today.`,
        href: "#follow-ups",
        action: "See list",
      },
  ].filter(Boolean);

  const statusEntries = Object.entries(data.byStatus ?? {});
  const statusTotal = statusEntries.reduce((sum, [, count]) => sum + count, 0);
  const segments = statusEntries.map(([status, count], index) => ({
    id: status,
    label: LEAD_STATUS_LABELS[status] ?? status,
    value: count,
    className: STATUS_COLORS[index % STATUS_COLORS.length],
  }));

  const quickLinks = [
    can(PERMISSIONS.LEADS_READ) && {
      icon: Users,
      label: "Leads",
      href: "/admin/leads",
    },
    can(PERMISSIONS.LEADS_READ) && {
      icon: MessagesSquare,
      label: "Messages",
      href: "/admin/messages",
    },
    can(PERMISSIONS.NOTIFICATIONS_VIEW) && {
      icon: BellRing,
      label: "Notifications",
      href: "/admin/notifications",
    },
    can(PERMISSIONS.MEDIA_MANAGE) && {
      icon: ImageIcon,
      label: "Media",
      href: "/admin/media",
    },
    can(PERMISSIONS.SETTINGS_MANAGE) && {
      icon: Settings,
      label: "Settings",
      href: "/admin/settings",
    },
    can(PERMISSIONS.AUDIT_VIEW) && {
      icon: Activity,
      label: "Audit logs",
      href: "/admin/audit-logs",
    },
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Overview"
        description={`${today} · Live numbers from Firestore.`}
        actions={
          <nav
            aria-label="Date range"
            className="bg-muted flex gap-1 rounded-xl p-1"
          >
            {Object.keys(RANGES).map((key) => {
              const selected = activeRange === key;
              return (
                <Link
                  key={key}
                  href={`/admin?range=${key}`}
                  aria-current={selected ? "page" : undefined}
                  className={`focus-visible:ring-ring inline-flex min-h-9 items-center rounded-lg px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 motion-reduce:transition-none ${
                    selected
                      ? "bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {RANGES[key]} days
                </Link>
              );
            })}
          </nav>
        }
      />

      {/* Needs attention */}
      {attention.length > 0 ? (
        <Reveal direction="up">
          <section
            aria-label="Needs attention"
            className="border-primary/40 bg-primary/5 flex flex-col gap-3 rounded-2xl border p-4 sm:p-5"
          >
            <h2 className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle
                aria-hidden="true"
                className="text-primary size-4"
              />
              Needs attention
            </h2>
            <ul className="flex flex-col gap-2">
              {attention.map((item) => (
                <li
                  key={item.text}
                  className="flex flex-wrap items-center justify-between gap-2 text-sm"
                >
                  <span>{item.text}</span>
                  <Link
                    href={item.href}
                    className="text-foreground focus-visible:ring-ring inline-flex min-h-9 items-center gap-1.5 rounded-sm font-medium underline underline-offset-4 outline-none focus-visible:ring-2"
                  >
                    {item.action}
                    <ArrowRight aria-hidden="true" className="size-3.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>
      ) : null}

      {/* KPIs */}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <li key={stat.label}>
            <Reveal direction="up" className="h-full">
              <StatCard {...stat} />
            </Reveal>
          </li>
        ))}
      </ul>

      {data.truncated ? (
        <p
          role="status"
          className="border-border bg-muted/40 text-warning flex items-start gap-3 rounded-xl border p-4 text-sm leading-6"
        >
          <AlertTriangle
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0"
          />
          Only the first 1000 leads were counted, so the chart and numbers may
          be incomplete.
        </p>
      ) : null}

      {canSeeLeads ? (
        <>
          {/* Conversion + status */}
          <div className="grid gap-4 lg:grid-cols-3">
            {data.conversionPercent !== null ? (
              <Reveal direction="up" className="h-full">
                <div className="border-border bg-card flex h-full flex-col gap-4 rounded-2xl border p-5">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg"
                    >
                      <Target className="size-5" />
                    </span>
                    <h2 className="text-card-title">Conversion</h2>
                  </div>
                  <p className="font-heading text-4xl font-semibold tracking-tight tabular-nums">
                    {data.conversionPercent}%
                  </p>
                  <div
                    role="progressbar"
                    aria-label="Conversion"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.min(100, data.conversionPercent)}
                    className="bg-muted h-2 overflow-hidden rounded-full"
                  >
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{
                        width: `${Math.min(100, data.conversionPercent)}%`,
                      }}
                    />
                  </div>
                  <p className="text-muted-foreground text-sm leading-6">
                    of leads in this period are marked Won.
                  </p>
                </div>
              </Reveal>
            ) : null}

            {statusTotal > 0 ? (
              <div
                className={
                  data.conversionPercent !== null
                    ? "lg:col-span-2"
                    : "lg:col-span-3"
                }
              >
                <StatusOverview total={statusTotal} segments={segments} />
              </div>
            ) : null}
          </div>

          {/* Chart */}
          <Reveal direction="up">
            <Card>
              <CardHeader>
                <CardTitle className="text-card-title flex items-center gap-2">
                  <TrendingUp
                    aria-hidden="true"
                    className="text-primary size-4"
                  />
                  New leads per day
                </CardTitle>
                <CardDescription>Last {data.days} days</CardDescription>
              </CardHeader>
              <CardContent>
                <LeadsChart data={data.series} />
              </CardContent>
            </Card>
          </Reveal>

          {/* Lists */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Reveal direction="up" className="h-full">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-card-title flex items-center justify-between gap-2">
                    Recent leads
                    <Link
                      href="/admin/leads"
                      className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-sm text-sm font-normal underline-offset-4 outline-none hover:underline focus-visible:ring-2"
                    >
                      View all
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LeadList leads={data.recentLeads} empty="No leads yet." />
                </CardContent>
              </Card>
            </Reveal>

            <Reveal direction="up" className="h-full">
              <Card id="follow-ups" className="h-full scroll-mt-24">
                <CardHeader>
                  <CardTitle className="text-card-title flex items-center gap-2">
                    <CalendarClock
                      aria-hidden="true"
                      className="text-primary size-4"
                    />
                    Due follow-ups
                  </CardTitle>
                  <CardDescription>
                    Due today or earlier, open leads
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LeadList
                    leads={data.dueFollowUps}
                    empty="Nothing due."
                    showOverdue
                  />
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </>
      ) : null}

      {/* Activity */}
      {canSeeAudit ? (
        <Reveal direction="up">
          <Card>
            <CardHeader>
              <CardTitle className="text-card-title flex items-center justify-between gap-2">
                Recent activity
                <Link
                  href="/admin/audit-logs"
                  className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-sm text-sm font-normal underline-offset-4 outline-none hover:underline focus-visible:ring-2"
                >
                  Full audit log
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.recentActivity.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No activity yet.
                </p>
              ) : (
                <ol className="flex flex-col text-sm">
                  {data.recentActivity.map((log, index) => (
                    <li
                      key={log.id}
                      className={`border-border relative ml-2 flex flex-wrap items-center justify-between gap-2 border-l pl-5 ${
                        index === data.recentActivity.length - 1
                          ? "pb-0"
                          : "pb-4"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`ring-card absolute top-1.5 -left-[5px] size-2.5 rounded-full ring-4 ${
                          index === 0 ? "bg-primary" : "bg-border"
                        }`}
                      />
                      <span className="font-mono text-xs break-all">
                        {log.action}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {formatDateTime(log.createdAt)}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </Reveal>
      ) : null}

      {/* Quick links */}
      {quickLinks.length > 0 ? (
        <Reveal direction="up">
          <nav aria-label="Quick links" className="flex flex-col gap-3">
            <h2 className="text-card-title">Quick links</h2>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {quickLinks.map(({ icon: Icon, label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group border-border bg-card hover:border-primary/40 focus-visible:ring-ring flex min-h-14 items-center gap-3 rounded-2xl border p-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none"
                  >
                    <span
                      aria-hidden="true"
                      className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg"
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="truncate">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Reveal>
      ) : null}
    </div>
  );
}
