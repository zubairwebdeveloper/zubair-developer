export const siteConfig = {
  name: "Zubair Developer",
  tagline:
    "Full Stack Developer | SaaS Specialist | AI Chatbot Automation Expert",
  description:
    "I help businesses build high-performance websites, scalable web applications, and AI-powered automation systems.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
};

/** Header aur mobile menu. Chhota rakha hai taake header na bhare. */
export const mainNavigation = [
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Process", href: "/process" },
  { label: "Pricing", href: "/pricing" },
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
    { label: "FAQ", href: "/faq" },
  ],
  account: [authLinks.login, authLinks.register],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};
