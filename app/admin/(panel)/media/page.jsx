import { Accessibility, Gauge, ShieldCheck } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaGuide } from "@/components/admin/MediaGuide";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { Reveal } from "@/components/shared/Reveal";
import { ALLOWED_UPLOAD_LABEL, MAX_UPLOAD_BYTES } from "@/constants/media";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { requirePageAdmin } from "@/lib/auth/require-admin";

export const metadata = { title: "Media" };

const MAX_UPLOAD_MB = Math.round(MAX_UPLOAD_BYTES / (1024 * 1024));

export default async function MediaPage() {
  await requirePageAdmin(PERMISSIONS.MEDIA_MANAGE);

  // Sirf wahi limits jo aap ke constants se aati hain
  const quickFacts = [
    {
      icon: ShieldCheck,
      title: "Accepted files",
      text: ALLOWED_UPLOAD_LABEL,
    },
    {
      icon: Gauge,
      title: "Size limit",
      text: `Up to ${MAX_UPLOAD_MB} MB per image.`,
    },
    {
      icon: Accessibility,
      title: "Descriptions",
      text: "Write one for every image. It helps screen readers and SEO.",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Media"
        description="Upload images for projects and blog posts here. Please write a description for every image."
      />

      <Reveal direction="up">
        <ul aria-label="Upload rules" className="grid gap-3 sm:grid-cols-3">
          {quickFacts.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="border-border bg-card flex min-w-0 items-start gap-3 rounded-2xl border p-4"
            >
              <span
                aria-hidden="true"
                className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg"
              >
                <Icon className="size-[18px]" />
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <h2 className="text-sm font-medium">{title}</h2>
                <p className="text-muted-foreground text-xs leading-5 break-words">
                  {text}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Reveal>

      <MediaLibrary mode="manage" />

      <Reveal direction="up">
        <MediaGuide />
      </Reveal>
    </div>
  );
}
