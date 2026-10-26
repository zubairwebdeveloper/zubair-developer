import "server-only";

import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { COLLECTIONS } from "@/constants/collections";
import { getAdminDb } from "@/lib/firebase/admin";
import { serializeDoc } from "@/lib/firebase/firestore";
import { logActivity } from "@/services/activity.service";

const DAY_MS = 86_400_000;
const PAGE_SIZE = 20;

const collection = () => getAdminDb().collection(COLLECTIONS.aiConversations);

/** Sirf tab chalta hai jab admin ne "Store conversations" ON kiya ho. */
export async function saveExchange({
  sessionId,
  userText,
  assistantText,
  retentionDays,
}) {
  const now = Timestamp.now();

  await collection()
    .doc(sessionId)
    .set(
      {
        updatedAt: FieldValue.serverTimestamp(),
        // Firestore TTL policy isi field par lagti hai.
        expiresAt: Timestamp.fromMillis(Date.now() + retentionDays * DAY_MS),
        messages: FieldValue.arrayUnion(
          { role: "user", content: userText, at: now },
          { role: "assistant", content: assistantText, at: now },
        ),
      },
      { merge: true },
    );
}

export async function listConversations({
  after = null,
  limit = PAGE_SIZE,
} = {}) {
  let query = collection().orderBy("updatedAt", "desc");

  if (after) {
    const cursor = await collection().doc(after).get();
    if (cursor.exists) query = query.startAfter(cursor);
  }

  const snapshot = await query.limit(limit + 1).get();
  const conversations = snapshot.docs.slice(0, limit).map((doc) => {
    const data = serializeDoc(doc);
    return {
      id: data.id,
      updatedAt: data.updatedAt,
      expiresAt: data.expiresAt,
      count: data.messages?.length ?? 0,
      preview:
        data.messages
          ?.find((message) => message.role === "user")
          ?.content?.slice(0, 120) ?? "",
    };
  });

  return {
    conversations,
    nextCursor: snapshot.docs.length > limit ? conversations.at(-1).id : null,
  };
}

/** Conversation personal data ho sakti hai, is liye har dekhna audit log ma darj hota hai. */
export async function getConversation(id, admin) {
  const snapshot = await collection().doc(id).get();
  if (!snapshot.exists) return null;

  await logActivity({
    action: "ai.conversation_viewed",
    entityType: "ai_conversation",
    entityId: id,
    admin,
  });
  return serializeDoc(snapshot);
}

export async function deleteConversation(id, admin) {
  await collection().doc(id).delete();
  await logActivity({
    action: "ai.conversation_deleted",
    entityType: "ai_conversation",
    entityId: id,
    admin,
  });
}
