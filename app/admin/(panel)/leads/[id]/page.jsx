import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  FileText,
  Mail,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CopyValueButton } from "@/components/admin/CopyValueButton";
import { LeadControls } from "@/components/admin/LeadControls";
import { LeadNotes } from "@/components/admin/LeadNotes";
import { LeadToolbar } from "@/components/admin/LeadToolbar";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Reveal } from "@/components/shared/Reveal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LEAD_STATUS_LABELS } from "@/constants/lead-status";
import {
  budgetOptions,
  contactMethodOptions,
  labelFor,
  serviceCategoryOptions,
  timelineOptions,
} from "@/constants/options";
import { hasPermission, PERMISSIONS } from "@/lib/auth/permissions";
import { requirePageAdmin } from "@/lib/auth/require-admin";
import { formatDateTime } from "@/lib/utils/dates";
import { isValidDocId } from "@/lib/utils/slugs";
import { getLeadDetail } from "@/services/leads.service";
import { formatEstimate } from "@/lib/ai/pricing-estimator";

export const metadata = { title: "Lead details" };

/** Meri assumption hai: apni real leads list ka path likhein. */
const BACK_HREF = "/admin/leads";

const isHttpUrl = (value) =>
  typeof value === "string" && /^https?:\/\//i.test(value);

function Detail({ label, children, className = "" }) {
  if (!children) return null;
  return (
    <div className={`flex min-w-0 flex-col gap-1 ${className}`}>
      <dt className="text-label text-muted-foreground">{label}</dt>
      <dd className="break-words whitespace-pre-wrap">{children}</dd>
    </div>
  );
}

function Group({ title, children }) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-muted-foreground border-border border-b pb-2 text-xs font-medium">
        {title}
      </h3>
      <dl className="grid gap-4 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

