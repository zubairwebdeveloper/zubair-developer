import Link from "next/link";

import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { Section } from "@/components/shared/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/button";
import { getFaqs } from "@/services/content.service";

const PREVIEW_LIMIT = 5;

/**
 * FaqPreview
 *
 * @param {number} [limit]         How many questions to show on this page.
 * @param {string} [allHref]       The full FAQ page.
 * @param {string} [contactHref]   Where "Discuss your project" goes.
 */
export async function FaqPreview({
  limit = PREVIEW_LIMIT,
  allHref = "/faq",
  contactHref = "/contact",
}) {
  let faqs = [];
  try {
    faqs = await getFaqs();
  } catch (error) {
    // A failed FAQ should not break the whole page, so skip the section.
    console.error("[faq-preview] failed to load FAQs:", error);
  }

  // Nothing to show means no empty section on the page.
  if (!faqs || faqs.length === 0) return null;

  const preview = faqs.slice(0, limit);
  const hasMore = faqs.length > preview.length;

  return (
    <Section className="bg-muted/40">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16">
        <div className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
          <SectionHeading eyebrow="FAQ" title="Common questions" />
          <p className="max-w-prose text-pretty leading-relaxed text-muted-foreground">
            Quick answers to what clients usually ask before we start working
            together.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {hasMore ? (
              <Button  variant="outline" size="lg">
                <Link href={allHref}>View all {faqs.length} questions</Link>
              </Button>
            ) : null}
            <Button  size="lg">
              <Link href={contactHref}>Discuss your project</Link>
            </Button>
          </div>
        </div>

        <div className="min-w-0 max-w-3xl">
          {/* The section already has its own call to action, so the accordion's is off. */}
          <FaqAccordion faqs={preview} showCta={false} />
        </div>
      </div>
    </Section>
  );
}
