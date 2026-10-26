// app/layout.jsx

import { cache } from "react";

import { Toaster } from "@/components/ui/sonner";
// import { AuthProvider } from "@/components/auth/AuthProvider";
import { Navbar, SiteHeader } from "@/components/layout/SiteHeader";
import { Footer, SiteFooter } from "@/components/layout/SiteFooter";
// import { Providers } from "@/components/layout/Providers";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { SiteBackground } from "@/components/layout/SiteBackground";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { SnakeScrollAuto } from "@/components/layout/SnakeScrollbar";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { siteConfig } from "@/config/site";
import { settingsService } from "@/services/settingsService";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

import "./globals.css";
import { AIChatWidget } from "@/components/chatbot/AIChatWidget";

// Fonts are loaded with a <link> tag (fetched by the browser at runtime) instead of
// next/font/google, so the build never has to reach fonts.googleapis.com.
// globals.css defines --font-dm-sans, --font-space-grotesk and --font-source-serif,
// which is what connects these families to font-sans, font-heading and font-serif.
const GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2" +
  "?family=DM+Sans:wght@100..1000" +
  "&family=Space+Grotesk:wght@500..700" +
  "&family=Source+Serif+4:opsz,wght@8..60,200..900" +
  "&display=swap";

/* -------------------------------------------------------------------------- */
/*  Brand defaults, used whenever the settings have no value                  */
/* -------------------------------------------------------------------------- */

const BRAND_NAME = siteConfig?.name || "Zubair Developer";
const BRAND_TITLE = `${BRAND_NAME} | Full Stack, SaaS & AI Chatbot Automation`;
const BRAND_DESCRIPTION =
  "Full stack web developer building high-performance websites, scalable SaaS applications, and AI chatbot automation that turn business ideas into practical digital solutions.";
const BRAND_KEYWORDS = [
  "full stack web developer",
  "SaaS development",
  "AI chatbot automation",
  "Next.js developer",
  "web application development",
];
const BRAND_SERVICES = [
  "Full stack web development",
  "SaaS solutions",
  "AI chatbot automation",
];

/* -------------------------------------------------------------------------- */
/*  AI chat widget config                                                     */
/* -------------------------------------------------------------------------- */

// Sane defaults so the widget still works if public settings don't carry an
// `ai` block yet (or it's missing a field). None of this is end-user personal
// data — ChatPanel's `config` is the assistant's own branding/behaviour, not
// visitor info. Edit these to match how you actually want it to introduce itself.
const DEFAULT_AI_CONFIG = {
  name: BRAND_NAME,
  welcomeMessage: `Hi, I'm the ${BRAND_NAME} assistant. Ask about services, pricing, or how a project works.`,
  suggestedPrompts: [
    "What services do you offer?",
    "How much does a website cost?",
    "How does the process work?",
  ],
  handoffMessage: "Prefer to talk directly?",
  storesConversations: false,
};

/**
 * Builds ChatPanel's `config` from public settings, falling back to
 * DEFAULT_AI_CONFIG for anything missing. Assumes `settings.ai` may hold
 * { name, welcomeMessage, suggestedPrompts, handoffMessage, storesConversations }
 * if your settings service exposes one — adjust the field name here if it
 * lives elsewhere (e.g. a dedicated public AI-settings read).
 */
function resolveAiChatConfig(settings) {
  const ai = settings?.ai ?? {};
  return {
    name: ai.name || DEFAULT_AI_CONFIG.name,
    welcomeMessage: ai.welcomeMessage || DEFAULT_AI_CONFIG.welcomeMessage,
    suggestedPrompts:
      Array.isArray(ai.suggestedPrompts) && ai.suggestedPrompts.length > 0
        ? ai.suggestedPrompts
        : DEFAULT_AI_CONFIG.suggestedPrompts,
    handoffMessage: ai.handoffMessage || DEFAULT_AI_CONFIG.handoffMessage,
    storesConversations: Boolean(ai.storesConversations),
  };
}

/** A valid absolute origin, even if the environment variable is missing or malformed. */
function resolveSiteUrl() {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
      .origin;
  } catch {
    return "http://localhost:3000";
  }
}

const siteUrl = resolveSiteUrl();

