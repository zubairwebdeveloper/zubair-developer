import { CountUp } from "@/components/home/CountUp";
import { buildPublicStats } from "@/lib/home/stats";
import { getPosts } from "@/services/content.service";
import { getPublishedProjects } from "@/services/projects.service";
import { getServices } from "@/services/services.service";

export async function StatsStrip() {
  const [projects, services, posts] = await Promise.all([
    getPublishedProjects(),
    getServices(),
    getPosts(),
  ]);
  const stats = buildPublicStats({
    projectCount: Array.isArray(projects) ? projects.length : 0,
    serviceCount: Array.isArray(services) ? services.length : 0,
    postCount: Array.isArray(posts) ? posts.length : 0,
  });

  if (stats.length === 0) return null;

  return (
    <section
      aria-label="Published work and content"
      className="border-y border-border/60 bg-muted/40 py-8 sm:py-10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <dl
          className={`mx-auto grid max-w-3xl gap-6 text-center ${
            stats.length === 1
              ? "sm:grid-cols-1"
              : stats.length === 2
                ? "sm:grid-cols-2"
                : "sm:grid-cols-3"
          }`}
        >
          {stats.map((stat) => (
            <div key={stat.id} className="flex flex-col gap-1">
              <dd
                aria-label={`${stat.value} ${stat.label}`}
                className="order-1 font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
              >
                <CountUp value={stat.value} />
              </dd>
              <dt className="order-2 text-sm font-medium text-muted-foreground">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
