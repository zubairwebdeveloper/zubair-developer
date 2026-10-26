import "server-only";

import { createHash } from "node:crypto";

import {
  autoReplyEmail,
  followUpDigestEmail,
  newInquiryEmail,
} from "@/lib/email/templates";
import { rateLimit } from "@/lib/security/rate-limit";
import { deliverEmail } from "@/services/email.service";
import {
  getNotificationPrefs,
  resolveRecipients,
} from "@/services/notification-settings.service";

const DAY_SECONDS = 86_400;

/**
 * Visitor ko tasdeeqi email. Abuse se bachao:
 * - email ma visitor ka koi text nahi (sirf owner ka message + reference)
 * - har email address par din ma 2 se zyada nahi
 * - strict limit: production ma Redis na ho to bheji hi nahi jati
 */
async function sendAutoReply(info, prefs) {
  try {
    const emailHash = createHash("sha256")
      .update(String(info.email).toLowerCase())
      .digest("hex")
      .slice(0, 24);

    const limited = await rateLimit({
      name: "autoreply",
      id: emailHash,
      limit: 2,
      windowSeconds: DAY_SECONDS,
      strict: true,
    });
    if (!limited.ok) return;

    await deliverEmail({
      key: `autoreply_${info.id}`,
      to: [info.email],
      ...autoReplyEmail({
        reference: info.reference,
        message: prefs.autoReplyMessage,
      }),
    });
  } catch (error) {
    console.error("[email-notifier] auto-reply failed:", error);
  }
}

export async function notifyNewInquiry(info) {
  try {
    const prefs = await getNotificationPrefs();
    if (!prefs.emailEnabled) return;

    if (prefs.onNewInquiry) {
      await deliverEmail({
        key: `inquiry_${info.id}`,
        to: resolveRecipients(prefs),
        ...newInquiryEmail(info),
      });
    }

    if (prefs.autoReplyEnabled) await sendAutoReply(info, prefs);
  } catch (error) {
    console.error("[email-notifier] new inquiry email failed:", error);
  }
}

export async function notifyFollowUpsDue(leads) {
  if (leads.length === 0) return;

  try {
    const prefs = await getNotificationPrefs();
    if (!prefs.emailEnabled || !prefs.onFollowUpDue) return;

    // Key leads + due-date se banti hai: wahi set dobara aaye to email dobara nahi jati.
    const digest = createHash("sha1")
      .update(
        leads
          .map((lead) => `${lead.id}:${lead.dueAt}`)
          .sort()
          .join("|"),
      )
      .digest("hex")
      .slice(0, 16);

    await deliverEmail({
      key: `followups_${digest}`,
      to: resolveRecipients(prefs),
      ...followUpDigestEmail(leads),
    });
  } catch (error) {
    console.error("[email-notifier] follow-up email failed:", error);
  }
}
