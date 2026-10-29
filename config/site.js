const DEFAULT_SITE_URL = "https://zubair-developer.vercel.app";

function resolveSiteUrl() {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || DEFAULT_SITE_URL;

  if (!configured || typeof configured !== "string") {
    return DEFAULT_SITE_URL;
  }

  const value = configured.trim();
  if (!value) {
    return DEFAULT_SITE_URL;
  }

  try {
    const parsed = new URL(value);

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error(`Unsupported protocol: ${parsed.protocol}`);
    }

    if (
      process.env.NODE_ENV === "production" &&
      ["localhost", "127.0.0.1"].includes(parsed.hostname)
    ) {
      return DEFAULT_SITE_URL;
    }

    return parsed.origin;
  } catch (error) {
    console.warn(
      "[site-config] Invalid site URL detected. Using the production origin instead.",
      {
        provided: value,
        fallback: DEFAULT_SITE_URL,
        error: error instanceof Error ? error.message : String(error),
      },
    );
    return DEFAULT_SITE_URL;
  }
}

export const siteConfig = {
  name: "Zubair Developer",
  tagline:
    "Full Stack Developer | SaaS Specialist | AI Chatbot Automation Expert",
  description:
    "I help businesses build high-performance websites, scalable web applications, and AI-powered automation systems.",
  url: resolveSiteUrl(),
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  freeDiscoveryCall: false,
};

export const siteUrl = siteConfig.url;

/** Header aur mobile menu. Chhota rakha hai taake header na bhare. */
export const mainNavigation = [
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Process", href: "/process" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const primaryCta = { label: "Start a Project", href: "/hire-me" };

/** Auth ke links (HeaderAuthLink aur footer ke liye). */
export const authLinks = {
  login: { label: "Log in", href: "/login" },
  register: { label: "Create account", href: "/register" },
  account: { label: "My account", href: "/account" },
};

/**
 * Footer. `explore` main menu ke ilawa extra pages hain, is liye koi link do dafa nahi aata.
 * SiteFooter ma `[...mainNavigation, ...footerNavigation.company]` ki jagah
 * `[...mainNavigation, ...footerNavigation.explore]` likhein.
 */
export const footerNavigation = {
  explore: [
    { label: "Blog", href: "/blog" },
    { label: "Testimonials", href: "/testimonials" },
    { label: "FAQ", href: "/faq" },
  ],
  account: [authLinks.login, authLinks.register],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};
