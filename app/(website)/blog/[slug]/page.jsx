import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, UserRound } from "lucide-react";

import { ArticleContents } from "@/components/blog/ArticleContents";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { Section } from "@/components/shared/Section";
import { siteConfig } from "@/config/site";
import { parseArticleContent } from "@/lib/blog/article-content";
import { formatDate } from "@/lib/utils/dates";
import { getPostBySlug, getPosts } from "@/services/content.service";

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt,
    },
  };
}

function getReadingMinutes(text) {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

const ARTICLE_ID = "post-content";

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([getPostBySlug(slug), getPosts()]);
  if (!post) notFound();

  const contentBlocks = parseArticleContent(post.content);
  const contents = contentBlocks
    .filter((block) => block.type === "heading" || block.type === "subheading")
    .map(({ id, title, type }) => ({ id, title, type }));

  const minutes = getReadingMinutes(post.content);
  const morePosts = allPosts
    .filter((item) => item.slug !== post.slug)
    .slice(0, 3);

  // SEO: structured data (sirf wahi fields jo post ma maujood hain)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    ...(post.coverImage?.startsWith("http") ? { image: post.coverImage } : {}),
    author: { "@type": "Person", name: siteConfig.name },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <ReadingProgress targetId={ARTICLE_ID} />

      <PageHeader
        eyebrow={formatDate(post.publishedAt)}
        title={post.title}
        description={post.excerpt}
      />

      <Section>
        <div className="flex w-full flex-col gap-8">
          {/* Meta + back */}
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <Link
              href="/blog"
              className="group text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex min-h-10 items-center gap-1.5 rounded-md text-sm underline-offset-4 outline-none transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none"
            >
              <ArrowLeft
                aria-hidden="true"
                className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5 motion-reduce:transition-none"
              />
              All posts
            </Link>

            <ul className="text-muted-foreground flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <li className="flex items-center gap-1.5">
                <UserRound aria-hidden="true" className="size-4" />
                {siteConfig.name}
              </li>
              <li className="flex items-center gap-1.5">
                <Clock aria-hidden="true" className="size-4" />
                {minutes} min read
              </li>
            </ul>
          </div>

          {post.coverImage ? (
            <Reveal direction="up">
              <div className="border-border relative aspect-video overflow-hidden rounded-2xl border">
                <Image
                  src={post.coverImage}
                  alt={post.coverAlt ?? ""}
                  fill
                  sizes="(min-width: 768px) 768px, 100vw"
                  className="object-cover"
                  priority
                />
              </div>
            </Reveal>
          ) : null}

          <div className="grid w-full max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
            <article id={ARTICLE_ID} className="flex min-w-0 flex-col gap-6">
              {contentBlocks.map((block, index) => {
                if (block.type === "heading") {
                  return (
                    <h2
                      key={block.id}
                      id={block.id}
                      className="scroll-mt-28 font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
                    >
                      {block.title}
                    </h2>
                  );
                }
                if (block.type === "subheading") {
                  return (
                    <h3
                      key={block.id}
                      id={block.id}
                      className="scroll-mt-28 font-heading text-xl font-semibold tracking-tight text-foreground"
                    >
                      {block.title}
                    </h3>
                  );
                }
                return (
                  <p
                    key={`paragraph-${index}`}
                    className={`text-body-lg max-w-[68ch] whitespace-pre-line leading-8 ${
                      index === 0 ? "text-foreground" : "text-foreground/85"
                    }`}
                  >
                    {block.text}
                  </p>
                );
              })}
            </article>
            <ArticleContents items={contents} />
          </div>

          {/* Share */}
          <div className="border-border flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium">Found this useful? Share it.</p>
            <ShareButtons title={post.title} />
          </div>

          {/* CTA */}
          <Reveal direction="up">
            <div className="bg-foreground text-background relative isolate overflow-hidden rounded-2xl p-6 sm:p-8">
              <div
                aria-hidden="true"
                className="bg-primary/30 pointer-events-none absolute -top-16 -right-16 -z-10 size-48 rounded-full blur-3xl"
              />
              <div className="flex flex-col gap-3">
                <h2 className="text-balance font-heading text-xl font-semibold tracking-tight sm:text-2xl">
                  Have a project in mind?
                </h2>
                <p className="text-background/75 max-w-xl leading-7">
                  Tell me your goal and timeline, and I will reply with clear
                  next steps.
                </p>
                <Link
                  href="/contact"
                  className="group bg-primary text-primary-foreground focus-visible:ring-primary focus-visible:ring-offset-foreground mt-1 inline-flex min-h-11 w-fit items-center gap-2 rounded-lg px-5 text-sm font-medium outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 motion-safe:active:scale-[0.98]"
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
        </div>
      </Section>

      {/* More posts */}
      {morePosts.length > 0 ? (
        <Section className="bg-muted/40">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-section-title">More from the blog</h2>
            <Link
              href="/blog"
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-md text-sm underline-offset-4 outline-none hover:underline focus-visible:ring-2"
            >
              View all
            </Link>
          </div>
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            {morePosts.map((item) => (
              <li key={item.slug}>
                <Reveal direction="up" className="h-full">
                  <Link
                    href={`/blog/${item.slug}`}
                    className="group border-border bg-card hover:border-primary/40 focus-visible:ring-ring flex h-full flex-col gap-3 rounded-2xl border p-5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none"
                  >
                    <p className="text-muted-foreground text-xs">
                      {formatDate(item.publishedAt)}
                    </p>
                    <h3 className="text-card-title text-balance">
                      {item.title}
                    </h3>
                    {item.excerpt ? (
                      <p className="text-muted-foreground line-clamp-3 text-sm leading-6">
                        {item.excerpt}
                      </p>
                    ) : null}
                    <span className="text-primary mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium">
                      Read post
                      <ArrowRight
                        aria-hidden="true"
                        className="size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                      />
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  );
}
