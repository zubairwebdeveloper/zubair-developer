import { AlertTriangle, Mail, Megaphone, MailCheck } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AnnouncementForm } from "@/components/admin/AnnouncementForm";
import { NotificationSettingsForm } from "@/components/admin/NotificationSettingsForm";
import { ReloadButton } from "@/components/admin/ReloadButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Reveal } from "@/components/shared/Reveal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { requirePageAdmin } from "@/lib/auth/require-admin";
import { isEmailConfigured } from "@/lib/email/provider";
import { formatDateTime } from "@/lib/utils/dates";
import { listEmailEvents } from "@/services/email.service";
import {
  getNotificationPrefs,
  resolveRecipients,
} from "@/services/notification-settings.service";
import { getAnnouncementForAdmin } from "@/services/settings.admin.service";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requirePageAdmin(PERMISSIONS.SETTINGS_MANAGE);

  let announcement = null;
  let prefs = null;
  let events = [];
  let failed = false;

  try {
    [announcement, prefs, events] = await Promise.all([
      getAnnouncementForAdmin(),
      getNotificationPrefs(),
      listEmailEvents(10),
    ]);
  } catch (error) {
    failed = true;
    console.error("[admin] failed to load settings:", error);
  }

  const emailReady = isEmailConfigured();
  const hasRecipients = prefs ? resolveRecipients(prefs).length > 0 : false;

  const integrations = [
    {
      label: "Email provider",
      detail: "EMAIL_PROVIDER_API_KEY + EMAIL_FROM",
      ok: emailReady,
    },
    {
      label: "Recipients",
      detail: "Who receives notifications",
      ok: hasRecipients,
    },
    {
      label: "Cron secret",
      detail: "CRON_SECRET",
      ok: Boolean(process.env.CRON_SECRET),
    },
  ];
  const missing = integrations.filter((item) => !item.ok);

  return (
    <div className="flex flex-col gap-10">
      <AdminPageHeader
        title="Settings"
        description="The announcement bar and email notifications."
      />

      {failed || !prefs ? (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/5 flex max-w-2xl flex-col items-start gap-3 rounded-2xl border p-5"
        >
          <p className="text-destructive font-medium">
            Could not load settings.
          </p>
          <p className="text-muted-foreground text-sm leading-6">
            The forms are hidden so nothing is overwritten by mistake. Reload
            the page. The technical details are in your server logs.
          </p>
          <ReloadButton />
        </div>
      ) : (
        <>
          {/* Announcement */}
          <section
            aria-labelledby="announcement-title"
            className="flex flex-col gap-4"
          >
            <Reveal direction="up">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg"
                >
                  <Megaphone className="size-5" />
                </span>
                <div className="flex flex-col gap-1">
                  <h2 id="announcement-title" className="text-section-title">
                    Announcement bar
                  </h2>
                  <p className="text-muted-foreground text-sm leading-6">
                    It turns on and off by itself, following its schedule.
                  </p>
                </div>
              </div>
            </Reveal>
            <AnnouncementForm announcement={announcement} />
          </section>

          {/* Email */}
          <section
            aria-labelledby="email-title"
            className="flex flex-col gap-6"
          >
            <Reveal direction="up">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg"
                >
                  <Mail className="size-5" />
                </span>
                <div className="flex flex-col gap-1">
                  <h2 id="email-title" className="text-section-title">
                    Email notifications
                  </h2>
                  <p className="text-muted-foreground text-sm leading-6">
                    Check the setup first, then choose what gets sent.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Setup status */}
            <Reveal direction="up">
              <div className="flex flex-col gap-3">
                {missing.length > 0 ? (
                  <div
                    role="status"
                    className="border-border bg-muted/40 flex items-start gap-3 rounded-xl border p-4 text-sm"
                  >
                    <AlertTriangle
                      aria-hidden="true"
                      className="text-primary mt-0.5 size-4 shrink-0"
                    />
                    <p className="text-muted-foreground leading-6">
                      {missing.length === 1
                        ? "1 item needs attention:"
                        : `${missing.length} items need attention:`}{" "}
                      <span className="text-foreground font-medium">
                        {missing.map((item) => item.label).join(", ")}
                      </span>
                      .
                    </p>
                  </div>
                ) : (
                  <div
                    role="status"
                    className="border-border bg-muted/40 flex items-start gap-3 rounded-xl border p-4 text-sm"
                  >
                    <MailCheck
                      aria-hidden="true"
                      className="text-primary mt-0.5 size-4 shrink-0"
                    />
                    <p className="text-muted-foreground leading-6">
                      Everything needed for email is set up.
                    </p>
                  </div>
                )}

                <ul
                  aria-label="Email setup status"
                  className="grid gap-3 sm:grid-cols-3"
                >
                  {integrations.map((item) => (
                    <li
                      key={item.label}
                      className="border-border bg-card flex min-w-0 flex-col gap-2 rounded-2xl border p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                        <StatusBadge
                          status={item.ok ? "active" : "disabled"}
                          label={item.ok ? "Ready" : "Missing"}
                        />
                      </div>
                      <span className="text-muted-foreground font-mono text-xs break-words">
                        {item.detail}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <NotificationSettingsForm prefs={prefs} canTest={emailReady} />

            {/* Recent activity */}
            <div className="flex flex-col gap-3">
              <h3 className="text-card-title">Recent email activity</h3>
              {events.length === 0 ? (
                <div className="border-border bg-card text-muted-foreground max-w-2xl rounded-2xl border border-dashed px-6 py-8 text-center text-sm">
                  No emails have been attempted yet.
                </div>
              ) : (
                <>
                  {/* Mobile: cards */}
                  <ul className="flex max-w-2xl flex-col gap-3 md:hidden">
                    {events.map((event) => (
                      <li
                        key={event.id}
                        className="border-border bg-card flex flex-col gap-2 rounded-2xl border p-4"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs break-all">
                            {event.template}
                          </span>
                          <StatusBadge status={event.status} />
                        </div>
                        <dl className="text-muted-foreground grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <dt>Attempts</dt>
                            <dd className="text-foreground tabular-nums">
                              {event.attempts}
                            </dd>
                          </div>
                          <div>
                            <dt>Error</dt>
                            <dd className="text-foreground font-mono break-all">
                              {event.errorKind ?? "—"}
                            </dd>
                          </div>
                        </dl>
                        <p className="text-muted-foreground text-xs">
                          {formatDateTime(event.updatedAt)}
                        </p>
                      </li>
                    ))}
                  </ul>

                  {/* Desktop: table */}
                  <div className="border-border bg-card hidden max-w-3xl overflow-x-auto rounded-2xl border md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Attempts</TableHead>
                          <TableHead>Error</TableHead>
                          <TableHead>Updated</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {events.map((event) => (
                          <TableRow
                            key={event.id}
                            className="hover:bg-muted/50"
                          >
                            <TableCell className="font-mono text-xs">
                              {event.template}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={event.status} />
                            </TableCell>
                            <TableCell className="tabular-nums">
                              {event.attempts}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {event.errorKind ?? "—"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {formatDateTime(event.updatedAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
