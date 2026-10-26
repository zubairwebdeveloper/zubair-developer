import { siteConfig } from "@/config/site";
import { getPosts } from "@/services/content.service";
import { getPublishedProjects } from "@/services/projects.service";
import { getServices } from "@/services/services.service";

export default async function sitemap() {
  const staticRoutes = [
    "",
    "/about",
    "/services",
    "/projects",
    "/pricing",
    "/process",
    "/blog",
    "/contact",
    "/hire-me",
    "/faq",
    "/privacy",
    "/terms",
  ];
  const [services, projects, posts] = await Promise.all([
    getServices(),
    getPublishedProjects(),
    getPosts(),
  ]);

  return [
    ...staticRoutes.map((path) => ({ url: `${siteConfig.url}${path}` })),
    ...services.map((s) => ({ url: `${siteConfig.url}/services/${s.slug}` })),
    ...projects.map((p) => ({ url: `${siteConfig.url}/projects/${p.slug}` })),
    ...posts.map((p) => ({
      url: `${siteConfig.url}/blog/${p.slug}`,
      lastModified: p.publishedAt,
    })),
  ];
}
