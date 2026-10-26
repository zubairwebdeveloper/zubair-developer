import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  MessageSquare,
  MessagesSquare,
  ShieldCheck,
} from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConversationsList } from "@/components/admin/ConversationsList";
import { EmptyState } from "@/components/shared/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { requirePageAdmin } from "@/lib/auth/require-admin";
import { formatDateTime } from "@/lib/utils/dates";
import { isValidDocId } from "@/lib/utils/slugs";
import { listConversations } from "@/services/ai-conversations.service";

export const metadata = { title: "AI conversations" };

const BASE = "/admin/ai-conversations";

function getDaysLeft(expiresAt) {
  const time = Date.parse(expiresAt);
  if (Number.isNaN(time)) return null;
  return Math.ceil((time - Date.now()) / 86_400_000);
}

export default async function AiConversationsPage({ searchParams }) {
  await requirePageAdmin(PERMISSIONS.AI_MANAGE);
  const { after } = await searchParams;
  const cursor = isValidDocId(after) ? after : null;

  let data = null;
  try {
    data = await listConversations({ after: cursor });
  } catch (error) {
    console.error("[admin] failed to list conversations:", error);
  }

  const items = (data?.conversations ?? []).map((item) => ({
    id: item.id,
    preview: item.preview ?? "",
    count: item.count ?? 0,
    updatedAt: item.updatedAt,
    expiresAt: item.expiresAt,
    updatedLabel: formatDateTime(item.updatedAt),
    expiresLabel: formatDateTime(item.expiresAt),
    daysLeft: getDaysLeft(item.expiresAt),
  }));

  const totalMessages = items.reduce((sum, item) => sum + item.count, 0);
  const known = items.map((i) => i.daysLeft).filter((d) => d != null);
  const soonest = known.length ? Math.min(...known) : null;

  const stats = [
    {
      icon: MessagesSquare,
      label: "Conversations on this page",
      value: items.length,
    },
    {
      icon: MessageSquare,
      label: "Messages on this page",
      value: totalMessages,
    },
    soonest != null && {
      icon: CalendarClock,
      label: "Soonest auto-delete",
      value:
        soonest <= 0 ? "Now" : `${soonest} ${soonest === 1 ? "day" : "days"}`,
    },
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="AI conversations"
        description="Conversations are saved only when “Store conversations” is ON in the AI settings. Viewing them is recorded in the audit log."
      />

      {data === null ? (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/5 flex flex-col items-start gap-3 rounded-2xl border p-5"
        >
          <p className="text-destructive font-medium">
            Could not load conversations.
          </p>
          <p className="text-muted-foreground text-sm leading-6">
            This is usually temporary. Try again in a moment.
          </p>
          <Link
            href={cursor ? `${BASE}?after=${cursor}` : BASE}
            className={buttonVariants({ variant: "outline" })}
          >
            Try again
          </Link>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No stored conversations"
          description="Storage is OFF by default. Turn it on from the AI assistant page."
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
              Opening a conversation is logged. Open only what you need to
              review.
            </p>
          </div>

          <ConversationsList items={items} />

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
                  Older conversations
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
