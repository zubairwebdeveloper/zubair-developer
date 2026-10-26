import Link from "next/link";
import { ArrowRight, Bell, BellRing, CheckCheck } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  MarkAllReadButton,
  MarkReadButton,
} from "@/components/admin/NotificationActions";
import { ReloadButton } from "@/components/admin/ReloadButton";
import { Reveal } from "@/components/shared/Reveal";
import { EmptyState } from "@/components/shared/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { requirePageAdmin } from "@/lib/auth/require-admin";
import { formatDateTime } from "@/lib/utils/dates";
import { cn } from "@/lib/utils/cn";
import { listNotifications } from "@/services/notifications.service";

export const metadata = { title: "Notifications" };

const BASE = "/admin/notifications";

export default async function NotificationsPage({ searchParams }) {
  await requirePageAdmin(PERMISSIONS.NOTIFICATIONS_VIEW);
  const { filter } = await searchParams;
  const unreadOnly = filter === "unread";

  let items = null;
  try {
    items = await listNotifications({ unreadOnly });
  } catch (error) {
    console.error("[admin] failed to list notifications:", error);
  }

  const list = items ?? [];
  const unreadCount = list.filter((item) => !item.read).length;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Notifications"
        description="Real events: new inquiries and project briefs."
        actions={<MarkAllReadButton />}
      />

      <nav aria-label="Filter notifications" className="flex flex-wrap gap-2">
        <Link
          href={BASE}
          aria-current={unreadOnly ? undefined : "page"}
          className={buttonVariants({
            size: "sm",
            variant: unreadOnly ? "outline" : "default",
          })}
        >
          All
        </Link>
        <Link
          href={`${BASE}?filter=unread`}
          aria-current={unreadOnly ? "page" : undefined}
          className={buttonVariants({
            size: "sm",
            variant: unreadOnly ? "default" : "outline",
          })}
        >
          Unread
        </Link>
      </nav>

      {items === null ? (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/5 flex max-w-2xl flex-col items-start gap-3 rounded-2xl border p-5"
        >
          <p className="text-destructive font-medium">
            Could not load notifications.
          </p>
          <p className="text-muted-foreground text-sm leading-6">
            Check your Firebase configuration and indexes. The technical details
            are in your server logs.
          </p>
          <ReloadButton />
        </div>
      ) : items.length === 0 ? (
        unreadOnly ? (
          <div className="border-border bg-card flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-12 text-center">
            <span
              aria-hidden="true"
              className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-xl"
            >
              <CheckCheck className="size-5" />
            </span>
            <h2 className="font-heading text-lg font-semibold tracking-tight">
              Nothing unread
            </h2>
            <p className="text-muted-foreground max-w-sm text-sm leading-6">
              You have read everything. New activity will show up here.
            </p>
            <Link
              href={BASE}
              className={buttonVariants({ variant: "outline" })}
            >
              View all notifications
            </Link>
          </div>
        ) : (
          <EmptyState
            title="You're all caught up"
            description="New activity will show up here."
          />
        )
      ) : (
        <>
          <p
            className="text-muted-foreground inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-sm"
            role="status"
          >
            {unreadCount > 0 ? (
              <BellRing aria-hidden="true" className="text-primary size-4" />
            ) : (
              <Bell aria-hidden="true" className="size-4" />
            )}
            <span className="text-foreground font-medium tabular-nums">
              {list.length}
            </span>
            {list.length === 1 ? "notification" : "notifications"}
            {!unreadOnly ? (
              <span>
                · <span className="tabular-nums">{unreadCount}</span> unread
              </span>
            ) : null}
          </p>

          <Reveal direction="up">
            <ul className="divide-border border-border bg-card flex flex-col divide-y overflow-hidden rounded-2xl border">
              {list.map((item) => (
                <li
                  key={item.id}
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-3 p-4 transition-colors sm:p-5 motion-reduce:transition-none",
                    item.read ? "" : "bg-primary/5",
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-2 size-2 shrink-0 rounded-full",
                        item.read ? "bg-transparent" : "bg-primary",
                      )}
                    />
                    <div className="flex min-w-0 flex-col gap-1">
                      <Link
                        href={item.link ?? "/admin"}
                        className={cn(
                          "group focus-visible:ring-ring inline-flex w-fit max-w-full items-center gap-1.5 rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-2",
                          item.read ? "text-muted-foreground" : "font-semibold",
                        )}
                      >
                        <span className="break-words">{item.title}</span>
                        <ArrowRight
                          aria-hidden="true"
                          className="size-3.5 shrink-0 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
                        />
                        {item.read ? null : (
                          <span className="sr-only">(unread)</span>
                        )}
                      </Link>
                      <p className="text-muted-foreground text-sm leading-6 break-words">
                        {item.body}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatDateTime(item.createdAt)}
                      </p>
                    </div>
                  </div>
                  {item.read ? null : <MarkReadButton id={item.id} />}
                </li>
              ))}
            </ul>
          </Reveal>
        </>
      )}
    </div>
  );
}
