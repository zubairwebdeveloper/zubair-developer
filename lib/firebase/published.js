import "server-only";

import { unstable_cache } from "next/cache";

import { getAdminDb } from "@/lib/firebase/admin";
import { serializeDoc } from "@/lib/firebase/firestore";
import { NotConfiguredError } from "@/lib/utils/errors";

const MAX_DOCS = 100;

async function loadPublished(collectionName, fallback) {
  try {
    const snapshot = await getAdminDb()
      .collection(collectionName)
      .where("status", "==", "published")
      .limit(MAX_DOCS)
      .get();

    return snapshot.docs
      .map(serializeDoc)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } catch (error) {
    // Firebase configure nahi ya down hai: site chalti rahe, is liye fallback.
    if (!(error instanceof NotConfiguredError)) {
      console.error(`[firestore] failed to load "${collectionName}":`, error);
    }
    return fallback;
  }
}

export function getPublished(collectionName, fallback = []) {
  return unstable_cache(
    () => loadPublished(collectionName, fallback),
    ["published", collectionName],
    { revalidate: 300, tags: [`content:${collectionName}`] },
  )();
}
