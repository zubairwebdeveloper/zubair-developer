import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { ConnectionStatus } from "@/components/layout/ConnectionStatus";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { getSiteSettings } from "@/services/settingsService";

export default async function WebsiteLayout({ children }) {
  const settings = await getSiteSettings();
  const announcement = settings?.announcement;

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[70] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
      >
        Skip to content
      </a>

      <ScrollProgress />
      <AnnouncementBar announcement={announcement} />

      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        {children}
      </main>

      <ConnectionStatus />
    </>
  );
}