/** One settings request per render, shared by metadata and the layout. A failure falls back to defaults. */
const getSettings = cache(async () => {
  try {
    return (await settingsService.getPublic()) ?? null;
  } catch (error) {
    console.error("[layout] failed to load public settings:", error);
    return null;
  }
});

/** Turns a relative path into an absolute URL (needed for structured data). */
function absoluteUrl(value) {
  if (!value || typeof value !== "string") return undefined;
  try {
    return new URL(value, siteUrl).toString();
  } catch {
    return undefined;
  }
}

function resolveBrand(settings) {
  return {
    siteName: settings?.siteName || BRAND_NAME,
    title: settings?.seoTitle || BRAND_TITLE,
    description:
      settings?.seoDescription || settings?.description || BRAND_DESCRIPTION,
  };
}

/* -------------------------------------------------------------------------- */
/*  Metadata                                                                  */
/* -------------------------------------------------------------------------- */

export const viewport = {
  colorScheme: "light dark",
  // Lets env(safe-area-inset-*) work on notched phones (used by .ai-chat-slot).
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f9fc" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1020" },
  ],
};

export async function generateMetadata() {
  const settings = await getSettings();
  const { siteName, title, description } = resolveBrand(settings);

  return {
    metadataBase: new URL(siteUrl),

    title: {
      default: title,
      template: `%s | ${siteName}`,
    },

    description,
    applicationName: siteName,
    authors: [{ name: siteName, url: siteUrl }],
    creator: siteName,
    category: "technology",
    referrer: "origin-when-cross-origin",

    openGraph: {
      title,
      description,
      siteName,
      url: siteUrl,
      type: "website",
      locale: "en_US",
      images: settings?.ogImage ? [{ url: settings.ogImage }] : undefined,
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: settings?.ogImage ? [settings.ogImage] : undefined,
    },

    keywords: settings?.seoKeywords?.length
      ? settings.seoKeywords
      : BRAND_KEYWORDS,

    // No canonical here on purpose. Setting one in the root layout would point every
    // page at the home page. Each page can set its own with alternates.canonical.

    formatDetection: { telephone: false, email: false, address: false },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  Layout                                                                    */
/* -------------------------------------------------------------------------- */

export default async function RootLayout({ children }) {
  const settings = await getSettings();
  const { siteName, description } = resolveBrand(settings);
  const aiChatConfig = resolveAiChatConfig(settings);

  const sameAs = Object.values(settings?.social ?? {}).filter(
    (value) => typeof value === "string" && value.trim(),
  );

  // Structured data so search engines understand who you are and what you offer.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": `${siteUrl}/#organization`,
        name: siteName,
        url: siteUrl,
        description,
        logo: absoluteUrl(settings?.logo),
        image: absoluteUrl(settings?.ogImage || settings?.logo),
        email: settings?.contactEmail || undefined,
        telephone: settings?.phone || undefined,
        serviceType: BRAND_SERVICES,
        knowsAbout: BRAND_SERVICES,
        ...(sameAs.length > 0 ? { sameAs } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: siteName,
        publisher: { "@id": `${siteUrl}/#organization` },
        inLanguage: "en",
      },
    ],
  };

  return (
    <html
      lang="en"
      className="scroll-smooth motion-reduce:scroll-auto"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href={GOOGLE_FONTS_HREF} />
      </head>
      <body className="relative flex min-h-dvh flex-col overflow-x-clip bg-background font-sans text-[15px] leading-relaxed text-foreground antialiased selection:bg-primary/20 selection:text-foreground sm:text-base lg:text-[17px] dark:selection:bg-primary/30">
        {/* Lets keyboard and screen reader users skip the navigation. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[10000] focus:rounded-lg focus:border focus:border-border focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          {/* <Providers> */}
          {/* <AuthProvider> */}
          <ScrollProgress />
          <SiteBackground />
          <SiteHeader />
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 outline-none motion-safe:animate-fade-in"
          >
            {children}
          </main>
          <SiteFooter />

          {/* AIChatWidget hides itself on /contact and /hire-me, and renders
              nothing without a config — it positions itself with its own
              fixed classes, so no className is needed here. */}
          <AIChatWidget config={aiChatConfig} />

          <ScrollToTop bottom={85} />

          <CommandPalette />
          <OfflineBanner />
          <Toaster richColors closeButton position="top-right" />
          {/* </AuthProvider> */}
          {/* </Providers> */}
          <SnakeScrollAuto />
        </ThemeProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
