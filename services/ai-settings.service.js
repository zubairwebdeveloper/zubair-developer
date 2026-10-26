import "server-only";

import { randomUUID } from "node:crypto";
import { unstable_cache } from "next/cache";

import { DEFAULT_AI_SETTINGS } from "@/config/ai-defaults";
import { COLLECTIONS } from "@/constants/collections";
import { revalidateAi } from "@/lib/admin/revalidate";
import { isGeminiConfigured } from "@/lib/ai/gemini";
import { getAdminDb } from "@/lib/firebase/admin";
import { serializeDoc, serverTimestamp } from "@/lib/firebase/firestore";
import { logActivity } from "@/services/activity.service";
import { prepareRestore } from "@/lib/ai/versions";
import {
  ConflictError,
  NotConfiguredError,
  NotFoundError,
} from "@/lib/utils/errors";
const configRef = () =>
  getAdminDb().collection(COLLECTIONS.aiSettings).doc("config");

/** Sirf known keys: stored doc ma koi extra field prompt tak nahi pahunchti. */
function mergeWithDefaults(stored = {}) {
  return Object.fromEntries(
    Object.keys(DEFAULT_AI_SETTINGS).map((key) => [
      key,
      stored[key] ?? DEFAULT_AI_SETTINGS[key],
    ]),
  );
}

async function loadStored() {
  try {
    return serializeDoc(await configRef().get()) ?? {};
  } catch (error) {
    if (!(error instanceof NotConfiguredError))
      console.error("[ai] failed to load settings:", error);
    return {};
  }
}

const getCachedStored = unstable_cache(loadStored, ["ai-settings"], {
  revalidate: 300,
  tags: ["ai:config"],
});

/** Public chat ke liye (cached). Load fail ho to default (AI band). */
export async function getAiSettings() {
  return mergeWithDefaults(await getCachedStored());
}

/** Admin form ke liye (taaza). */
export async function getAiSettingsFresh() {
  const snapshot = await configRef().get();
  return mergeWithDefaults(serializeDoc(snapshot) ?? {});
}

/** Widget ko sirf safe, public fields milte hain. AI off ho ya Gemini configured na ho to null. */
export async function getPublicAssistantConfig() {
  const settings = await getAiSettings();
  if (!settings.enabled || !isGeminiConfigured()) return null;

  return {
    name: settings.name,
    welcomeMessage: settings.welcomeMessage,
    suggestedPrompts: settings.suggestedPrompts,
    handoffMessage: settings.handoffMessage,
    storesConversations: settings.storeConversations,
  };
}

/** Har save naya version banata hai aur uska snapshot subcollection ma rakhta hai. */
export async function saveAiSettings(data, admin) {
  const db = getAdminDb();
  const ref = configRef();
  let version = 0;

  await db.runTransaction(async (tx) => {
    const snapshot = await tx.get(ref);
    version = (snapshot.exists ? (snapshot.data().version ?? 0) : 0) + 1;

    tx.set(ref, {
      ...data,
      version,
      updatedAt: serverTimestamp(),
      updatedBy: admin.uid,
    });
    tx.set(ref.collection("versions").doc(String(version)), {
      ...data,
      version,
      savedAt: serverTimestamp(),
      savedBy: admin.uid,
      savedByName: admin.name ?? admin.email ?? "Admin",
    });
  });

  await logActivity({
    action: "ai.settings_updated",
    entityType: "ai",
    entityId: "config",
    admin,
    meta: { version, enabled: data.enabled },
  });
  revalidateAi();

  return { version };
}

export async function listAiVersions(limit = 10) {
  const snapshot = await configRef()
    .collection("versions")
    .orderBy("version", "desc")
    .limit(limit)
    .get();
  return snapshot.docs.map(serializeDoc).map((entry) => ({
    id: entry.id ?? randomUUID(),
    version: entry.version,
    enabled: entry.enabled,
    savedAt: entry.savedAt,
    savedByName: entry.savedByName,
  }));
}
/**
 * Purane version ko naye version ke taur par save karta hai (history kabhi nahi mitti).
 * `enabled` maujooda value hi rehti hai, taake restore se AI achanak ON ya OFF na ho.
 */
export async function restoreAiVersion(version, admin) {
  const snapshot = await configRef().collection("versions").doc(String(version)).get();
  if (!snapshot.exists) throw new NotFoundError("Version not found.");

  const current = await getAiSettingsFresh();
  const data = prepareRestore(serializeDoc(snapshot), current.enabled);
  if (!data) throw new ConflictError("This version is no longer valid and cannot be restored.");

  const result = await saveAiSettings(data, admin);
  await logActivity({
    action: "ai.settings_restored",
    entityType: "ai",
    entityId: "config",
    admin,
    meta: { from: version, to: result.version },
  });

  return result;
}