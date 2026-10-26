import { renderOg } from "@/lib/og";
import { getProjectBySlug } from "@/services/projects.service";

export const alt = "Project case study";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  return renderOg({
    eyebrow: project?.category ?? "Project",
    title: project?.title ?? "Case study",
  });
}
