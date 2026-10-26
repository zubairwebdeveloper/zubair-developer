import { COLLECTIONS } from "@/constants/collections";
import { getPublished } from "@/lib/firebase/published";

export async function getPublishedProjects() {
  return getPublished(COLLECTIONS.projects, []);
}

export async function getProjectBySlug(slug) {
  const projects = await getPublishedProjects();
  return projects.find((project) => project.slug === slug) ?? null;
}
