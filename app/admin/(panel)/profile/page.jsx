import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  Eye,
  Info,
  Share2,
  TriangleAlert,
  UserRound,
} from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProfileForm } from "@/components/admin/ProfileForm";
import { ReloadButton } from "@/components/admin/ReloadButton";
import { Reveal } from "@/components/shared/Reveal";
import { siteConfig } from "@/config/site";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { requirePageAdmin } from "@/lib/auth/require-admin";
import { getPublicProfile, SocialRow } from "@/lib/profile/public-profile";
import { getSiteSettings } from "@/services/settingsService";
import { getProfileForAdmin } from "@/services/settings.admin.service";

export const metadata = { title: "Profile" };

const places = [
  {
    icon: UserRound,
    title: "About page",
    text: "Headline, bio and social links appear on the public About page.",
    href: "/about",
    linkLabel: "View About page",
  },
  {
    icon: Share2,
    title: "Footer",
    text: "Headline, a short bio and social links appear in the footer.",
  },
];

const clean = (v) => (typeof v === "string" ? v.trim() : "");

export default async function ProfilePage() {
  await requirePageAdmin(PERMISSIONS.SETTINGS_MANAGE);

  let profile = null;
  let failed = false;
  try {
    profile = await getProfileForAdmin();
  } catch (error) {
    failed = true;
    console.error("[admin] failed to load profile:", error);
  }

  // Public side ko kya milta hai (sync check ke liye)
  let publicSettings = null;
  try {
    publicSettings = await getSiteSettings();
  } catch (error) {
    console.error("[admin] failed to load public settings:", error);
  }

  const saved = getPublicProfile(profile);
  const live = getPublicProfile(publicSettings);
  const name = clean(profile?.name ?? profile?.displayName) || siteConfig.name;

  const checks = [
    { label: "Headline", done: Boolean(saved.headline) },
    { label: "Bio", done: Boolean(saved.bio) },
    { label: "Social links", done: Boolean(saved.socials) },
  ];
  const doneCount = checks.filter((c) => c.done).length;
  const percent = Math.round((doneCount / checks.length) * 100);

  // Admin ma data hai magar public ko nahi mil raha
  const savedSomething = saved.headline || saved.bio || saved.socials;
  const liveSomething = live.headline || live.bio || live.socials;
  const notReaching = Boolean(savedSomething) && !liveSomething;

  const publicKeys = publicSettings ? Object.keys(publicSettings) : [];

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Profile"
        description="Your name, headline, bio and social links for the About page and the footer."
      />

      {failed ? (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/5 flex max-w-2xl flex-col items-start gap-3 rounded-2xl border p-5"
        >
          <p className="text-destructive font-medium">
            Could not load profile.
          </p>
          <p className="text-muted-foreground text-sm leading-6">
            The form is hidden to avoid overwriting your profile. Reload the
            page. The technical details are in your server logs.
          </p>
          <ReloadButton />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8">
          <div className="flex min-w-0 flex-col gap-6">
            {/* Sync check */}
            <Reveal direction="up">
              <section
                aria-label="Public site sync check"
                className={`flex flex-col gap-3 rounded-2xl border p-5 ${
                  notReaching
                    ? "border-primary/40 bg-primary/5"
                    : "border-border bg-card"
                }`}
              >
                <h2 className="flex items-center gap-2 text-sm font-medium">
                  {notReaching ? (
                    <TriangleAlert
                      aria-hidden="true"
                      className="text-primary size-4"
                    />
                  ) : (
                    <Eye aria-hidden="true" className="size-4" />
                  )}
                  Public site sync check
                </h2>

                {notReaching ? (
                  <>
                    <p className="text-sm leading-6">
                      Your profile is saved, but the public site does not
                      receive it. About and the footer will stay empty until
                      this is fixed.
                    </p>
                    <p className="text-muted-foreground text-xs leading-5">
                      The public settings only contain:{" "}
                      <span className="font-mono">
                        {publicKeys.join(", ") || "(nothing)"}
                      </span>
                      . There is no <span className="font-mono">profile</span>{" "}
                      key, so{" "}
                      <span className="font-mono">getSiteSettings()</span> needs
                      to read the same document the admin form saves to. Send me{" "}
                      <span className="font-mono">settingsService.js</span> and
                      I will fix it.
                    </p>
                  </>
                ) : !savedSomething ? (
                  <p className="text-muted-foreground text-sm leading-6">
                    Nothing is saved yet. Fill in the form and save, then reload
                    this page to run the check again.
                  </p>
                ) : (
                  <p className="text-muted-foreground text-sm leading-6">
                    The public site receives your profile. Changes can take up
                    to a minute to appear because pages are cached.
                  </p>
                )}
              </section>
            </Reveal>

            <ProfileForm profile={profile} />
          </div>

          <aside
            aria-label="Profile overview"
            className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-24 lg:self-start"
          >
            {/* Completeness */}
            <Reveal direction="up">
              <div className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-card-title">Profile checklist</h2>
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {percent}%
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-label="Profile completeness"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={percent}
                  className="bg-muted h-2 overflow-hidden rounded-full"
                >
                  <div
                    className="bg-primary h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <ul className="flex flex-col gap-2">
                  {checks.map((check) => (
                    <li
                      key={check.label}
                      className="flex items-center gap-2.5 text-sm"
                    >
                      {check.done ? (
                        <CheckCircle2
                          aria-hidden="true"
                          className="text-primary size-4 shrink-0"
                        />
                      ) : (
                        <Circle
                          aria-hidden="true"
                          className="text-muted-foreground size-4 shrink-0"
                        />
                      )}
                      <span
                        className={check.done ? "" : "text-muted-foreground"}
                      >
                        {check.label}
                      </span>
                      <span className="sr-only">
                        {check.done ? "(done)" : "(missing)"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {/* Preview of saved data */}
            <Reveal direction="up">
              <div className="border-border bg-card flex flex-col gap-3 rounded-2xl border p-5">
                <h2 className="text-card-title">Saved preview</h2>
                <div className="flex flex-col gap-1">
                  <p className="font-heading text-lg font-semibold tracking-tight">
                    {name}
                  </p>
                  {saved.headline ? (
                    <p className="text-primary text-sm font-medium">
                      {saved.headline}
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No headline yet
                    </p>
                  )}
                </div>
                {saved.bio ? (
                  <p className="text-muted-foreground line-clamp-5 text-sm leading-6 whitespace-pre-line">
                    {saved.bio}
                  </p>
                ) : (
                  <p className="text-muted-foreground text-sm">No bio yet</p>
                )}
                {saved.socials ? (
                  <SocialRow socials={saved.socials} brand={false} />
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No social links yet
                  </p>
                )}
              </div>
            </Reveal>

            {/* Where it appears */}
            <Reveal direction="up">
              <div className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-5">
                <h2 className="text-card-title">Where this appears</h2>
                <ul className="flex flex-col gap-4">
                  {places.map(
                    ({ icon: Icon, title, text, href, linkLabel }) => (
                      <li key={title} className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg"
                        >
                          <Icon className="size-[18px]" />
                        </span>
                        <div className="flex min-w-0 flex-col gap-1">
                          <p className="text-sm font-medium">{title}</p>
                          <p className="text-muted-foreground text-xs leading-5">
                            {text}
                          </p>
                          {href ? (
                            <Link
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-foreground focus-visible:ring-ring inline-flex w-fit items-center gap-1 rounded-sm text-xs underline underline-offset-4 outline-none focus-visible:ring-2"
                            >
                              {linkLabel}
                              <ExternalLink
                                aria-hidden="true"
                                className="size-3"
                              />
                            </Link>
                          ) : null}
                        </div>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </Reveal>

            <Reveal direction="up">
              <div className="border-border bg-muted/40 flex items-start gap-3 rounded-2xl border p-4">
                <Info
                  aria-hidden="true"
                  className="text-primary mt-0.5 size-4 shrink-0"
                />
                <p className="text-muted-foreground text-xs leading-5">
                  This is public information. Do not add anything private.
                </p>
              </div>
            </Reveal>
          </aside>
        </div>
      )}
    </div>
  );
}
