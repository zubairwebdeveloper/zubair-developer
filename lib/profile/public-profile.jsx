import {
  FaBehance,
  FaCodepen,
  FaDiscord,
  FaDribbble,
  FaEnvelope,
  FaFacebookF,
  FaGithub,
  FaGlobe,
  FaInstagram,
  FaLinkedinIn,
  FaMedium,
  FaPhone,
  FaStackOverflow,
  FaTelegram,
  FaTiktok,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { FiArrowUpRight } from "react-icons/fi";

import { cn } from "@/lib/utils/cn";

const clean = (value) => (typeof value === "string" ? value.trim() : "");

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

function hasContent(value) {
  if (!value) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (isPlainObject(value)) return Object.values(value).some(hasContent);
  return Boolean(clean(value));
}

/** Breadth-first search: object ke andar kisi bhi gehrai par pehla non-empty key. */
function findDeep(root, names, maxDepth = 4) {
  if (!isPlainObject(root)) return undefined;
  let level = [root];
  for (let depth = 0; depth <= maxDepth && level.length; depth += 1) {
    const next = [];
    for (const node of level) {
      for (const name of names) {
        if (hasContent(node[name])) return node[name];
      }
      for (const value of Object.values(node)) {
        if (isPlainObject(value)) next.push(value);
      }
    }
    level = next;
  }
  return undefined;
}

/* -------------------------------------------------------------------------- */
/*  Platforms                                                                 */
/* -------------------------------------------------------------------------- */

// Order yahi rahega (upar wale pehle dikhte hain). color null = theme ka primary.
const PLATFORMS = {
  github: {
    name: "GitHub",
    Icon: FaGithub,
    hosts: ["github.com"],
    base: "https://github.com/",
    color: null,
  },
  linkedin: {
    name: "LinkedIn",
    Icon: FaLinkedinIn,
    hosts: ["linkedin.com"],
    base: "https://www.linkedin.com/in/",
    color: "#0A66C2",
  },
  x: {
    name: "X",
    Icon: FaXTwitter,
    aliases: ["twitter"],
    hosts: ["x.com", "twitter.com"],
    base: "https://x.com/",
    color: null,
  },
  facebook: {
    name: "Facebook",
    Icon: FaFacebookF,
    aliases: ["fb"],
    hosts: ["facebook.com", "fb.com"],
    base: "https://www.facebook.com/",
    color: "#1877F2",
  },
  instagram: {
    name: "Instagram",
    Icon: FaInstagram,
    hosts: ["instagram.com"],
    base: "https://www.instagram.com/",
    color: "#E4405F",
  },
  youtube: {
    name: "YouTube",
    Icon: FaYoutube,
    hosts: ["youtube.com", "youtu.be"],
    base: "https://www.youtube.com/@",
    color: "#FF0000",
  },
  tiktok: {
    name: "TikTok",
    Icon: FaTiktok,
    hosts: ["tiktok.com"],
    base: "https://www.tiktok.com/@",
    color: null,
  },
  whatsapp: {
    name: "WhatsApp",
    Icon: FaWhatsapp,
    hosts: ["wa.me", "whatsapp.com"],
    color: "#25D366",
  },
  telegram: {
    name: "Telegram",
    Icon: FaTelegram,
    hosts: ["t.me", "telegram.me"],
    base: "https://t.me/",
    color: "#26A5E4",
  },
  discord: {
    name: "Discord",
    Icon: FaDiscord,
    hosts: ["discord.gg", "discord.com"],
    color: "#5865F2",
  },
  dribbble: {
    name: "Dribbble",
    Icon: FaDribbble,
    hosts: ["dribbble.com"],
    base: "https://dribbble.com/",
    color: "#EA4C89",
  },
  behance: {
    name: "Behance",
    Icon: FaBehance,
    hosts: ["behance.net"],
    base: "https://www.behance.net/",
    color: "#1769FF",
  },
  medium: {
    name: "Medium",
    Icon: FaMedium,
    hosts: ["medium.com"],
    base: "https://medium.com/@",
    color: null,
  },
  stackoverflow: {
    name: "Stack Overflow",
    Icon: FaStackOverflow,
    hosts: ["stackoverflow.com"],
    color: "#F48024",
  },
  codepen: {
    name: "CodePen",
    Icon: FaCodepen,
    hosts: ["codepen.io"],
    base: "https://codepen.io/",
    color: null,
  },
  email: {
    name: "Email",
    Icon: FaEnvelope,
    aliases: ["mail", "gmail"],
    color: null,
  },
  phone: {
    name: "Phone",
    Icon: FaPhone,
    aliases: ["tel", "mobile", "call"],
    color: null,
  },
  website: {
    name: "Website",
    Icon: FaGlobe,
    aliases: ["site", "portfolio", "web", "url", "link"],
    color: null,
  },
};

const ORDER = Object.keys(PLATFORMS);

const normKey = (key) =>
  String(key ?? "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");

function idFromKey(key) {
  const k = normKey(key);
  if (!k) return null;
  return (
    ORDER.find((id) => id === k || PLATFORMS[id].aliases?.includes(k)) ?? null
  );
}

function hostOf(href) {
  try {
    return new URL(href).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function idFromHref(href) {
  if (/^mailto:/i.test(href)) return "email";
  if (/^tel:/i.test(href)) return "phone";
  const host = hostOf(href);
  if (!host) return null;
  return (
    ORDER.find((id) =>
      PLATFORMS[id].hosts?.some((h) => host === h || host.endsWith(`.${h}`)),
    ) ?? null
  );
}

/** Value + key se safe href banata hai. Sirf http(s), mailto, tel allow hain. */
function resolveHref(keyId, raw) {
  const value = clean(raw);
  if (!value) return null;

  if (/^(https?:\/\/|mailto:|tel:)/i.test(value)) return value;

  if (keyId === "whatsapp" && /^\+?[\d\s()-]{7,}$/.test(value)) {
    return `https://wa.me/${value.replace(/\D/g, "")}`;
  }
  if (keyId === "phone" && /^\+?[\d\s()-]{5,}$/.test(value)) {
    return `tel:${value.replace(/[^\d+]/g, "")}`;
  }
  if (keyId === "email" && value.includes("@") && !/\s/.test(value)) {
    return `mailto:${value.replace(/^@/, "")}`;
  }

  // "@username" ya "username" aur key known platform ho to profile URL banao
  const platform = keyId ? PLATFORMS[keyId] : null;
  const looksLikeOwnDomain = platform?.hosts?.some((h) =>
    value.toLowerCase().includes(h),
  );
  if (platform?.base && !looksLikeOwnDomain && /^@?[\w.-]+$/.test(value)) {
    return `${platform.base}${value.replace(/^@/, "")}`;
  }

  if (value.includes("@") && !value.includes("/") && !/\s/.test(value)) {
    return `mailto:${value}`;
  }
  if (/^[\w-]+(\.[\w-]+)+(\/|$)/.test(value)) return `https://${value}`;
  return null;
}

/** Kisi bhi shape ke socials ko [{ id, href, name, Icon, color, display }] banata hai. */
export function normalizeSocials(raw) {
  if (!raw) return [];
  const entries = [];

  if (Array.isArray(raw)) {
    raw.forEach((item, index) => {
      if (typeof item === "string") {
        entries.push([`link-${index}`, item]);
      } else if (isPlainObject(item)) {
        const label = clean(
          item.platform ?? item.label ?? item.name ?? item.type ?? item.network,
        );
        entries.push([
          label || `link-${index}`,
          item.url ?? item.href ?? item.link ?? item.value ?? item.handle,
        ]);
      }
    });
  } else if (isPlainObject(raw)) {
    Object.entries(raw).forEach(([key, value]) => {
      if (isPlainObject(value)) {
        entries.push([
          key,
          value.url ?? value.href ?? value.link ?? value.value,
        ]);
      } else {
        entries.push([key, value]);
      }
    });
  }

  const seen = new Set();
  const list = [];

  for (const [key, value] of entries) {
    const href = resolveHref(idFromKey(key), value);
    if (!href || seen.has(href)) continue;
    seen.add(href);

    const id = idFromHref(href) ?? idFromKey(key) ?? "website";
    const platform = PLATFORMS[id];
    list.push({
      id,
      href,
      name: platform.name,
      Icon: platform.Icon,
      color: platform.color,
      display: href
        .replace(/^(https?:\/\/(www\.)?|mailto:|tel:)/i, "")
        .replace(/\/$/, ""),
    });
  }

  // Stable order: known platforms PLATFORMS ke order me, baqi last
  return list.sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
}

/** getSiteSettings() ke result se headline, bio aur socials nikalta hai. */
export function getPublicProfile(settings) {
  const root = isPlainObject(settings) ? settings : {};
  const profile = isPlainObject(root.profile) ? root.profile : root;

  const headline = clean(
    profile.headline ??
      profile.title ??
      profile.tagline ??
      findDeep(root, ["headline", "tagline"]),
  );
  const bio = clean(
    profile.bio ?? profile.about ?? findDeep(root, ["bio", "about"]),
  );

  let rawSocials =
    findDeep(profile, ["socials", "social", "socialLinks", "links"]) ??
    findDeep(root, ["socials", "social", "socialLinks", "links"]);

  if (!hasContent(rawSocials)) {
    const direct = Object.fromEntries(
      ORDER.filter((key) => clean(profile[key])).map((key) => [
        key,
        profile[key],
      ]),
    );
    rawSocials = Object.keys(direct).length > 0 ? direct : null;
  }

  const socials = normalizeSocials(rawSocials);

  if (
    process.env.NODE_ENV !== "production" &&
    !headline &&
    !bio &&
    socials.length === 0
  ) {
    console.warn(
      "[profile] Nothing found. settings keys:",
      Object.keys(root),
      "profile keys:",
      Object.keys(profile),
    );
  }

  return { headline, bio, socials: socials.length > 0 ? socials : null };
}

/* -------------------------------------------------------------------------- */
/*  UI                                                                        */
/* -------------------------------------------------------------------------- */

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const hoverBase =
  "transition-all duration-200 motion-reduce:transition-none motion-safe:hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary hover:shadow-md";

// Brand colour sirf hover par, aur sirf jab color diya ho
const brandHover = "hover:border-[var(--brand)] hover:text-[var(--brand)]";

function linkProps(href) {
  const external = /^https?:\/\//i.test(href);
  return {
    external,
    attrs: external ? { target: "_blank", rel: "noopener noreferrer" } : {},
  };
}

/**
 * Social links. Server component, koi hook nahi.
 * variant: "icons" (default) | "pills" (icon + naam) | "list" (naam + handle)
 * size: "md" | "lg"   brand: hover par platform ka rang
 */
export function SocialRow({
  socials,
  variant = "icons",
  size = "md",
  brand = true,
  className,
}) {
  if (!socials || socials.length === 0) return null;

  if (variant === "list") {
    return (
      <ul
        aria-label="Social links"
        className={cn("flex flex-col gap-2", className)}
      >
        {socials.map(({ href, name, Icon, color, display }) => {
          const { external, attrs } = linkProps(href);
          return (
            <li key={href}>
              <a
                href={href}
                {...attrs}
                style={brand && color ? { "--brand": color } : undefined}
                className={cn(
                  "group/social flex min-h-12 items-center gap-3 rounded-xl border border-border bg-card px-3 text-sm text-muted-foreground",
                  hoverBase,
                  brand && color && brandHover,
                  focusRing,
                )}
              >
                <span
                  aria-hidden="true"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                >
                  <Icon className="size-4" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-medium text-foreground">{name}</span>
                  <span className="truncate text-xs">{display}</span>
                </span>
                <FiArrowUpRight
                  aria-hidden="true"
                  className="size-4 shrink-0 -translate-x-1 translate-y-1 opacity-0 transition-all duration-200 group-hover/social:translate-x-0 group-hover/social:translate-y-0 group-hover/social:opacity-100 motion-reduce:transition-none"
                />
                {external ? (
                  <span className="sr-only"> (opens in a new tab)</span>
                ) : null}
              </a>
            </li>
          );
        })}
      </ul>
    );
  }

  if (variant === "pills") {
    return (
      <ul
        aria-label="Social links"
        className={cn("flex flex-wrap gap-2", className)}
      >
        {socials.map(({ href, name, Icon, color }) => {
          const { external, attrs } = linkProps(href);
          return (
            <li key={href}>
              <a
                href={href}
                {...attrs}
                style={brand && color ? { "--brand": color } : undefined}
                className={cn(
                  "group/social inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-muted-foreground",
                  hoverBase,
                  brand && color && brandHover,
                  focusRing,
                )}
              >
                <Icon aria-hidden="true" className="size-4" />
                {name}
                <FiArrowUpRight
                  aria-hidden="true"
                  className="-ml-1 size-3.5 w-0 opacity-0 transition-all duration-200 group-hover/social:ml-0 group-hover/social:w-3.5 group-hover/social:opacity-100 motion-reduce:transition-none"
                />
                {external ? (
                  <span className="sr-only"> (opens in a new tab)</span>
                ) : null}
              </a>
            </li>
          );
        })}
      </ul>
    );
  }

  // icons
  const box = size === "lg" ? "size-12" : "size-11";
  const glyph = size === "lg" ? "size-5" : "size-[18px]";

  return (
    <ul
      aria-label="Social links"
      className={cn("flex flex-wrap gap-2", className)}
    >
      {socials.map(({ href, name, Icon, color }) => {
        const { external, attrs } = linkProps(href);
        return (
          <li key={href} className="relative">
            <a
              href={href}
              {...attrs}
              style={brand && color ? { "--brand": color } : undefined}
              className={cn(
                "group/social relative inline-flex items-center justify-center rounded-xl border border-border bg-card text-muted-foreground",
                box,
                hoverBase,
                brand && color && brandHover,
                focusRing,
              )}
            >
              <Icon aria-hidden="true" className={glyph} />
              <FiArrowUpRight
                aria-hidden="true"
                className="absolute top-1 right-1 size-3 -translate-x-1 translate-y-1 opacity-0 transition-all duration-200 group-hover/social:translate-x-0 group-hover/social:translate-y-0 group-hover/social:opacity-100 motion-reduce:transition-none"
              />
              {/* Tooltip: sirf visual, screen reader ko sr-only naam milta hai */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-9 left-1/2 hidden -translate-x-1/2 rounded-md bg-foreground px-2 py-1 text-xs font-medium whitespace-nowrap text-background opacity-0 transition-opacity duration-150 group-hover/social:opacity-100 group-focus-visible/social:opacity-100 sm:block motion-reduce:transition-none"
              >
                {name}
              </span>
              <span className="sr-only">
                {name}
                {external ? " (opens in a new tab)" : ""}
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
