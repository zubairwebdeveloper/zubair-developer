const GMAIL = { label: "Gmail", href: "https://mail.google.com" };
const OUTLOOK = { label: "Outlook", href: "https://outlook.live.com/mail/" };
const YAHOO = { label: "Yahoo Mail", href: "https://mail.yahoo.com" };
const ICLOUD = { label: "iCloud Mail", href: "https://www.icloud.com/mail" };
const PROTON = { label: "Proton Mail", href: "https://mail.proton.me" };

/** Inbox links for common providers. Other domains simply get no shortcut. */
const MAIL_PROVIDERS = {
  "gmail.com": GMAIL,
  "googlemail.com": GMAIL,
  "outlook.com": OUTLOOK,
  "hotmail.com": OUTLOOK,
  "live.com": OUTLOOK,
  "msn.com": OUTLOOK,
  "yahoo.com": YAHOO,
  "icloud.com": ICLOUD,
  "me.com": ICLOUD,
  "proton.me": PROTON,
  "protonmail.com": PROTON,
};

/**
 * Returns { label, href } for a known email provider, or null.
 * Save as: src/lib/auth/mail-providers.js
 */
export function getMailProvider(email) {
  const domain = String(email ?? "")
    .split("@")[1]
    ?.trim()
    .toLowerCase();
  return domain ? (MAIL_PROVIDERS[domain] ?? null) : null;
}
