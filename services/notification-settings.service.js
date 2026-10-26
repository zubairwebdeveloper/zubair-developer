import "server-only";

import { COLLECTIONS } from "@/constants/collections";
import { getAdminDb } from "@/lib/firebase/admin";
import { serializeDoc, serverTimestamp } from "@/lib/firebase/firestore";
import { logActivity } from "@/services/activity.service";

const DEFAULTS = {
  
  emailEnabled: false,
  onNewInquiry: true,
  onFollowUpDue: true,
  recipients: [],
  autoReplyEnabled: false,
  autoReplyMessage:
    "Thanks for getting in touch. I have received your message and will reply personally as soon as I can. Please do not send passwords or payment details by email.",
};

const ref = () =>
  getAdminDb().collection(COLLECTIONS.siteSettings).doc("notifications");

export async function getNotificationPrefs() {
  const stored = serializeDoc(await ref().get()) ?? {};
  return Object.fromEntries(
    Object.keys(DEFAULTS).map((key) => [key, stored[key] ?? DEFAULTS[key]]),
  );
}

export async function saveNotificationPrefs(data, admin) {
  await ref().set(
    { ...data, updatedAt: serverTimestamp(), updatedBy: admin.uid },
    { merge: true },
  );
  await logActivity({
    action: "settings.notifications_updated",
    entityType: "settings",
    entityId: "notifications",
    admin,
    meta: { emailEnabled: data.emailEnabled },
  });
}

/** Admin ne recipients diye hon to wo, warna ADMIN_NOTIFY_EMAILS env. */
export function resolveRecipients(prefs) {
  if (prefs.recipients.length > 0) return prefs.recipients;

  return (process.env.ADMIN_NOTIFY_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim())
    .filter((email) => email.includes("@"));
}
