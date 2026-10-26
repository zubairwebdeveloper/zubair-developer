import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AiPlayground } from "@/components/admin/AiPlayground";
import { AiSettingsForm } from "@/components/admin/AiSettingsForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { VersionHistoryFilter } from "@/components/admin/VersionHistoryFilter";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isGeminiConfigured } from "@/lib/ai/gemini";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { requirePageAdmin } from "@/lib/auth/require-admin";
import { isDurableRateLimitConfigured } from "@/lib/security/rate-limit";
import { formatDateTime } from "@/lib/utils/dates";
import {
  getAiSettingsFresh,
  listAiVersions,
} from "@/services/ai-settings.service";
import { listUsage } from "@/services/ai-usage.service";

export const metadata = { title: "AI assistant" };

const TREND_WINDOW_DAYS = 7;

/** Sums a numeric field across usage days, treating missing values as 0. */
function sumField(days, field) {
  return days.reduce((total, day) => total + (day[field] ?? 0), 0);
}

/**
 * Splits the fetched usage window into an earlier and a more recent half (by
 * date, not fetch order, since listUsage's ordering isn't guaranteed here) and
 * compares total replies between them. Returns null when there isn't enough
 * data on both sides to say anything meaningful.
 */
function computeReplyTrend(usage) {
  if (usage.length < TREND_WINDOW_DAYS * 2) return null;

  const sorted = [...usage].sort((a, b) => (a.id < b.id ? -1 : 1));
  const recent = sorted.slice(-TREND_WINDOW_DAYS);
  const earlier = sorted.slice(-TREND_WINDOW_DAYS * 2, -TREND_WINDOW_DAYS);

  const recentMessages = sumField(recent, "messages");
  const earlierMessages = sumField(earlier, "messages");

  if (earlierMessages === 0) return null;

  const changePct = Math.round(
    ((recentMessages - earlierMessages) / earlierMessages) * 100,
  );

  return { recentMessages, earlierMessages, changePct };
}

/** A quiet CSS-only bar chart of daily replies, oldest to newest, left to right. */
function DailyReplyChart({ usage }) {
  if (usage.length === 0) return null;

  const sorted = [...usage].sort((a, b) => (a.id < b.id ? -1 : 1));
  const max = Math.max(1, ...sorted.map((day) => day.messages ?? 0));

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-3 text-sm font-medium text-foreground">
        Replies per day
      </p>
      <div
        role="img"
        aria-label={`Daily reply counts from ${sorted[0].id} to ${sorted[sorted.length - 1].id}`}
        className="flex h-24 items-end gap-1"
      >
        {sorted.map((day) => {
          const value = day.messages ?? 0;
          const heightPct = Math.max(4, Math.round((value / max) * 100));
          return (
            <div
              key={day.id}
              title={`${day.id}: ${value} ${value === 1 ? "reply" : "replies"}`}
              style={{ height: `${heightPct}%` }}
              className="min-w-[6px] flex-1 rounded-t-sm bg-primary/70 transition-colors duration-150 hover:bg-primary"
            />
          );
        })}
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
        <span>{sorted[0].id}</span>
        <span>{sorted[sorted.length - 1].id}</span>
      </div>
    </div>
  );
}

