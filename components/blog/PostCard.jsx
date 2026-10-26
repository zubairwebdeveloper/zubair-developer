import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils/dates";

const MAX_VISIBLE_TAGS = 3;

// Safe machine-readable value for <time>; supports Date, string, Firestore Timestamp.
function toDateTime(value) {
  try {
    const date =
      typeof value?.toDate === "function" ? value.toDate() : new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  } catch {
    return undefined;
  }
}

export function PostCard({ post }) {
  const href = `/blog/${post.slug}`;
  const tags = post.tags ?? [];
  const visibleTags = tags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTagCount = tags.length - visibleTags.length;

  return (
    <Card className="group relative flex h-full flex-col gap-0 overflow-hidden rounded-2xl border-border/60 bg-card py-0 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/50 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="relative aspect-video overflow-hidden border-b border-border/60 bg-muted">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.coverAlt ?? ""}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex size-full items-center justify-center bg-gradient-to-br from-primary/15 via-primary/5 to-transparent"
          >
            <FileText className="size-10 text-primary/60" />
          </div>
        )}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none"
        />
      </div>

      <CardHeader className="gap-3 px-5 pt-5 pb-0 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <time dateTime={toDateTime(post.publishedAt)}>
            {formatDate(post.publishedAt)}
          </time>
          {post.readingTime ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden="true" />
              {post.readingTime}
            </span>
          ) : null}
        </div>

        <CardTitle className="text-card-title text-balance leading-snug tracking-tight">
          {/* Stretched link: the whole card is one accessible, clickable target */}
          <Link
            href={href}
            className="outline-none after:absolute after:inset-0 after:content-[''] group-hover:text-primary transition-colors duration-200"
          >
            {post.title}
          </Link>
        </CardTitle>

        <CardDescription className="line-clamp-3 leading-relaxed">
          {post.excerpt}
        </CardDescription>
      </CardHeader>

      {visibleTags.length ? (
        <CardContent className="flex flex-wrap gap-2 px-5 pt-4 sm:px-6">
          {visibleTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="rounded-full font-normal"
            >
              {tag}
            </Badge>
          ))}
          {hiddenTagCount > 0 ? (
            <Badge
              variant="outline"
              className="rounded-full font-normal text-muted-foreground"
              title={tags.slice(MAX_VISIBLE_TAGS).join(", ")}
            >
              +{hiddenTagCount}
            </Badge>
          ) : null}
        </CardContent>
      ) : null}

      <CardFooter className="mt-auto px-5 pt-5 pb-5 sm:px-6 sm:pb-6">
        <span
          aria-hidden="true"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
        >
          Read article
          <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0" />
        </span>
      </CardFooter>
    </Card>
  );
}
