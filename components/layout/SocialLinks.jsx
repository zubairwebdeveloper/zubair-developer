import {
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { Mail } from "lucide-react";

import { cn } from "@/lib/utils/cn";

// Order here is the order they render in. Networks missing from `socials` are skipped.
const networks = [
  { key: "github", label: "GitHub", Icon: FaGithub },
  { key: "linkedin", label: "LinkedIn", Icon: FaLinkedin },
  { key: "x", aliases: ["twitter"], label: "X (Twitter)", Icon: FaXTwitter },
  { key: "instagram", label: "Instagram", Icon: FaInstagram },
  { key: "facebook", label: "Facebook", Icon: FaFacebook },
  { key: "youtube", label: "YouTube", Icon: FaYoutube },
  { key: "whatsapp", label: "WhatsApp", Icon: FaWhatsapp },
  { key: "email", label: "Email", Icon: Mail, mail: true },
];

const SIZES = {
  sm: { button: "size-9", icon: "size-4" },
  md: { button: "size-10", icon: "size-5" },
  lg: { button: "size-11", icon: "size-6" },
};

/** Returns a safe href for a social value, or null when it should not render. */
function resolveHref(value, { mail = false } = {}) {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw) return null;

  // Bare email addresses become mailto: links
  if (mail) {
    if (/^mailto:/i.test(raw)) return raw;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw) ? `mailto:${raw}` : null;
  }

  // Only http(s) links are allowed for social profiles (blocks javascript: etc.)
  try {
    const url = new URL(raw);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function pickValue(socials, network) {
  for (const key of [network.key, ...(network.aliases ?? [])]) {
    if (socials?.[key]) return socials[key];
  }
  return null;
}

/**
 * @param {Record<string, string>} socials  e.g. { github, linkedin, x, instagram, facebook, youtube, whatsapp, email }
 * @param {"sm" | "md" | "lg"} [size]       Button size (default "md")
 * @param {"ghost" | "outline"} [variant]   Plain icons or bordered buttons (default "outline")
 * @param {boolean} [showLabels]            Show the network name beside each icon
 * @param {string} [className]
 */
export function SocialLinks({
  socials,
  size = "md",
  variant = "outline",
  showLabels = false,
  className,
}) {
  const active = networks
    .map((network) => ({
      ...network,
      href: resolveHref(pickValue(socials, network), {
        mail: network.mail,
      }),
    }))
    .filter((network) => network.href);

  if (active.length === 0) return null;

  const sizing = SIZES[size] ?? SIZES.md;

  return (
    <ul
      aria-label="Social links"
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      {active.map(({ key, label, Icon, href, mail }) => (
        <li key={key} className="group/social relative">
          <a
            href={href}
            aria-label={showLabels ? undefined : label}
            {...(mail
              ? null
              : { target: "_blank", rel: "noopener noreferrer" })}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-full text-muted-foreground transition-[color,background-color,border-color,transform] duration-200",
              "hover:text-foreground focus-visible:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none",
              variant === "outline"
                ? "border border-border bg-background hover:border-foreground/30 hover:bg-muted"
                : "hover:bg-muted",
              showLabels ? "h-10 px-3.5 text-sm font-medium" : sizing.button,
            )}
          >
            <Icon aria-hidden="true" className={sizing.icon} />
            {showLabels ? <span>{label}</span> : null}
            {mail ? null : (
              <span className="sr-only"> (opens in a new tab)</span>
            )}
          </a>

          {/* Tooltip: desktop hover and keyboard focus only (icon-only mode) */}
          {showLabels ? null : (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs font-medium text-popover-foreground opacity-0 shadow-md transition-all duration-150 group-focus-within/social:translate-y-0 group-focus-within/social:opacity-100 group-hover/social:translate-y-0 group-hover/social:opacity-100 motion-reduce:transition-none sm:block"
            >
              {label}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
