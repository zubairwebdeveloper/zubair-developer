import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { PolicyLayout } from "@/components/legal/PolicyLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Section } from "@/components/shared/Section";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/privacy" },
};

/**
 * Jab policy review ho jaye aur final ho, yahan real date likhein, jaise "1 March 2026".
 * null ho to date nahi dikhegi.
 */
const LAST_UPDATED = null;

/** Review mukammal hone par false kar dein, "To be confirmed" boxes chhup jayenge. */
const SHOW_DRAFT_NOTES = true;

const highlights = [
  {
    title: "Only what you submit",
    text: "We collect the details you share through our forms so we can respond to you.",
  },
  {
    title: "We do not sell your data",
    text: "Your personal information is not sold.",
  },
  {
    title: "You can ask for access or deletion",
    text: "Contact us and we will handle your request.",
  },
];

const sections = [
  {
    id: "summary",
    title: "Summary",
    summary:
      "This policy explains what information this website collects, why, and what choices you have.",
    blocks: [
      {
        type: "p",
        text: "We collect only the information you submit through our forms, such as your name, email and project details, so that we can respond to your enquiry. We do not sell your personal information.",
      },
      {
        type: "todo",
        text: "This page is a draft. Have it reviewed against the laws that apply to you and your visitors before relying on it.",
      },
    ],
  },
  {
    id: "information-we-collect",
    title: "Information we collect",
    summary: "The information depends on how you use the website.",
    blocks: [
      {
        type: "ul",
        items: [
          "Contact and project forms: your name, email address and the details you write in your message or project brief, such as goals, budget and timeline.",
          "Accounts: if you create an account, your name, email address, whether your email is verified, how you sign in (Google or email and password) and when your account was created.",
          "Messages you send directly, for example by email.",
        ],
      },
      {
        type: "todo",
        text: "List any other data you collect, such as analytics, server logs, or fields added to your forms later. Remove any item above that does not apply.",
      },
    ],
  },
  {
    id: "how-we-use-it",
    title: "How we use your information",
    blocks: [
      {
        type: "ul",
        items: [
          "To reply to your enquiry or project brief.",
          "To provide and secure your account, including sign-in and password reset.",
          "To keep the website working and to fix problems.",
        ],
      },
      {
        type: "p",
        text: "We use your information for these purposes and not to sell it to others.",
      },
    ],
  },
  {
    id: "sharing",
    title: "Sharing your information",
    blocks: [
      {
        type: "p",
        text: "We do not sell your personal information. We may rely on service providers to run the website, such as hosting, email delivery or sign-in, and they handle data only to provide those services.",
      },
      {
        type: "todo",
        text: "Name your actual providers (for example hosting, email and authentication) or describe them by type, and confirm how data is shared.",
      },
    ],
  },
  {
    id: "your-device",
    title: "Data stored on your device",
    blocks: [
      {
        type: "p",
        text: "Some small preferences are kept in your own browser and are not sent to us. For example, if you mark an FAQ answer as helpful, that choice is saved on your device only. You can clear it any time by clearing your browser data for this site.",
      },
      {
        type: "todo",
        text: "Describe any cookies used for sign-in sessions, analytics or other purposes, and whether you ask for consent.",
      },
    ],
  },
  {
    id: "your-choices",
    title: "Your choices and rights",
    blocks: [
      {
        type: "p",
        text: "You may request access to your data or ask us to delete it by contacting us. Please use the email address you used on this website so we can find your information.",
      },
      {
        type: "ul",
        items: [
          "Ask what personal data we hold about you.",
          "Ask us to correct or delete it.",
          "Update your name from your account page if you have an account.",
        ],
      },
      {
        type: "todo",
        text: "Add any additional rights that apply in your region, and how quickly you will respond.",
      },
    ],
  },
  {
    id: "security",
    title: "Security",
    blocks: [
      {
        type: "p",
        text: "We take reasonable steps to protect your information. No website or storage method is completely secure, so we cannot guarantee absolute security. If you use a password, choose one you do not use elsewhere.",
      },
    ],
  },
  {
    id: "retention",
    title: "How long we keep data",
    blocks: [
      {
        type: "p",
        text: "We keep your information only as long as needed for the purposes described above, or until you ask us to delete it.",
      },
      {
        type: "todo",
        text: "State your actual retention periods, for example how long enquiries and account data are kept.",
      },
    ],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    blocks: [
      {
        type: "p",
        text: "We may update this policy from time to time. The latest version is always on this page.",
      },
    ],
  },
  {
    id: "contact",
    title: "Contact",
    blocks: [
      {
        type: "p",
        text: `For questions about this policy or your data, contact ${siteConfig.name} using the contact page${siteConfig.contactEmail ? ` or by email at ${siteConfig.contactEmail}` : ""}.`,
      },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <ReadingProgress targetId="policy-content" />

      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        description="What we collect, why we collect it, and the choices you have."
      />

      <Section>
        <PolicyLayout
          sections={sections}
          highlights={highlights}
          email={siteConfig.contactEmail ?? ""}
          lastUpdated={LAST_UPDATED}
          showDraftNotes={SHOW_DRAFT_NOTES}
        />
      </Section>
    </>
  );
}
