import "server-only";

import { randomUUID } from "node:crypto";

import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { COLLECTIONS } from "@/constants/collections";
import { canTransition } from "@/constants/lead-status";
import { getAdminDb } from "@/lib/firebase/admin";
import { serializeDoc, serverTimestamp } from "@/lib/firebase/firestore";
import { NotFoundError, TransitionError } from "@/lib/utils/errors";
import { logActivity } from "@/services/activity.service";
import { LEAD_STATUS_LABELS } from "@/constants/lead-status";
import {
  buildNotification,
  NOTIFICATION_TYPES,
} from "@/lib/notifications/notification-service";
import { runBulk } from "@/lib/utils/bulk";
import { parseLeadSearch } from "@/lib/leads/search";
export const LEADS_PAGE_SIZE = 25;
const EXPORT_LIMIT = 2000;

export async function listLeads({
  status = null,
  after = null,
  limit = LEADS_PAGE_SIZE,
} = {}) {
  const db = getAdminDb();
  let query = db.collection(COLLECTIONS.leads);

  if (status) query = query.where("status", "==", status);
  query = query.orderBy("createdAt", "desc");

  if (after) {
    const cursor = await db.collection(COLLECTIONS.leads).doc(after).get();
    if (cursor.exists) query = query.startAfter(cursor);
  }

  // Ek extra document: isse pata chalta hai agla page hai ya nahi.
  const snapshot = await query.limit(limit + 1).get();
  const leads = snapshot.docs.slice(0, limit).map(serializeDoc);

  return {
    leads,
    nextCursor: snapshot.docs.length > limit ? leads.at(-1).id : null,
  };
}

export async function getLeadDetail(id) {
  const db = getAdminDb();
  const [leadSnap, inquirySnap] = await Promise.all([
    db.collection(COLLECTIONS.leads).doc(id).get(),
    db.collection(COLLECTIONS.inquiries).doc(id).get(),
  ]);

  const lead = serializeDoc(leadSnap);
  if (!lead) return null;

  return { lead, inquiry: serializeDoc(inquirySnap) };
}

/** Status transition transaction ke andar enforce hota hai, taake race condition na ho. */
/** Status transition transaction ke andar enforce hota hai, taake race condition na ho. */
export async function updateLead(id, patch, admin) {
  const db = getAdminDb();
  const ref = db.collection(COLLECTIONS.leads).doc(id);
  const actorName = admin.name ?? admin.email ?? "Admin";

  await db.runTransaction(async (tx) => {
    const snapshot = await tx.get(ref);
    if (!snapshot.exists) throw new NotFoundError("Lead not found.");

    const current = snapshot.data();
    const update = { updatedAt: serverTimestamp() };

    if (patch.status && patch.status !== current.status) {
      if (!canTransition(current.status, patch.status)) {
        throw new TransitionError(`Cannot move a lead from "${current.status}" to "${patch.status}".`);
      }
      update.status = patch.status;
      update.statusHistory = FieldValue.arrayUnion({
        status: patch.status,
        at: Timestamp.now(),
        by: admin.uid,
        byName: actorName,
      });

      // Notification isi transaction ma: status aur notification dono saath save hote hain ya dono nahi.
      const notification = buildNotification({
        type: NOTIFICATION_TYPES.LEAD_STATUS_CHANGED,
        entityId: id,
        title: "Lead status changed",
        body: `${actorName} moved ${current.name} (${current.reference}) to ${LEAD_STATUS_LABELS[patch.status]}`,
        link: `/admin/leads/${id}`,
      });
      tx.set(db.collection(COLLECTIONS.notifications).doc(), notification.data);
    }

    if (patch.priority) update.priority = patch.priority;

    if (patch.followUpAt !== undefined) {
      update.followUpAt = patch.followUpAt ? Timestamp.fromDate(new Date(patch.followUpAt)) : null;
      update.followUpReminded = false; // Naya date = naya reminder.
    }

    tx.update(ref, update);
  });

  await logActivity({
    action: patch.status ? "lead.status_changed" : "lead.updated",
    entityType: "lead",
    entityId: id,
    admin,
    meta: patch.status ? { to: patch.status } : null,
  });
}

export async function addLeadNote(id, text, admin) {
  const ref = getAdminDb().collection(COLLECTIONS.leads).doc(id);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new NotFoundError("Lead not found.");

  await ref.update({
    notes: FieldValue.arrayUnion({
      id: randomUUID(),
      text,
      authorUid: admin.uid,
      authorName: admin.name ?? admin.email ?? "Admin",
      at: Timestamp.now(),
    }),
    updatedAt: serverTimestamp(),
  });

  await logActivity({
    action: "lead.note_added",
    entityType: "lead",
    entityId: id,
    admin,
  });
}

export async function exportLeads(admin) {
  const snapshot = await getAdminDb()
    .collection(COLLECTIONS.leads)
    .orderBy("createdAt", "desc")
    .limit(EXPORT_LIMIT)
    .get();

  await logActivity({
    action: "leads.exported",
    entityType: "lead",
    admin,
    meta: { count: snapshot.size },
  });

  return snapshot.docs.map(serializeDoc);
}
/** Reference (exact) ya email-prefix se search. Naam se search Firestore ma mumkin nahi. */
export async function searchLeads(term, { status = null } = {}) {
  const parsed = parseLeadSearch(term);
  if (!parsed) return [];

  const collection = getAdminDb().collection(COLLECTIONS.leads);
  const query =
    parsed.op === "eq"
      ? collection.where(parsed.field, "==", parsed.value)
      : collection.where(parsed.field, ">=", parsed.value).where(parsed.field, "<", `${parsed.value}\uf8ff`);

  const snapshot = await query.limit(LEADS_PAGE_SIZE).get();

  // Status filter memory ma lagta hai (composite index se bachne ke liye). Max 25 records hain.
  return snapshot.docs
    .map(serializeDoc)
    .filter((lead) => !status || lead.status === status)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

/** Har lead ka transition rule alag se lagta hai (updateLead). Na-mumkin transitions skip hoti hain. */
export async function bulkUpdateLeadStatus(ids, status, admin) {
  const summary = await runBulk(ids, (id) => updateLead(id, { status }, admin));

  await logActivity({
    action: "leads.bulk_status",
    entityType: "lead",
    admin,
    meta: { to: status, ...summary },
  });

  return summary;
}