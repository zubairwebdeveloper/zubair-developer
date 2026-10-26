import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { BlogExplorer } from "@/components/blog/BlogExplorer";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { Section } from "@/components/shared/Section";
import { getPosts } from "@/services/content.service";

export const metadata = {
  title: "Blog",
  description: "Articles and technical insights.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title="Articles & insights"
        description="Practical notes on web development, SaaS and AI automation."
      />

      <Section>
        {posts.length === 0 ? (
          <EmptyState
            title="No articles yet"
            description="Articles will appear here once they are published."
            action={{ label: "Back to home", href: "/" }}
          />
        ) : (
          <BlogExplorer posts={posts} />
        )}
      </Section>

      {posts.length > 0 ? (
        <Section className="bg-muted/40">
          <Reveal direction="up">
            <div className="bg-foreground text-background relative isolate overflow-hidden rounded-3xl p-8 sm:p-10">
              <div
                aria-hidden="true"
                className="bg-primary/30 pointer-events-none absolute -top-20 -right-20 -z-10 size-64 rounded-full blur-3xl"
              />
              <div className="flex max-w-2xl flex-col gap-3">
                <h2 className="text-balance font-heading text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.15] font-semibold tracking-tight">
                  Have a project in mind?
                </h2>
                <p className="text-background/75 leading-7">
                  Tell me your goal and timeline, and I will reply with clear
                  next steps.
                </p>
                <Link
                  href="/contact"
                  className="group bg-primary text-primary-foreground focus-visible:ring-primary focus-visible:ring-offset-foreground mt-2 inline-flex min-h-11 w-fit items-center gap-2 rounded-lg px-5 text-sm font-medium outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 motion-safe:active:scale-[0.98]"
                >
                  Discuss Your Project
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
                  />
                </Link>
              </div>
            </div>
          </Reveal>
        </Section>
      ) : null}
    </>
  );
}
