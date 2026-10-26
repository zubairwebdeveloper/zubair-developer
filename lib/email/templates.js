import { siteConfig } from "@/config/site";
import { labelFor, serviceCategoryOptions } from "@/constants/options";

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const cleanSubject = (value) =>
  String(value)
    .replace(/[\r\n]+/g, " ")
    .trim()
    .slice(0, 150);

function render({ subject, lines, link, linkLabel }) {
  const text = [...lines, "", `${linkLabel}: ${link}`].join("\n");
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5">${lines
    .map((line) => `<p style="margin:0 0 8px">${escapeHtml(line)}</p>`)
    .join(
      "",
    )}<p style="margin:16px 0 0"><a href="${escapeHtml(link)}">${escapeHtml(linkLabel)}</a></p></div>`;

  return { subject: cleanSubject(subject), text, html };
}

export function newInquiryEmail({ type, reference, name, email, service }) {
  const isBrief = type === "project_brief";

  return render({
    subject: `${isBrief ? "New project brief" : "New contact message"} ${reference}`,
    lines: [
      isBrief
        ? "A new project brief was submitted."
        : "A new contact message was received.",
      `Name: ${name}`,
      `Email: ${email}`,
      `Service: ${labelFor(serviceCategoryOptions, service)}`,
      `Reference: ${reference}`,
    ],
    link: `${siteConfig.url}${isBrief ? "/admin/leads" : "/admin/messages"}`,
    linkLabel: "Open in admin",
  });
}

export function followUpDigestEmail(leads) {
  return render({
    subject: `${leads.length} follow-up${leads.length === 1 ? "" : "s"} due`,
    lines: [
      "These leads have reached their follow-up date:",
      ...leads.map(
        (lead) =>
          `${lead.name} (${lead.reference}), due ${new Date(lead.dueAt).toISOString().slice(0, 10)}`,
      ),
    ],
    link: `${siteConfig.url}/admin/leads`,
    linkLabel: "Open leads",
  });
}

export function testEmail() {
  return render({
    subject: "Test email from Zubair Developer admin",
    lines: [
      "This is a test email. If you can read it, email delivery is working.",
    ],
    link: `${siteConfig.url}/admin/settings`,
    linkLabel: "Back to settings",
  });
}
export function autoReplyEmail({ reference, message }) {
  return render({
    subject: `We received your enquiry ${reference}`,
    lines: [message, `Your reference: ${reference}`],
    link: siteConfig.url,
    linkLabel: "Visit the website",
  });
}
export function verifyAddressEmail({ link }) {
  return render({
    subject: "Verify your email address",
    lines: [
      "Please confirm your email address to finish setting up your account.",
    ],
    link,
    linkLabel: "Verify email",
  });
}