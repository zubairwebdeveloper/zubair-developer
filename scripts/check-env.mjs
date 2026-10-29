const required = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "FIREBASE_ADMIN_PROJECT_ID",
  "FIREBASE_ADMIN_CLIENT_EMAIL",
  "FIREBASE_ADMIN_PRIVATE_KEY",
];

const isSet = (name) => Boolean(process.env[name]?.trim());
const preferredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
const siteConfigValid = isSet("NEXT_PUBLIC_SITE_URL") || isSet("NEXT_PUBLIC_APP_URL");

const optional = [
  ["GEMINI_API_KEY", "AI assistant"],
  ["GEMINI_MODEL", "AI assistant"],
  ["RATE_LIMIT_REDIS_URL", "Durable rate limiting (AI production ma lazmi)"],
  ["RATE_LIMIT_REDIS_TOKEN", "Durable rate limiting"],
  ["EMAIL_PROVIDER_API_KEY", "Email notifications"],
  ["EMAIL_FROM", "Email notifications"],
  ["ADMIN_NOTIFY_EMAILS", "Email recipients fallback"],
  ["CRON_SECRET", "Follow-up reminders cron"],
  ["NEXT_PUBLIC_CONTACT_EMAIL", "Footer/contact page email"],
];

let failed = false;

console.log("Required");
for (const name of required) {
  const ok = isSet(name);
  if (!ok) failed = true;
  console.log(`  ${ok ? "OK     " : "MISSING"} ${name}`);
}

const siteOk = siteConfigValid;
if (!siteOk) failed = true;
console.log(`  ${siteOk ? "OK     " : "MISSING"} NEXT_PUBLIC_SITE_URL / NEXT_PUBLIC_APP_URL`);

console.log("\nOptional");
for (const [name, feature] of optional) {
  console.log(`  ${isSet(name) ? "set    " : "not set"} ${name}  (${feature})`);
}

console.log("\nWarnings");
const warnings = [];
if (preferredSiteUrl?.includes("localhost")) {
  warnings.push(
    "NEXT_PUBLIC_SITE_URL / NEXT_PUBLIC_APP_URL localhost par set hai. Production ma asli domain dain (sitemap, canonical).",
  );
}
const key = process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "";
if (key && !key.includes("BEGIN PRIVATE KEY")) {
  warnings.push("FIREBASE_ADMIN_PRIVATE_KEY ka format ghalat lagta hai.");
}
if (isSet("RATE_LIMIT_REDIS_URL") !== isSet("RATE_LIMIT_REDIS_TOKEN")) {
  warnings.push("Redis URL aur token dono set hone chahiye.");
}
if (isSet("EMAIL_PROVIDER_API_KEY") !== isSet("EMAIL_FROM")) {
  warnings.push("EMAIL_PROVIDER_API_KEY aur EMAIL_FROM dono set hone chahiye.");
}
console.log(
  warnings.length ? warnings.map((w) => `  - ${w}`).join("\n") : "  none",
);

process.exit(failed ? 1 : 0);
