import "server-only";

import { randomBytes } from "node:crypto";

import { COLLECTIONS } from "@/constants/collections";
import { MAX_UPLOAD_BYTES } from "@/constants/media";
import { getAdminBucket, getAdminDb } from "@/lib/firebase/admin";
import { serializeDoc, serverTimestamp } from "@/lib/firebase/firestore";
import {
  ConflictError,
  InvalidFileError,
  NotFoundError,
} from "@/lib/utils/errors";
import { logActivity } from "@/services/activity.service";

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

/** File ki asli pehchan bytes se hoti hai, client ke bheje MIME type se nahi. */
function detectImageType(buffer) {
  if (
    buffer.length > 12 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return { contentType: "image/jpeg", ext: "jpg" };
  }
  if (buffer.length > 12 && buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
    return { contentType: "image/png", ext: "png" };
  }
  if (
    buffer.length > 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return { contentType: "image/webp", ext: "webp" };
  }
  return null;
}

const cleanName = (name) =>
  String(name ?? "")
    .replace(/[^\w.\- ]+/g, "")
    .trim()
    .slice(0, 100) || "image";

export async function listMedia({ limit = 60 } = {}) {
  const snapshot = await getAdminDb()
    .collection(COLLECTIONS.media)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map(serializeDoc);
}

export async function uploadMedia(file, admin) {
  if (file.size > MAX_UPLOAD_BYTES)
    throw new InvalidFileError("Image must be 4 MB or smaller.");

  const buffer = Buffer.from(await file.arrayBuffer());
  const type = detectImageType(buffer);
  if (!type)
    throw new InvalidFileError("Only JPEG, PNG or WebP images are allowed.");

  const id = randomBytes(8).toString("hex");
  const path = `public/media/${id}.${type.ext}`;
  const bucket = getAdminBucket();

  await bucket.file(path).save(buffer, {
    resumable: false,
    contentType: type.contentType,
    metadata: { cacheControl: "public, max-age=31536000, immutable" },
  });

  const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media`;

  const ref = getAdminDb().collection(COLLECTIONS.media).doc(id);
  await ref.set({
    name: cleanName(file.name),
    path,
    url,
    contentType: type.contentType,
    size: buffer.length,
    alt: "",
    uploadedBy: admin.uid,
    createdAt: serverTimestamp(),
  });

  await logActivity({
    action: "media.uploaded",
    entityType: "media",
    entityId: id,
    admin,
  });
  return serializeDoc(await ref.get());
}

export async function updateMediaAlt(id, alt, admin) {
  const ref = getAdminDb().collection(COLLECTIONS.media).doc(id);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new NotFoundError("Image not found.");

  await ref.update({ alt });
  await logActivity({
    action: "media.alt_updated",
    entityType: "media",
    entityId: id,
    admin,
  });
}

export async function deleteMedia(id, admin) {
  const db = getAdminDb();
  const ref = db.collection(COLLECTIONS.media).doc(id);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new NotFoundError("Image not found.");

  const media = snapshot.data();

  // Agar koi content isay use kar raha hai to delete nahi hone dete (toot-ti images se bachao).
  const [projects, posts] = await Promise.all([
    db
      .collection(COLLECTIONS.projects)
      .where("coverImage", "==", media.url)
      .limit(1)
      .get(),
    db
      .collection(COLLECTIONS.blogPosts)
      .where("coverImage", "==", media.url)
      .limit(1)
      .get(),
  ]);
  if (!projects.empty || !posts.empty) {
    throw new ConflictError(
      "This image is used by a project or post. Remove it there first.",
    );
  }

  await getAdminBucket().file(media.path).delete({ ignoreNotFound: true });
  await ref.delete();

  await logActivity({
    action: "media.deleted",
    entityType: "media",
    entityId: id,
    admin,
  });
}
