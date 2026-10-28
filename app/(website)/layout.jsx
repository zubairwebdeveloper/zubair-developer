import { BackToTop } from "@/components/motion/BackToTop";
import { ConnectionStatus } from "@/components/layout/ConnectionStatus";
import { MobileCTA } from "@/components/layout/MobileCTA";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { siteConfig } from "@/config/site";
import { getSiteSettings } from "@/services/settingsService";

export default async function WebsiteLayout({ children }) {
  const settings = await getSiteSettings();

  const email =
    siteConfig.contactEmail ??
    siteConfig.contact?.email ??
    siteConfig.email ??
    null;

  const whatsapp = settings?.socials?.find((s) => s.id === "whatsapp")?.href ?? null;
  const quickContact = whatsapp ?? (email ? `mailto:${email}` : "/contact");
  const quickLabel = whatsapp ? "WhatsApp" : "Email";

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[70] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
      >
        Skip to content
      </a>

      <ScrollProgress />

      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        {children}
      </main>

      <ConnectionStatus />
      <MobileCTA
        quickContact={quickContact}
        quickLabel={quickLabel}
        whatsapp={whatsapp}
      />
    </>
  );
}
