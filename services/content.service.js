import {
  seedFaqs,
  seedProcessSteps,
  techStack as seedTechStack,
} from "@/config/content.seed";
import { COLLECTIONS } from "@/constants/collections";
import { getPublished } from "@/lib/firebase/published";
import { getSiteSettings } from "@/services/settingsService";

export async function getFaqs() {
  return getPublished(COLLECTIONS.faqs, seedFaqs);
}

export async function getProcessSteps() {
  const { processSteps } = await getSiteSettings();
  return processSteps?.length ? processSteps : seedProcessSteps;
}

export async function getTechStack() {
  const { techStack } = await getSiteSettings();
  return techStack?.length ? techStack : seedTechStack;
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
export async function getTestimonials() {
  return getPublished(COLLECTIONS.testimonials, []);
}

export async function getSkills() {
  return getPublished(COLLECTIONS.skills, []);
}

export async function getExperience() {
  return getPublished(COLLECTIONS.experience, []);
}

const time = (value) => (value ? Date.parse(value) : 0);

/** Naye posts pehle. */
export async function getPosts() {
  const posts = await getPublished(COLLECTIONS.blogPosts, []);
  return [...posts].sort((a, b) => time(b.publishedAt) - time(a.publishedAt));
}

export async function getPostBySlug(slug) {
  const posts = await getPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}
