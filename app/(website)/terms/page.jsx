import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

import { LegalToc } from "@/components/legal/LegalToc";
import { PrintButton } from "@/components/legal/PrintButton";
import { PageHeader } from "@/components/shared/PageHeader";
import { Reveal } from "@/components/shared/Reveal";
import { Section } from "@/components/shared/Section";

export const metadata = {
  title: "Terms of Service",
  description:
    "The terms that apply to this website and to project work agreed through a written proposal.",
  alternates: { canonical: "/terms" },
};

// Set to a string such as "1 January 2027" once the terms are reviewed.
// Nothing is shown while this is null.
const LAST_UPDATED = null;

// Set to false once the terms have been reviewed and approved.
const SHOW_DRAFT_NOTICE = true;

// Editable content. This is general starter wording only. Have it reviewed
// and completed by a qualified professional before publishing.
const TERMS_SECTIONS = [
  {
    id: "agreement",
    title: "Agreement to these terms",
    paragraphs: [
      "By using this website or requesting services through it, you agree to these terms. If you do not agree, please do not use the website or request services.",
    ],
  },
  {
    id: "prices",
    title: "Prices and quotes",
    paragraphs: [
      "Listed prices are starting prices. Final scope, price and timeline are agreed in a written proposal before work begins.",
      "A price shown on this website is not an offer to work at that price until a written proposal has been agreed.",
    ],
  },
  {
    id: "scope",
    title: "Scope of work and changes",
    paragraphs: [
      "Work is limited to what is described in the agreed written proposal.",
      "If you want something that falls outside that scope, it should be discussed and agreed in writing before it is carried out.",
    ],
  },
  {
    id: "payment",
    title: "Payment",
    paragraphs: [
      "Payment schedule, accepted methods and invoicing details are set out in the written proposal for each project.",
    ],
  },
  {
    id: "ownership",
    title: "Ownership and third-party tools",
    paragraphs: [
      "Ownership of deliverables, and any licences that apply to third-party tools, libraries or services used in a project, are set out in the written proposal.",
    ],
  },
  {
    id: "responsibilities",
    title: "Your responsibilities",
    paragraphs: [
      "To keep a project moving, you agree to provide the content, access and feedback that the work needs in a reasonable time, and to give accurate information about your requirements.",
    ],
  },
  {
    id: "website-use",
    title: "Use of this website",
    paragraphs: [
      "Use of this website is subject to applicable law.",
      "Please do not misuse the website, attempt to disrupt it, or try to gain access to parts of it that are not meant for you.",
    ],
  },
  {
    id: "third-party",
    title: "Third-party links and services",
    paragraphs: [
      "This website may link to other websites and services, such as live project examples or code repositories. Those are controlled by their owners and have their own terms.",
    ],
  },
  {
    id: "changes",
    title: "Changes to these terms",
    paragraphs: [
      "These terms may be updated from time to time. The version published on this page is the one that applies when you use the website.",
    ],
  },
];

export default function TermsPage() {
  const tocItems = TERMS_SECTIONS.map(({ id, title }) => ({ id, title }));

  return (
    <>
      <PageHeader eyebrow="Legal" title="Terms of Service" />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14">
          <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start print:hidden">
            <LegalToc items={tocItems} />
            <PrintButton />
          </aside>

          <div className="flex min-w-0 max-w-3xl flex-col gap-10 sm:gap-12">
            {SHOW_DRAFT_NOTICE ? (
              <div
                role="note"
                className="rounded-2xl border border-border bg-muted/50 p-4 text-sm leading-relaxed text-muted-foreground"
              >
                This is a starter draft and must be reviewed before publication.
              </div>
            ) : null}

            {LAST_UPDATED ? (
              <p className="text-sm text-muted-foreground">
                Last updated: {LAST_UPDATED}
              </p>
            ) : null}

            {TERMS_SECTIONS.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                aria-labelledby={`${section.id}-title`}
                className="scroll-mt-28"
              >
                <Reveal>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="text-metric inline-flex h-9 min-w-11 items-center justify-center rounded-lg bg-primary/10 px-2.5 text-sm text-brand ring-1 ring-inset ring-primary/20"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h2
                        id={`${section.id}-title`}
                        className="text-card-title text-foreground"
                      >
                        {section.title}
                      </h2>
                    </div>
                    <div className="flex max-w-prose flex-col gap-3">
                      {section.paragraphs.map((text) => (
                        <p
                          key={text}
                          className="text-base leading-relaxed text-muted-foreground"
                        >
                          {text}
                        </p>
                      ))}
                    </div>
                  </div>
                </Reveal>
              </section>
            ))}

            <Reveal>
              <div className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-6 sm:p-8 print:hidden">
                <h2 className="text-card-title text-foreground">
                  Questions about these terms?
                </h2>
                <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
                  If anything here is unclear, ask before you start a project.
                  It is easier to settle it up front.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-all duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-safe:active:scale-[0.98]"
                >
                  Contact Me
                  <FiArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>
    </>
  );
}