export default async function LeadDetailPage({ params }) {
  const admin = await requirePageAdmin(PERMISSIONS.LEADS_READ);
  const { id } = await params;
  if (!isValidDocId(id)) notFound();

  const detail = await getLeadDetail(id);
  if (!detail) notFound();

  const { lead, inquiry } = detail;
  const canManage = hasPermission(admin.role, PERMISSIONS.LEADS_MANAGE);
  const history = [...(lead.statusHistory ?? [])].reverse();
  const notesCount = (lead.notes ?? []).length;

  const service = labelFor(serviceCategoryOptions, lead.service);
  const budget = labelFor(budgetOptions, lead.budget);
  const timeline = labelFor(timelineOptions, lead.timeline);

  // Summary: sirf wahi cheezein jo is lead ma maujood hain
  const summary = [
    { icon: Wallet, label: "Budget", value: budget },
    { icon: CalendarClock, label: "Timeline", value: timeline },
    { icon: FileText, label: "Service", value: service },
  ].filter((item) => item.value);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={BACK_HREF}
        className="group text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex min-h-10 w-fit items-center gap-1.5 rounded-md text-sm underline-offset-4 outline-none transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none print:hidden"
      >
        <ArrowLeft
          aria-hidden="true"
          className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5 motion-reduce:transition-none"
        />
        All leads
      </Link>

      <AdminPageHeader
        title={lead.name}
        description={`${lead.reference} · received ${formatDateTime(lead.createdAt)}`}
        actions={
          <StatusBadge
            status={lead.status}
            label={LEAD_STATUS_LABELS[lead.status]}
          />
        }
      />

      <LeadToolbar />

      {/* Quick summary */}
      <Reveal direction="up">
        <div className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span
              aria-hidden="true"
              className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg"
            >
              <Mail className="size-[18px]" />
            </span>
            <a
              href={`mailto:${lead.email}`}
              className="focus-visible:ring-ring min-w-0 rounded-sm font-medium break-all underline underline-offset-4 outline-none focus-visible:ring-2"
            >
              {lead.email}
            </a>
            <CopyValueButton value={lead.email} label="email" />
            <span className="text-muted-foreground ml-auto font-mono text-xs break-all">
              {lead.reference}
            </span>
          </div>

          {summary.length > 0 ? (
            <dl className="grid gap-3 sm:grid-cols-3">
              {summary.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="bg-muted/40 flex min-w-0 items-start gap-3 rounded-xl p-3"
                >
                  <Icon
                    aria-hidden="true"
                    className="text-muted-foreground mt-0.5 size-4 shrink-0"
                  />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <dt className="text-muted-foreground text-xs">{label}</dt>
                    <dd className="text-sm font-medium break-words">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <Reveal direction="up">
            <Card>
              <CardHeader>
                <CardTitle className="text-card-title">Project brief</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-8">
                <Group title="Contact">
                  <Detail label="Email">
                    <a
                      href={`mailto:${lead.email}`}
                      className="underline underline-offset-4"
                    >
                      {lead.email}
                    </a>
                  </Detail>
                  <Detail label="Preferred contact">
                    {labelFor(contactMethodOptions, lead.contactMethod)}
                  </Detail>
                  <Detail label="Business type">{lead.businessType}</Detail>
                  <Detail label="Source">{lead.source}</Detail>
                </Group>

                <Group title="Project">
                  <Detail label="Service">{service}</Detail>
                  <Detail label="Selected plan">{lead.planSlug}</Detail>
                  <Detail label="Budget">{budget}</Detail>
                  <Detail label="Timeline">{timeline}</Detail>
                  {inquiry ? (
                    <>
                      <Detail label="Description" className="sm:col-span-2">
                        {inquiry.description}
                      </Detail>
                      <Detail
                        label="Required features"
                        className="sm:col-span-2"
                      >
                        {inquiry.features}
                      </Detail>
                      <Detail label="Existing website">
                        {isHttpUrl(inquiry.existingWebsite) ? (
                          <a
                            href={inquiry.existingWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline underline-offset-4"
                          >
                            {inquiry.existingWebsite}
                          </a>
                        ) : (
                          inquiry.existingWebsite
                        )}
                      </Detail>
                      <Detail label="Reference links">
                        {inquiry.referenceLinks}
                      </Detail>
                    </>
                  ) : null}
                </Group>

                {lead.aiSummary || lead.aiEstimate ? (
                  <Group title="From the AI chat">
                    <Detail
                      label="AI summary (from chat)"
                      className="sm:col-span-2"
                    >
                      {lead.aiSummary}
                    </Detail>
                    <Detail label="Preliminary estimate">
                      {lead.aiEstimate ? formatEstimate(lead.aiEstimate) : null}
                    </Detail>
                  </Group>
                ) : null}

                {inquiry ? (
                  <Group title="Consent">
                    <Detail label="Consent">
                      {inquiry.consentGiven
                        ? `Given on ${formatDateTime(inquiry.consentAt)}`
                        : "Not recorded"}
                    </Detail>
                  </Group>
                ) : null}
              </CardContent>
            </Card>
          </Reveal>

          <Reveal direction="up">
            <Card>
              <CardHeader>
                <CardTitle className="text-card-title">
                  Notes
                  <span className="text-muted-foreground ml-2 text-sm font-normal tabular-nums">
                    ({notesCount})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LeadNotes
                  leadId={lead.id}
                  notes={lead.notes ?? []}
                  canManage={canManage}
                />
              </CardContent>
            </Card>
          </Reveal>
        </div>

        <div className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <Reveal direction="up">
            <Card>
              <CardHeader>
                <CardTitle className="text-card-title">Manage</CardTitle>
              </CardHeader>
              <CardContent>
                {canManage ? (
                  <LeadControls lead={lead} />
                ) : (
                  <p className="text-muted-foreground text-sm">
                    You have read-only access to leads.
                  </p>
                )}
              </CardContent>
            </Card>
          </Reveal>

          <Reveal direction="up">
            <Card>
              <CardHeader>
                <CardTitle className="text-card-title">
                  Status history
                </CardTitle>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No status changes recorded.
                  </p>
                ) : (
                  <ol className="flex flex-col text-sm">
                    {history.map((entry, index) => (
                      <li
                        key={`${entry.status}-${entry.at}-${index}`}
                        className={`border-border relative ml-2 flex flex-col gap-1 border-l pl-5 ${
                          index === history.length - 1 ? "pb-0" : "pb-5"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`ring-card absolute top-1.5 -left-[5px] size-2.5 rounded-full ring-4 ${
                            index === 0 ? "bg-primary" : "bg-border"
                          }`}
                        />
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <StatusBadge
                            status={entry.status}
                            label={LEAD_STATUS_LABELS[entry.status]}
                          />
                          <span className="text-muted-foreground text-xs">
                            {formatDateTime(entry.at)}
                          </span>
                        </div>
                        <span className="text-muted-foreground text-xs">
                          by{" "}
                          {entry.byName ??
                            (entry.by === "system" ? "System" : "Admin")}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>
          </Reveal>

          <div className="border-border bg-muted/40 flex items-start gap-3 rounded-xl border p-4 text-sm print:hidden">
            <ShieldCheck
              aria-hidden="true"
              className="text-primary mt-0.5 size-4 shrink-0"
            />
            <p className="text-muted-foreground leading-6">
              This page contains personal data. Share it only with people who
              need it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
