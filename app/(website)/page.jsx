import { CapabilitiesBento } from "@/components/home/CapabilitiesBento";
import { ChatbotDemoLazy } from "@/components/home/ChatbotDemoLazy";
import { EstimatorTeaser } from "@/components/home/EstimatorTeaser";
import { FaqPreview } from "@/components/home/FaqPreview";
import { FeaturedProjects } from "@/components/home/FeaturedProjects";
import { FinalCTA } from "@/components/home/FinalCTA";
import { HeroSection } from "@/components/home/HeroSection";
import { ProcessSection } from "@/components/home/ProcessSection";
import { PricingPreview } from "@/components/home/PricingPreview";
import { ServicesOverview } from "@/components/home/ServicesOverview";
import { StatsStrip } from "@/components/home/StatsStrip";
import { TechMarquee } from "@/components/home/TechMarquee";
import { Testimonials } from "@/components/home/Testimonials";
import { WhyWorkWithMe } from "@/components/home/WhyWorkWithMe";
import { WhatIDo } from "@/components/home/WhatIDo";
import { siteConfig } from "@/config/site";
import { getPublicProfile } from "@/lib/profile/public-profile";
import { getPlans } from "@/services/pricing.service";
import { getServices } from "@/services/services.service";
import { getSiteSettings } from "@/services/settingsService";

export const revalidate = 60;

export const metadata = {
  title: "Zubair Developer | Full Stack, SaaS and AI Chatbot Developer",
  description:
    "Full stack web developer building websites, SaaS applications and AI chatbot automation for businesses.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [settingsResult, servicesResult, plansResult] = await Promise.allSettled(
    [getSiteSettings(), getServices(), getPlans()],
  );
  const settings =
    settingsResult.status === "fulfilled" ? settingsResult.value : null;
  const services =
    servicesResult.status === "fulfilled" ? servicesResult.value : [];
  const plans = plansResult.status === "fulfilled" ? plansResult.value : [];

  if (settingsResult.status === "rejected") {
    console.error("[home] failed to load profile:", settingsResult.reason);
  }
  if (servicesResult.status === "rejected") {
    console.error(
      "[home] failed to load services for hero:",
      servicesResult.reason,
    );
  }
  if (plansResult.status === "rejected") {
    console.error("[home] failed to load plans for hero:", plansResult.reason);
  }

  const { headline, bio, socials } = getPublicProfile(settings);
  const email = siteConfig.contactEmail ?? null;
  const availability =
    typeof siteConfig.availability === "string" &&
    siteConfig.availability.trim()
      ? siteConfig.availability.trim()
      : null;

  // JSON-LD for search engines
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteConfig.name,
    description:
      headline ||
      siteConfig.description ||
      "Websites, SaaS applications and AI chatbot automation for businesses.",
    ...(siteConfig.url ? { url: siteConfig.url } : {}),
    ...(email ? { email } : {}),
    sameAs: (socials ?? [])
      .map((s) => s.href)
      .filter((href) => /^https?:\/\//i.test(href)),
  };

  return (
    <div className="pb-20 md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* ── 1. Hero ──────────────────────────────────────────────────── */}
      <HeroSection
        headline={headline}
        bio={bio}
        availability={availability}
        email={email}
        socials={socials}
        services={services}
        plans={plans}
      />

      {/* ── 2. TechMarquee ──────────────────────────────────────────── */}
      <TechMarquee />

      {/* ── 3. WhatIDo ──────────────────────────────────────────────── */}
      <WhatIDo />

      {/* ── 4. ServicesOverview ──────────────────────────────────────── */}
      <ServicesOverview />

      {/* ── 5. ChatbotDemo ───────────────────────────────────────────── */}
      <div id="chatbot-demo" className="scroll-mt-28 bg-muted/40">
        <ChatbotDemoLazy />
      </div>

      {/* ── 6. CapabilitiesBento ─────────────────────────────────────── */}
      <CapabilitiesBento />

      {/* ── 7. FeaturedProjects (hidden if none) ─────────────────────── */}
      <div id="projects" className="scroll-mt-28">
        <FeaturedProjects />
      </div>

      {/* ── 8. Project process ──────────────────────────────────────── */}
      <ProcessSection />

      {/* ── 9. WhyWorkWithMe ─────────────────────────────────────────── */}
      <div className="bg-muted/40">
        <WhyWorkWithMe />
      </div>

      {/* ── 10. Published content counts ────────────────────────────── */}
      <StatsStrip />

      {/* ── 11. PricingPreview ───────────────────────────────────────── */}
      <div id="pricing" className="scroll-mt-28">
        <PricingPreview />
      </div>

      {/* ── 12. EstimatorTeaser ──────────────────────────────────────── */}
      <EstimatorTeaser />

      {/* ── 13. Testimonials (hidden if none) ────────────────────────── */}
      <div id="testimonials" className="scroll-mt-28">
        <Testimonials />
      </div>

      {/* ── 14. FaqPreview ───────────────────────────────────────────── */}
      <div id="faq" className="scroll-mt-28">
        <FaqPreview />
      </div>

      {/* ── 15. FinalCTA ─────────────────────────────────────────────── */}
      <div id="contact" className="scroll-mt-28">
        <FinalCTA />
      </div>
    </div>
  );
}
