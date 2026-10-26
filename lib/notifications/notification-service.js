import "server-only";

import { serverTimestamp } from "@/lib/firebase/firestore";

export const NOTIFICATION_TYPES = {
  NEW_INQUIRY: "new_inquiry",
  NEW_PROJECT_BRIEF: "new_project_brief",
  NEW_AI_LEAD: "new_ai_lead",
  FOLLOW_UP_DUE: "follow_up_due",
  LEAD_STATUS_CHANGED: "lead_status_changed",
};

/**
 * Notification document banata hai. ID deterministic hai (type + entity), isliye
 * agar same event dobara chale to duplicate notification nahi banta (idempotent).
 */
export function buildNotification({ type, entityId, title, body, link }) {
  return {
    id: `${type}_${entityId}`,
    data: {
      type,
      title,
      body,
      link,
      entityId,
      read: false,
      createdAt: serverTimestamp(),
    },
  };
}
