import Link from "next/link";
import { CalendarDays, CheckCircle2, KeyRound, ShieldCheck } from "lucide-react";

import { AccountActions } from "@/components/auth/AccountActions";
import { AccountLogoutDialog } from "@/components/auth/AccountLogoutDialog";
import { AccountWorkspace } from "@/components/account/AccountWorkspace";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";
import { ProfileNameForm } from "@/components/auth/ProfileNameForm";
import { VerifyEmailBanner } from "@/components/auth/VerifyEmailBanner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Section } from "@/components/shared/Section";
import { requirePageUser } from "@/lib/auth/require-user";
import { formatDate } from "@/lib/utils/dates";

export const metadata = {
  title: "My account",
  robots: { index: false, follow: false },
};

const providerNames = { "google.com": "Google", password: "Email & password" };

function getInitials(name, email) {
  const source = (name || email || "?").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  const letters =
    parts.length > 1 ? parts[0][0] + parts[1][0] : source.slice(0, 2);
  return letters.toUpperCase();
}

function getMemberDays(createdAt) {
  const time = new Date(createdAt).getTime();
  if (Number.isNaN(time)) return null;
  return Math.max(0, Math.floor((Date.now() - time) / 86_400_000));
}

export default async function AccountPage() {
  const user = await requirePageUser();

  const steps = [
    { id: "create", label: "Create your account", done: true, target: null },
    {
      id: "name",
      label: "Add your name",
      done: Boolean(user.name),
      target: "profile",
    },
    {
      id: "verify",
      label: "Verify your email",
      done: user.emailVerified,
      target: "verify",
    },
  ];

  const summary = {
    name: user.name ?? "",
    email: user.email,
    emailVerified: Boolean(user.emailVerified),
    hasPassword: Boolean(user.hasPassword),
    providers: user.providers.map((id) => providerNames[id] ?? id),
    memberSince: formatDate(user.createdAt),
    memberDays: getMemberDays(user.createdAt),
    initials: getInitials(user.name, user.email),
  };

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title={user.name ? `Hi, ${user.name}` : "My account"}
        description={user.email}
      />

      <Section className="pt-2 md:pt-4">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-card p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-6">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-90"
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in srgb, var(--primary) 18%, transparent), transparent 40%, color-mix(in srgb, var(--violet) 20%, transparent))",
              }}
            />
            <div className="relative grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-xl font-semibold text-primary ring-1 ring-primary/20">
                  {summary.initials}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
                    Account overview
                  </p>
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    {user.name || "Welcome back"}
                  </h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="flex flex-col items-start gap-3 sm:items-end">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600">
                    <CheckCircle2 className="size-3.5" aria-hidden="true" />
                    {user.emailVerified ? "Verified" : "Verification pending"}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-2.5 py-1 text-xs font-medium text-foreground/80">
                    <ShieldCheck className="size-3.5" aria-hidden="true" />
                    {summary.providers.length} sign-in method{summary.providers.length === 1 ? "" : "s"}
                  </span>
                </div>
                <AccountLogoutDialog email={user.email} />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: CalendarDays,
                label: "Member since",
                value: summary.memberSince || "Recently",
                detail: summary.memberDays != null ? `${summary.memberDays} days with us` : "Joined recently",
              },
              {
                icon: KeyRound,
                label: "Access",
                value: summary.hasPassword ? "Password enabled" : "Google / social sign-in",
                detail: summary.providers.join(", ") || "Secure sign-in",
              },
              {
                icon: ShieldCheck,
                label: "Profile health",
                value: `${steps.filter((step) => step.done).length}/${steps.length} complete`,
                detail: "Keep your account secure and complete",
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="group rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-4" aria-hidden="true" />
                  </div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">{item.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                </div>
              );
            })}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Quick actions
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-foreground">Everything you need in one place</h3>
                </div>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Contact support
                </Link>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  { title: "Update profile", href: "/account#profile", label: "Edit name and details" },
                  { title: "Security center", href: "/account#security", label: "Sessions and password" },
                  { title: "Help resources", href: "/faq", label: "Common answers" },
                  { title: "Inbox / enquiries", href: "/contact", label: "Send a support message" },
                ].map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group rounded-2xl border border-border/70 bg-background/60 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/5"
                  >
                    <div className="text-sm font-semibold text-foreground group-hover:text-primary">
                      {item.title}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">{item.label}</div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Security note
              </p>
              <h3 className="mt-1 text-lg font-semibold text-foreground">Keep this account protected</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="mt-0.5 size-1.5 rounded-full bg-primary" aria-hidden="true" />
                  Use a unique password you do not reuse elsewhere.
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 size-1.5 rounded-full bg-primary" aria-hidden="true" />
                  Verify your email to recover access if needed.
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 size-1.5 rounded-full bg-primary" aria-hidden="true" />
                  Sign out on shared or public devices after each session.
                </li>
              </ul>
            </div>
          </div>

          <AccountWorkspace
            summary={summary}
            steps={steps}
            verifyBanner={
              user.emailVerified ? null : (
                <VerifyEmailBanner email={user.email} />
              )
            }
            profileForm={<ProfileNameForm displayName={user.name} />}
            passwordForm={
              user.hasPassword ? (
                <ChangePasswordForm email={user.email} />
              ) : null
            }
            sessions={<AccountActions />}
            contactHref="/contact"
          />
        </div>
      </Section>
    </>
  );
}
