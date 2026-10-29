import Link from "next/link";
import { ArrowRight, ArrowUp, ArrowUpRight, Mail } from "lucide-react";

import { CopyEmailButton } from "@/components/layout/CopyEmailButton";
import { Container } from "@/components/shared/Container";
import { buttonVariants } from "@/components/ui/button";
import { footerNavigation, mainNavigation, siteConfig } from "@/config/site";
import { getPublicProfile, SocialRow } from "@/lib/profile/public-profile";
import { cn } from "@/lib/utils/cn";
import { getServices } from "@/services/services.service";
import { getSiteSettings } from "@/services/settingsService";

// Keep this deterministic during static prerendering.
const COPYRIGHT_YEAR = 2026;
const MAX_FOOTER_SERVICES = 6;

const POSITIONING = [
  "Full Stack Web Development",
  "SaaS Solutions",
  "AI Chatbot Automation",
];

const PROCESS_STEPS = [
  { title: "Share your brief", text: "Tell me the goal, scope and timeline." },
  { title: "Get a plan and quote", text: "A clear plan with a written quote." },
  { title: "Build and launch", text: "Delivered in stages you can review." },
];

const QUICK_LINKS = [
  { href: "/hire-me", label: "Start a project" },
  { href: "/projects", label: "View my work" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

const isHttp = (href) => /^https?:\/\//i.test(href);
const isSpecialScheme = (href) => /^(mailto:|tel:)/i.test(href);

function getUniqueLinks(links = []) {
  const seen = new Set();
  return links.filter((link) => {
    if (
      !link ||
      typeof link.label !== "string" ||
      typeof link.href !== "string" ||
      !link.href.trim()
    ) {
      return false;
    }
    const key = `${link.href.trim()}::${link.label.trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const asArray = (value) => (Array.isArray(value) ? value : []);

const linkBase =
  "group/link inline-flex w-fit items-center gap-1.5 rounded-sm py-1 transition-colors duration-200 hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const underline =
  "relative after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 group-hover/link:after:scale-x-100 group-focus-visible/link:after:scale-x-100 motion-reduce:after:transition-none";

const arrowBase =
  "size-3.5 shrink-0 -translate-x-1 opacity-0 transition-all duration-200 group-hover/link:translate-x-0 group-hover/link:opacity-100 group-focus-visible/link:translate-x-0 group-focus-visible/link:opacity-100 motion-reduce:transition-none";

/** Animated underline + sliding arrow. */
function FooterLink({ href, label, arrow = true, className }) {
  const external = isHttp(href);
  const Arrow = external || isSpecialScheme(href) ? ArrowUpRight : ArrowRight;

  const content = (
    <>
      <span className={underline}>{label}</span>
      {arrow ? <Arrow aria-hidden="true" className={arrowBase} /> : null}
      {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
    </>
  );

  const classes = cn(linkBase, "text-muted-foreground", className);

  if (external || isSpecialScheme(href)) {
    return (
      <a
        href={href}
        className={classes}
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : null)}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}

function FooterColumn({ title, links = [], action = null }) {
  const uniqueLinks = getUniqueLinks(links);
  if (uniqueLinks.length === 0) return null;

  const headingId = `footer-${title.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <nav aria-labelledby={headingId} className="flex flex-col gap-4">
      <h2
        id={headingId}
        className="text-sm font-semibold tracking-wide text-foreground"
      >
        {title}
      </h2>
      <ul className="flex flex-col gap-1.5 text-sm">
        {uniqueLinks.map((link) => (
          <li key={`${link.href}::${link.label}`}>
            <FooterLink href={link.href.trim()} label={link.label.trim()} />
          </li>
        ))}
      </ul>
      {action ? (
        <FooterLink
          href={action.href}
          label={action.label}
          className="text-sm font-medium text-primary hover:text-primary"
        />
      ) : null}
    </nav>
  );
}

export async function SiteFooter() {
  let services = [];
  let settings = null;

  const [servicesResult, settingsResult] = await Promise.allSettled([
    getServices(),
    getSiteSettings(),
  ]);

  if (servicesResult.status === "fulfilled") {
    services = asArray(servicesResult.value);
  } else {
    console.error("Failed to load footer services:", servicesResult.reason);
  }

  if (settingsResult.status === "fulfilled") {
    settings = settingsResult.value;
  } else {
    console.error("Failed to load footer settings:", settingsResult.reason);
  }

  const { headline, bio, socials } = getPublicProfile(settings);
  const tagline = headline || siteConfig.tagline;

  const email =
    siteConfig.contactEmail ??
    siteConfig.contact?.email ??
    siteConfig.email ??
    null;

  const availability =
    typeof siteConfig.availability === "string" &&
    siteConfig.availability.trim()
      ? siteConfig.availability.trim()
      : null;

  const allServiceLinks = getUniqueLinks(
    services
      .filter(
        (service) =>
          typeof service?.title === "string" &&
          typeof service?.slug === "string" &&
          service.slug.trim().length > 0,
      )
      .map((service) => ({
        label: service.title.trim(),
        href: `/services/${service.slug.trim()}`,
      })),
  );

  const serviceLinks = allServiceLinks.slice(0, MAX_FOOTER_SERVICES);
  const hasMoreServices = allServiceLinks.length > MAX_FOOTER_SERVICES;

  const navigationLinks = getUniqueLinks([
    ...asArray(mainNavigation),
    ...asArray(footerNavigation?.explore),
    ...asArray(footerNavigation?.company),
  ]);

  const accountLinks = getUniqueLinks(asArray(footerNavigation?.account));
  const legalLinks = getUniqueLinks(asArray(footerNavigation?.legal));

  return (
    <footer className="border-t border-border bg-muted/30">
      {/* Project CTA */}
      <Container className="py-10 sm:py-14">
        <section
          aria-labelledby="footer-cta-heading"
          className="relative overflow-hidden rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-10"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-28 -left-20 size-64 rounded-full bg-primary/5 blur-3xl"
          />

          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-12">
            <div>
              {availability ? (
                <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
                  <span aria-hidden="true" className="relative flex size-2">
                    <span className="absolute inline-flex size-full rounded-full bg-emerald-500/60 motion-safe:animate-ping" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                  </span>
                  {availability}
                </span>
              ) : (
                <p className="text-sm font-medium text-primary">
                  Start a project
                </p>
              )}
              <h2
                id="footer-cta-heading"
                className="mt-2 text-balance font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
              >
                Have a project in mind?
              </h2>
              <p className="mt-3 max-w-prose text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                Tell me what you need and I will reply with a clear plan and a
                written quote.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/hire-me"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "group w-full sm:w-auto",
                  )}
                >
                  Discuss your project
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                  />
                </Link>

                {email ? <CopyEmailButton email={email} /> : null}
              </div>

              <ul
                aria-label="Quick links"
                className="mt-6 flex flex-wrap gap-2"
              >
                {QUICK_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group/chip inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-background/70 px-3.5 text-sm text-muted-foreground outline-none transition-colors duration-200 hover:border-primary/40 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                    >
                      {link.label}
                      <ArrowRight
                        aria-hidden="true"
                        className="size-3.5 -ml-1 w-0 opacity-0 transition-all duration-200 group-hover/chip:ml-0 group-hover/chip:w-3.5 group-hover/chip:opacity-100 motion-reduce:transition-none"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <ol className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {PROCESS_STEPS.map((step, index) => (
                <li
                  key={step.title}
                  className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/60 p-4 transition-all duration-200 hover:border-primary/30 motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold tabular-nums text-primary"
                  >
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {step.title}
                    </p>
                    <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
                      {step.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </Container>

      {/* Link columns */}
      <Container className="grid gap-10 border-t border-border/70 py-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-8 lg:py-16">
        <div className="flex max-w-sm flex-col items-start gap-5 sm:col-span-2 lg:col-span-1">
          <Link
            href="/"
            className={cn(
              "group inline-flex min-w-0 items-center gap-2.5 rounded-md font-heading text-base font-semibold tracking-tight text-foreground transition-colors duration-200 motion-safe:group-hover:text-foreground sm:text-lg",
            )}
          >
            <span
              aria-hidden="true"
              className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary text-primary-foreground shadow-sm ring-1 ring-inset ring-primary/20 transition-all duration-200 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:scale-[1.04]"
            >
              Z
            </span>
            <span className="truncate min-[380px]:inline">
              {siteConfig.name}
            </span>
          </Link>{" "}
          {tagline ? (
            <p className="text-sm font-medium leading-6 text-foreground/90">
              {tagline}
            </p>
          ) : null}
          {bio ? (
            <div className="flex flex-col items-start gap-1">
              <p className="line-clamp-4 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                {bio}
              </p>
              <FooterLink
                href="/about"
                label="Read more about me"
                className="text-sm font-medium text-primary hover:text-primary"
              />
            </div>
          ) : null}
          <ul aria-label="Areas of expertise" className="flex flex-wrap gap-2">
            {POSITIONING.map((item) => (
              <li
                key={item}
                className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {item}
              </li>
            ))}
          </ul>
          {email ? (
            <div className="flex items-center gap-2 text-sm">
              <Mail
                aria-hidden="true"
                className="size-4 shrink-0 text-muted-foreground"
              />
              <FooterLink
                href={`mailto:${email}`}
                label={email}
                className="break-all font-medium text-foreground"
              />
            </div>
          ) : null}
          {socials ? <SocialRow socials={socials} /> : null}
        </div>

        <FooterColumn
          title="Services"
          links={serviceLinks}
          action={
            hasMoreServices
              ? { href: "/services", label: "All services" }
              : null
          }
        />
        <FooterColumn title="Navigate" links={navigationLinks} />
        <FooterColumn title="Account" links={accountLinks} />
      </Container>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <Container className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-muted-foreground">
            © {COPYRIGHT_YEAR} {siteConfig.name}. All rights reserved.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            {legalLinks.length > 0 ? (
              <nav aria-label="Legal">
                <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
                  {legalLinks.map((link) => (
                    <li key={`${link.href}::${link.label}`}>
                      <FooterLink
                        href={link.href.trim()}
                        label={link.label.trim()}
                        arrow={false}
                      />
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}

            <a
              href="#top"
              aria-label="Back to page top"
              className="group/top inline-flex w-fit items-center gap-1.5 rounded-sm py-1 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Back to top
              <ArrowUp
                aria-hidden="true"
                className="size-3.5 transition-transform duration-200 motion-safe:group-hover/top:-translate-y-1"
              />
            </a>
          </div>
        </Container>
      </div>
    </footer>
  );
}
