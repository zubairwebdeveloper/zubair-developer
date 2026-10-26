// services/settingsService.js
//
// Public site settings: layout metadata, About page aur footer yahin se parhte hain.
// siteConfig ke defaults par Firestore ka `siteSettings/public` doc merge hota hai.
// DB fail ho jaye to site defaults ke saath chalti rahti hai.

import "server-only";

import { cache } from "react";

import { siteConfig } from "@/config/site";
import { COLLECTIONS } from "@/constants/collections";
import { getAdminDb } from "@/lib/firebase/admin";
import { serializeDoc } from "@/lib/firebase/firestore";

function getDefaults() {
  return {
    siteName: siteConfig?.name,
    description: siteConfig?.description,
    contactEmail: siteConfig?.contact?.email ?? siteConfig?.email,
    phone: siteConfig?.contact?.phone ?? siteConfig?.phone,
    logo: siteConfig?.logo,
    ogImage: siteConfig?.ogImage,
    social: siteConfig?.social ?? {},
  };
}

const text = (value) => (typeof value === "string" ? value.trim() : "");

// Sirf public fields. updatedBy jaise internal fields bahar nahi jate.
function pickPublicProfile(profile) {
  if (!profile || typeof profile !== "object") return null;

  const socials = {};
  for (const [key, value] of Object.entries(profile.socials ?? {})) {
    const cleaned = text(value);
    if (cleaned) socials[key] = cleaned;
  }

  return {
    headline: text(profile.headline),
    bio: text(profile.bio),
    socials,
  };
}

// React cache: ek request mein layout, footer aur page sab ke liye sirf ek read.
const readProfile = cache(async () => {
  const snap = await getAdminDb()
    .collection(COLLECTIONS.siteSettings)
    .doc("public")
    .get();

  const settings = serializeDoc(snap);
  return pickPublicProfile(settings?.profile);
});

export const settingsService = {
  async getPublic() {
    const defaults = getDefaults();

    let profile = null;
    try {
      profile = await readProfile();
    } catch (error) {
      console.error("[settings] failed to load profile:", error);
    }

    return profile ? { ...defaults, profile } : defaults;
  },
};

// Named export that app/layout.jsx expects
export async function getSiteSettings() {
  return settingsService.getPublic();
}

export default settingsService;
