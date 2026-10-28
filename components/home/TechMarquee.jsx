import {
  SiFirebase,
  SiGooglegemini,
  SiNextdotjs,
  SiNodedotjs,
  SiReact,
  SiTailwindcss,
} from "react-icons/si";
import { CircleDot, MessagesSquare, Workflow } from "lucide-react";

import { getTechStack } from "@/services/content.service";

const TECH_ICONS = {
  "Next.js": SiNextdotjs,
  React: SiReact,
  "Tailwind CSS": SiTailwindcss,
  Firebase: SiFirebase,
  "Node.js": SiNodedotjs,
  "Gemini API": SiGooglegemini,
  ManyChat: MessagesSquare,
  "REST APIs": Workflow,
};

function TechItems({ items, duplicate = false }) {
  return items.map((item, index) => {
    const Icon = TECH_ICONS[item.name] ?? CircleDot;
    return (
      <li
        key={`${item.name}-${duplicate ? "copy" : "item"}-${index}`}
        aria-hidden={duplicate ? "true" : undefined}
        className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground/85"
      >
        <Icon aria-hidden="true" className="size-4 text-primary" />
        {item.name}
      </li>
    );
  });
}

export async function TechMarquee() {
  const raw = await getTechStack();
  const stack = Array.isArray(raw) ? raw : [];
  const items = [
    ...new Map(
      stack
        .map((tech) => {
          const name = typeof tech === "string" ? tech.trim() : tech?.name?.trim();
          return name ? [name, { name }] : null;
        })
        .filter(Boolean),
    ).values(),
  ];

  if (items.length === 0) return null;

  return (
    <section
      aria-label="Technologies I work with"
      tabIndex={0}
      className="home-tech-marquee overflow-hidden border-y border-border/60 bg-muted/40 py-5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [mask-image:linear-gradient(90deg,transparent,black_5%,black_95%,transparent)]"
    >
      <style>{`
        .home-tech-marquee-lane {
          display: flex;
          width: max-content;
          animation: home-tech-marquee-scroll 36s linear infinite;
        }
        .home-tech-marquee-lane--reverse {
          animation-direction: reverse;
        }
        .home-tech-marquee:hover .home-tech-marquee-lane,
        .home-tech-marquee:focus-within .home-tech-marquee-lane {
          animation-play-state: paused;
        }
        @keyframes home-tech-marquee-scroll {
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .home-tech-marquee {
            overflow: visible;
            -webkit-mask-image: none;
            mask-image: none;
          }
          .home-tech-marquee-lane {
            width: auto;
            flex-wrap: wrap;
            animation: none;
          }
          .home-tech-marquee-lane > li[aria-hidden="true"] {
            display: none;
          }
        }
      `}</style>

      <div className="flex flex-col gap-3">
        {[items, [...items].reverse()].map((row, rowIndex) => (
          <ul
            key={rowIndex}
            className={`home-tech-marquee-lane gap-3 pr-3 ${
              rowIndex === 1 ? "home-tech-marquee-lane--reverse" : ""
            }`}
          >
            <TechItems items={row} />
            <TechItems items={row} duplicate />
          </ul>
        ))}
      </div>
    </section>
  );
}
