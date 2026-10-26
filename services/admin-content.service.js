import "server-only";

import { getAdminDb } from "@/lib/firebase/admin";
import { serializeDoc, serverTimestamp } from "@/lib/firebase/firestore";
import { revalidateContent } from "@/lib/admin/revalidate";
import { NotFoundError } from "@/lib/utils/errors";
import { logActivity } from "@/services/activity.service";

const MAX_SLUG_ATTEMPTS = 20;
const isAlreadyExists = (error) =>
  error?.code === 6 || error?.code === "already-exists";

export async function listContent(config, { limit = 100 } = {}) {
  const snapshot = await getAdminDb()
    .collection(config.collection)
    .orderBy("updatedAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map(serializeDoc);
}

export async function createContent(config, data, admin) {
  const collection = getAdminDb().collection(config.collection);
  const base = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: admin.uid,
    updatedBy: admin.uid,
    ...(data.status === "published" ? { publishedAt: serverTimestamp() } : {}),
  };

  let id;

  if (config.slugFrom) {
    const baseSlug = config.slugFrom(data);

    for (let attempt = 1; attempt <= MAX_SLUG_ATTEMPTS; attempt += 1) {
      const candidate = attempt === 1 ? baseSlug : `${baseSlug}-${attempt}`;
      try {
        await collection.doc(candidate).create({ ...base, slug: candidate });
        id = candidate;
        break;
      } catch (error) {
        if (!isAlreadyExists(error)) throw error;
      }
    }

    if (!id) throw new Error("Could not generate a unique slug.");
  } else {
    const ref = collection.doc();
    await ref.set(base);
    id = ref.id;
  }

  await logActivity({
    action: `${config.resource}.created`,
    entityType: config.resource,
    entityId: id,
    admin,
  });
  revalidateContent(config.collection);

  return { id };
}

export async function updateContent(config, id, patch, admin) {
  const ref = getAdminDb().collection(config.collection).doc(id);
  const snapshot = await ref.get();
  if (!snapshot.exists)
    throw new NotFoundError(`${config.label} item not found.`);

  const update = {
    ...patch,
    updatedAt: serverTimestamp(),
    updatedBy: admin.uid,
  };
  if (patch.status === "published" && snapshot.data().status !== "published") {
    update.publishedAt = serverTimestamp();
  }

  await ref.update(update);

  await logActivity({
    action: patch.status
      ? `${config.resource}.${patch.status}`
      : `${config.resource}.updated`,
    entityType: config.resource,
    entityId: id,
    admin,
  });
  revalidateContent(config.collection);
}

export async function archiveContent(config, id, admin) {
  await updateContent(config, id, { status: "archived" }, admin);
}
export async function bulkSetStatus(config, ids, status, admin) {
  const db = getAdminDb();
  const refs = [...new Set(ids)].map((id) =>
    db.collection(config.collection).doc(id),
  );
  const snapshots = await db.getAll(...refs);

  const batch = db.batch();
  let count = 0;

  snapshots.forEach((snapshot) => {
    if (!snapshot.exists) return;

    const update = {
      status,
      updatedAt: serverTimestamp(),
      updatedBy: admin.uid,
    };
    if (status === "published" && snapshot.data().status !== "published") {
      update.publishedAt = serverTimestamp();
    }

    batch.update(snapshot.ref, update);
    count += 1;
  });

  if (count === 0) throw new NotFoundError("None of the selected items exist.");

  await batch.commit();
  await logActivity({
    action: `${config.resource}.bulk_${status}`,
    entityType: config.resource,
    admin,
    meta: { count },
  });
  revalidateContent(config.collection);

  return count;
}