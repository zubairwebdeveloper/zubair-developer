import "server-only";

import { Timestamp } from "firebase-admin/firestore";

import { COLLECTIONS } from "@/constants/collections";
import { DISPLAY_TIME_ZONE } from "@/constants/display";
import { CLOSED_LEAD_STATUSES, LEAD_STATUS } from "@/constants/lead-status";
import { getAdminDb } from "@/lib/firebase/admin";
import { serializeDoc } from "@/lib/firebase/firestore";

export const RANGES = { "7d": 7, "30d": 30, "90d": 90 };
export const DEFAULT_RANGE = "30d";

const LEAD_SCAN_LIMIT = 1000;
const DAY_MS = 86_400_000;
const MIN_LEADS_FOR_CONVERSION = 10;

const dayKey = (date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: DISPLAY_TIME_ZONE }).format(
    date,
  );

async function countOf(query) {
  const snapshot = await query.count().get();
  return snapshot.data().count;
}

export async function getOverview({
  range = DEFAULT_RANGE,
  includeActivity = false,
} = {}) {
  const days = RANGES[range] ?? RANGES[DEFAULT_RANGE];
  const now = Date.now();
  const since = Timestamp.fromMillis(now - days * DAY_MS);

  const db = getAdminDb();
  const leads = db.collection(COLLECTIONS.leads);
  const statuses = Object.values(LEAD_STATUS);

  const [
    rangeSnap,
    inquiriesInRange,
    unread,
    newNow,
    publishedProjects,
    recentSnap,
    dueSnap,
    activitySnap,
  ] = await Promise.all([
    leads
      .where("createdAt", ">=", since)
      .select("status", "createdAt")
      .limit(LEAD_SCAN_LIMIT)
      .get(),
    countOf(
      db.collection(COLLECTIONS.inquiries).where("createdAt", ">=", since),
    ),
    countOf(
      db.collection(COLLECTIONS.notifications).where("read", "==", false),
    ),
    countOf(leads.where("status", "==", LEAD_STATUS.NEW)),
    countOf(
      db.collection(COLLECTIONS.projects).where("status", "==", "published"),
    ),
    leads.orderBy("createdAt", "desc").limit(5).get(),
    leads
      .where("followUpAt", "<=", Timestamp.now())
      .orderBy("followUpAt", "asc")
      .limit(20)
      .get(),
    includeActivity
      ? db
          .collection(COLLECTIONS.activityLogs)
          .orderBy("createdAt", "desc")
          .limit(6)
          .get()
      : null,
  ]);

  const byStatus = Object.fromEntries(statuses.map((status) => [status, 0]));
  const perDay = new Map();

  rangeSnap.docs.forEach((doc) => {
    const data = doc.data();
    byStatus[data.status] = (byStatus[data.status] ?? 0) + 1;
    const key = dayKey(data.createdAt.toDate());
    perDay.set(key, (perDay.get(key) ?? 0) + 1);
  });

  // days + 1 din: rolling window ka pehla adhoora din bhi chart ma aaye.
  const series = Array.from({ length: days + 1 }, (_, index) => {
    const key = dayKey(new Date(now - (days - index) * DAY_MS));
    return { date: key, label: key.slice(5), leads: perDay.get(key) ?? 0 };
  });

  const totalInRange = rangeSnap.size;

  return {
    days,
    totalInRange,
    truncated: totalInRange >= LEAD_SCAN_LIMIT,
    inquiriesInRange,
    byStatus,
    series,
    // Conversion sirf tab dikhate hain jab itna data ho ke percent ka matlab banay.
    conversionPercent:
      totalInRange >= MIN_LEADS_FOR_CONVERSION
        ? Math.round((byStatus.won / totalInRange) * 100)
        : null,
    newLeadsNow: newNow,
    unreadNotifications: unread,
    publishedProjects,
    recentLeads: recentSnap.docs.map(serializeDoc),
    dueFollowUps: dueSnap.docs
      .map(serializeDoc)
      .filter((lead) => !CLOSED_LEAD_STATUSES.includes(lead.status))
      .slice(0, 5),
    recentActivity: activitySnap ? activitySnap.docs.map(serializeDoc) : [],
  };
}
