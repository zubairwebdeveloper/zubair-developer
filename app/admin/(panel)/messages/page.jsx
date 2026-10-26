import { MessagesSquare, ShieldCheck } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MessageActions } from "@/components/admin/MessageActions";
import { MessagesList } from "@/components/admin/MessagesList";
import { ReloadButton } from "@/components/admin/ReloadButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { labelFor, serviceCategoryOptions } from "@/constants/options";
import { hasPermission, PERMISSIONS } from "@/lib/auth/permissions";
import { requirePageAdmin } from "@/lib/auth/require-admin";
import { formatDateTime } from "@/lib/utils/dates";
import { listMessages } from "@/services/messages.service";

export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  const admin = await requirePageAdmin(PERMISSIONS.LEADS_READ);
  const canManage = hasPermission(admin.role, PERMISSIONS.LEADS_MANAGE);

  let messages = null;
  try {
    messages = await listMessages();
  } catch (error) {
    console.error("[admin] failed to list messages:", error);
  }

  const items = (messages ?? []).map((message) => ({
    id: String(message.id),
    subject: String(message.subject ?? ""),
    name: String(message.name ?? ""),
    email: String(message.email ?? ""),
    company: message.company ? String(message.company) : "",
    serviceLabel: labelFor(serviceCategoryOptions, message.service) ?? "",
    whenLabel: formatDateTime(message.createdAt),
    status: message.status ?? "",
    message: String(message.message ?? ""),
    badge: <StatusBadge status={message.status} />,
    actions: canManage ? (
      <MessageActions id={message.id} status={message.status} />
    ) : null,
  }));

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Messages"
        description="Messages sent through the contact form."
      />

      {messages === null ? (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/5 flex max-w-2xl flex-col items-start gap-3 rounded-2xl border p-5"
        >
          <p className="text-destructive font-medium">
            Could not load messages.
          </p>
          <p className="text-muted-foreground text-sm leading-6">
            Check your Firebase configuration and indexes. The technical details
            are in your server logs.
          </p>
          <ReloadButton />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No messages"
          description="Contact form submissions will appear here."
        />
      ) : (
        <>
          <p className="text-muted-foreground inline-flex items-center gap-2 text-sm">
            <MessagesSquare aria-hidden="true" className="size-4" />
            <span className="text-foreground font-medium tabular-nums">
              {items.length}
            </span>
            {items.length === 1 ? "message" : "messages"}
          </p>

          <MessagesList items={items} />

          <div className="border-border bg-muted/40 flex items-start gap-3 rounded-xl border p-4 text-sm">
            <ShieldCheck
              aria-hidden="true"
              className="text-primary mt-0.5 size-4 shrink-0"
            />
            <p className="text-muted-foreground leading-6">
              Messages contain personal data. Share them only when needed.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
