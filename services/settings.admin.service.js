import "server-only";

import { COLLECTIONS } from "@/constants/collections";
import { getAdminDb } from "@/lib/firebase/admin";
import { serializeDoc, serverTimestamp } from "@/lib/firebase/firestore";
import { revalidateSettings } from "@/lib/admin/revalidate";
import { logActivity } from "@/services/activity.service";

const settingsRef = () =>
  getAdminDb().collection(COLLECTIONS.siteSettings).doc("public");

export async function getAnnouncementForAdmin() {
  const settings = serializeDoc(await settingsRef().get());
  return settings?.announcement ?? null;
}

export async function saveAnnouncement(data, admin) {
  await settingsRef().set(
    {
      announcement: {
        id: `announcement-${Date.now()}`,
        enabled: data.enabled,
        message: data.message,
        href: data.href || null,
        linkLabel: data.linkLabel || null,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
      },
      updatedAt: serverTimestamp(),
      updatedBy: admin.uid,
    },
    { merge: true },
  );

  await logActivity({
    action: "settings.announcement_updated",
    entityType: "settings",
    entityId: "public",
    admin,
  });
  revalidateSettings();
}

export async function getProfileForAdmin() {
  const settings = serializeDoc(await settingsRef().get());
  return settings?.profile ?? null;
}

export async function saveProfile(data, admin) {
  await settingsRef().set(
    {
      profile: {
        headline: data.headline,
        bio: data.bio,
        socials: {
          github: data.github,
          linkedin: data.linkedin,
          instagram: data.instagram,
          facebook: data.facebook,
        },
      },
      updatedAt: serverTimestamp(),
      updatedBy: admin.uid,
    },
    { merge: true },
  );

  await logActivity({
    action: "settings.profile_updated",
    entityType: "settings",
    entityId: "public",
    admin,
  });
  revalidateSettings();
}
