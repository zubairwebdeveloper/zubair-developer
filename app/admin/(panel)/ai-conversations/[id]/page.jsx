import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  Clock,
  MessageSquare,
  MessagesSquare,
  Timer,
} from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConversationTools } from "@/components/admin/ConversationTools";
import { DeleteConversationButton } from "@/components/admin/DeleteConversationButton";
import { ChatMessage } from "@/components/chatbot/ChatMessage";
import { Reveal } from "@/components/shared/Reveal";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { requirePageAdmin } from "@/lib/auth/require-admin";
import { formatDate, formatDateTime } from "@/lib/utils/dates";
import { isValidDocId } from "@/lib/utils/slugs";
import { getConversation } from "@/services/ai-conversations.service";

export const metadata = { title: "Conversation" };

/** Meri assumption hai: apni real conversations list ka path likhein. */
const BACK_HREF = "/admin/ai/conversations";
const LATEST_ID = "latest-message";

function formatDuration(ms) {
  if (!Number.isFinite(ms) || ms < 0) return null;
  const minutes = Math.round(ms / 60_000);
  if (minutes < 1) return "Under a minute";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours < 24) return rest ? `${hours} h ${rest} min` : `${hours} h`;
  const days = Math.floor(hours / 24);
  return `${days} ${days === 1 ? "day" : "days"}`;
}

function getExpiry(expiresAt) {
  const time = Date.parse(expiresAt);
  if (Number.isNaN(time)) return null;
  const days = Math.ceil((time - Date.now()) / 86_400_000);
  if (days <= 0) return { text: "Expiring now", urgent: true };
  if (days === 1) return { text: "In 1 day", urgent: true };
  return { text: `In ${days} days`, urgent: days <= 3 };
}

export default async function ConversationPage({ params }) {
  const admin = await requirePageAdmin(PERMISSIONS.AI_MANAGE);
  const { id } = await params;
  if (!isValidDocId(id)) notFound();

  const conversation = await getConversation(id, admin);
  if (!conversation) notFound();

  const messages = [...(conversation.messages ?? [])].sort(
    (a, b) => Date.parse(a.at) - Date.parse(b.at),
  );

  const first = messages[0];
  const last = messages[messages.length - 1];
  const duration =
    first && last
      ? formatDuration(Date.parse(last.at) - Date.parse(first.at))
      : null;
  const expiry = getExpiry(conversation.expiresAt);

  // Messages ko din ke hisab se group karo
  const groups = [];
  messages.forEach((message, index) => {
    const label = Number.isNaN(Date.parse(message.at))
      ? "Unknown date"
      : formatDate(message.at);
    const current = groups[groups.length - 1];
    if (current && current.label === label) {
      current.items.push({ message, index });
    } else {
      groups.push({ label, items: [{ message, index }] });
    }
  });

  const details = [
    {
      icon: MessageSquare,
      label: "Messages",
      value: messages.length,
    },
    first && {
      icon: Clock,
      label: "Started",
      value: formatDateTime(first.at),
    },
    {
      icon: CalendarClock,
      label: "Last updated",
      value: formatDateTime(conversation.updatedAt),
    },
    duration && {
      icon: Timer,
      label: "Duration",
      value: duration,
    },
  ].filter(Boolean);

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
        All conversations
      </Link>

      <AdminPageHeader
        title="Conversation"
        description={`Last updated ${formatDateTime(conversation.updatedAt)} · auto-deletes ${formatDateTime(conversation.expiresAt)}`}
        actions={<DeleteConversationButton id={id} />}
      />

      <ConversationTools conversationId={id} latestAnchorId={LATEST_ID} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-8">
        {/* Transcript */}
        <section
          aria-label="Transcript"
          className="border-border bg-card min-w-0 rounded-2xl border p-4 sm:p-6"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-4 py-14 text-center">
              <span
                aria-hidden="true"
                className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-xl"
              >
                <MessagesSquare className="size-5" />
              </span>
              <h2 className="font-heading text-lg font-semibold tracking-tight">
                No messages in this conversation
              </h2>
              <p className="text-muted-foreground max-w-sm text-sm leading-6">
                This conversation has no saved messages. It will be removed
                automatically on the date shown above.
              </p>
            </div>
          ) : (
            <div className="mx-auto flex max-w-2xl flex-col gap-8">
              {groups.map((group, groupIndex) => (
                <Reveal key={`${group.label}-${groupIndex}`} direction="up">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3" role="separator">
                      <span className="bg-border h-px flex-1" />
                      <span className="text-muted-foreground text-xs font-medium">
                        {group.label}
                      </span>
                      <span className="bg-border h-px flex-1" />
                    </div>

                    <div className="flex flex-col gap-3">
                      {group.items.map(({ message, index }) => {
                        const isLast = index === messages.length - 1;
                        return (
                          <div
                            key={`${message.at}-${index}`}
                            id={isLast ? LATEST_ID : undefined}
                            className="scroll-mt-28"
                          >
                            <ChatMessage message={message} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </section>

        {/* Details */}
        <aside
          aria-label="Conversation details"
          className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-24 lg:self-start print:hidden"
        >
          <Reveal direction="up">
            <dl className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-5">
              {details.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg"
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <dt className="text-muted-foreground text-xs">{label}</dt>
                    <dd className="text-sm font-medium break-words tabular-nums">
                      {value}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal direction="up">
            <div
              className={`rounded-2xl border p-5 ${
                expiry?.urgent
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-muted/40"
              }`}
            >
              <h2 className="text-card-title">Auto-delete</h2>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                This conversation is removed automatically on{" "}
                <span className="text-foreground font-medium">
                  {formatDateTime(conversation.expiresAt)}
                </span>
                {expiry ? ` (${expiry.text.toLowerCase()})` : ""}.
              </p>
              <p className="text-muted-foreground mt-3 text-xs leading-5">
                Deleting it now is permanent. Use the delete button above only
                if you are sure.
              </p>
            </div>
          </Reveal>
        </aside>
      </div>
    </div>
  );
}
