import { AccountActions } from "@/components/auth/AccountActions";
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

      <Section>
        <div className="mx-auto max-w-3xl">
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