export default async function AiAssistantPage() {
  await requirePageAdmin(PERMISSIONS.AI_MANAGE);

  let settings = null;
  let usage = [];
  let versions = [];

  try {
    [settings, usage, versions] = await Promise.all([
      getAiSettingsFresh(),
      listUsage(14),
      listAiVersions(10),
    ]);
  } catch (error) {
    console.error("[admin] failed to load AI assistant data:", error);
  }

  const totals = usage.reduce(
    (sum, day) => ({
      messages: sum.messages + (day.messages ?? 0),
      leads: sum.leads + (day.leads ?? 0),
      errors: sum.errors + (day.errors ?? 0),
      rateLimited: sum.rateLimited + (day.rateLimited ?? 0),
    }),
    { messages: 0, leads: 0, errors: 0, rateLimited: 0 },
  );
  const lastError = usage.find((day) => day.lastError)?.lastError;
  const avgRepliesPerDay =
    usage.length > 0 ? Math.round(totals.messages / usage.length) : 0;
  const trend = computeReplyTrend(usage);

  const integrations = [
    {
      label: "Gemini (GEMINI_API_KEY + GEMINI_MODEL)",
      ok: isGeminiConfigured(),
    },
    {
      label: "Durable rate limiting (Redis)",
      ok: isDurableRateLimitConfigured(),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="AI assistant"
        description="Settings, usage aur test playground."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/ai-conversations"
              className={buttonVariants({ variant: "outline" })}
            >
              Conversations
            </Link>
            <Link
              href="/admin/ai-knowledge"
              className={buttonVariants({ variant: "outline" })}
            >
              Manage knowledge
            </Link>
          </div>
        }
      />

      <ul className="flex flex-wrap gap-3 text-sm">
        {settings ? (
          <li className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
            <StatusBadge
              status={settings.enabled ? "active" : "disabled"}
              label={
                settings.enabled ? "Assistant enabled" : "Assistant disabled"
              }
            />
            Visible to site visitors
          </li>
        ) : null}
        {integrations.map((item) => (
          <li
            key={item.label}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2"
          >
            <StatusBadge
              status={item.ok ? "active" : "disabled"}
              label={item.ok ? "Configured" : "Missing"}
            />
            {item.label}
          </li>
        ))}
      </ul>

      {!settings ? (
        <p role="alert" className="text-destructive">
          Could not load AI settings.
        </p>
      ) : (
        <>
          <div
            role="note"
            className="max-w-2xl rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm"
          >
            Ye settings public visitors ke jawab, privacy aur kharch par asar
            dalti hain. Save karne se pehle confirm karna hoga, aur har save ek
            naya version banata hai.
          </div>

          <section
            aria-labelledby="usage-title"
            className="flex flex-col gap-4"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="usage-title" className="text-section-title">
                Usage (last 14 days)
              </h2>
              <p className="text-sm text-muted-foreground">
                Replies, leads and errors recorded per day in UTC.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["AI replies", totals.messages],
                ["Leads from AI", totals.leads],
                ["Provider errors", totals.errors],
                ["Rate-limited", totals.rateLimited],
              ].map(([label, value]) => (
                <Card key={label}>
                  <CardHeader>
                    <CardDescription>{label}</CardDescription>
                    <CardTitle className="text-metric text-4xl">
                      {value}
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {usage.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
                <DailyReplyChart usage={usage} />

                <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Average replies / day
                    </p>
                    <p className="text-metric text-2xl font-semibold">
                      {avgRepliesPerDay}
                    </p>
                  </div>
                  {trend ? (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Last {TREND_WINDOW_DAYS} days vs previous{" "}
                        {TREND_WINDOW_DAYS}
                      </p>
                      <p
                        className={`text-metric text-2xl font-semibold ${
                          trend.changePct >= 0
                            ? "text-success"
                            : "text-destructive"
                        }`}
                      >
                        {trend.changePct >= 0 ? "+" : ""}
                        {trend.changePct}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {trend.recentMessages} vs {trend.earlierMessages}{" "}
                        replies
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Not enough history yet for a week-over-week trend.
                    </p>
                  )}
                </div>
              </div>
            ) : null}

            {lastError ? (
              <p className="text-sm text-muted-foreground">
                Last error: <span className="font-mono">{lastError.kind}</span>{" "}
                at {formatDateTime(lastError.at)}
                {lastError.message ? (
                  <>
                    {" — "}
                    <span className="font-mono">{lastError.message}</span>
                  </>
                ) : null}
              </p>
            ) : null}

            {usage.length > 0 ? (
              <div className="rounded-xl border border-border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Day (UTC)</TableHead>
                      <TableHead>Replies</TableHead>
                      <TableHead>Leads</TableHead>
                      <TableHead>Errors</TableHead>
                      <TableHead>Rate-limited</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usage.map((day) => (
                      <TableRow key={day.id}>
                        <TableCell>{day.id}</TableCell>
                        <TableCell>{day.messages ?? 0}</TableCell>
                        <TableCell>{day.leads ?? 0}</TableCell>
                        <TableCell>{day.errors ?? 0}</TableCell>
                        <TableCell>{day.rateLimited ?? 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No usage recorded yet.
              </p>
            )}
          </section>

          <section
            aria-labelledby="settings-title"
            className="flex flex-col gap-4"
          >
            <h2 id="settings-title" className="text-section-title">
              Settings
            </h2>
            <AiSettingsForm settings={settings} />
          </section>

          <section
            aria-labelledby="playground-title"
            className="flex flex-col gap-4"
          >
            <h2 id="playground-title" className="text-section-title">
              Test playground
            </h2>
            <p className="text-sm text-muted-foreground">
              Saved settings aur published knowledge ke saath ek sawal try
              karein.
            </p>
            <AiPlayground />
          </section>

          <section
            aria-labelledby="versions-title"
            className="flex flex-col gap-4"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="versions-title" className="text-section-title">
                Version history
              </h2>
              <p className="text-sm text-muted-foreground">
                Every save creates a new version. Restore an older one at any
                time.
              </p>
            </div>
            <VersionHistoryFilter versions={versions} />
          </section>
        </>
      )}
    </div>
  );
}
