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

  const entries = [
    ...staticRoutes.map((path) => ({
      url: new URL(path || "/", siteConfig.url).toString(),
    })),
    ...services
      .filter((service) => service?.slug)
      .map((service) => ({
        url: new URL(`/services/${service.slug}`, siteConfig.url).toString(),
      })),
    ...projects
      .filter((project) => project?.slug)
      .map((project) => ({
        url: new URL(`/projects/${project.slug}`, siteConfig.url).toString(),
      })),
    ...posts
      .filter((post) => post?.slug)
      .map((post) => ({
        url: new URL(`/blog/${post.slug}`, siteConfig.url).toString(),
        ...(post.publishedAt ? { lastModified: new Date(post.publishedAt) } : {}),
      })),
  ];

  return [...new Map(entries.map((entry) => [entry.url, entry])).values()];
}
