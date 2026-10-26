import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";

import { COLLECTIONS } from "@/constants/collections";
import { LEAD_STATUS } from "@/constants/lead-status";
import { getAdminDb } from "@/lib/firebase/admin";
import { serverTimestamp } from "@/lib/firebase/firestore";
import {
  buildNotification,
  NOTIFICATION_TYPES,
} from "@/lib/notifications/notification-service";

function generateReference() {
  return `ZD-${randomBytes(4).toString("hex").toUpperCase()}`;
}

/**
 * @param {{ type: "contact" | "project_brief", source: string } & Record<string, unknown>} input
 * Pehle se validated data. `consent` store nahi hota, sirf consentGiven + time.
 */
export async function createInquiry(input) {
   const { type, source, consent, submissionId, ...fields } = input;
   const isBrief = type === "project_brief";
   const isAi = source === "website_ai";

   const db = getAdminDb();
   const batch = db.batch();

   // Same submissionId = same document ID. Dobara bhejne par create() fail hota hai (atomic batch),
   // aur hum pehli inquiry ka reference wapas dete hain.
   const inquiries = db.collection(COLLECTIONS.inquiries);
   const inquiryRef = submissionId
     ? inquiries.doc(
         `s_${createHash("sha256").update(submissionId).digest("hex").slice(0, 24)}`,
       )
     : inquiries.doc();
   const reference = generateReference();

   batch.create(inquiryRef, {
     reference,
     type,
     source,
     ...fields,
     consentGiven: consent === true,
     consentAt: serverTimestamp(),
     status: "new",
     createdAt: serverTimestamp(),
     updatedAt: serverTimestamp(),
   });

  if (isBrief) {
    batch.set(db.collection(COLLECTIONS.leads).doc(inquiryRef.id), {
      inquiryId: inquiryRef.id,
      reference,
      source,
      name: fields.name,
      email: fields.email,
      emailLower: String(fields.email).toLowerCase(),
      businessType: fields.businessType,
      service: fields.service,
      planSlug: fields.planSlug || null,
      budget: fields.budget,
      timeline: fields.timeline,
      contactMethod: fields.contactMethod,
      aiSummary: fields.aiSummary ?? null,
      aiEstimate: fields.aiEstimate ?? null,
      status: LEAD_STATUS.NEW,
      priority: "medium",
      followUpAt: null,
      statusHistory: [
        { status: LEAD_STATUS.NEW, at: Timestamp.now(), by: "system" },
      ],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  const notification = buildNotification({
    type: isAi
      ? NOTIFICATION_TYPES.NEW_AI_LEAD
      : isBrief
        ? NOTIFICATION_TYPES.NEW_PROJECT_BRIEF
        : NOTIFICATION_TYPES.NEW_INQUIRY,
    entityId: inquiryRef.id,
    title: isAi
      ? "New AI-qualified lead"
      : isBrief
        ? "New project brief"
        : "New contact message",
    body: `${fields.name} (${fields.email}) · ${reference}`,
    link: isBrief ? `/admin/leads/${inquiryRef.id}` : "/admin/messages",
  });
  batch.set(
    db.collection(COLLECTIONS.notifications).doc(notification.id),
    notification.data,
  );

  batch.set(db.collection(COLLECTIONS.activityLogs).doc(), {
    action: isBrief ? "project_brief.created" : "contact_message.created",
    entityType: isBrief ? "lead" : "inquiry",
    entityId: inquiryRef.id,
    actor: { type: "public" },
    meta: { source },
    createdAt: serverTimestamp(),
  });

   try {
     await batch.commit();
   } catch (error) {
     const alreadyExists =
       error?.code === 6 || error?.code === "already-exists";
     if (submissionId && alreadyExists) {
       const existing = await inquiryRef.get();
       if (existing.exists) {
         return {
           id: inquiryRef.id,
           reference: existing.data().reference,
           duplicate: true,
         };
       }
     }
     throw error;
   }

   return { id: inquiryRef.id, reference };

}
