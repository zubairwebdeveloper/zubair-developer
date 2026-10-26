import { cn } from "@/lib/utils/cn";

const DEFAULT_ITEMS = [
  "React",
  "Next.js",
  "JavaScript",
  "Tailwind CSS",
  "Firebase",
  "Node.js",
  "Express",
  "MongoDB",
  "REST APIs",
  "AI integrations",
];

// Server component: koi JS nahi. Animation sirf CSS transform hai.
// items admin-managed skills se aa sakte hain, khali ho to default list.
export function TechMarquee({ items, className }) {
  const list = items?.length ? items : DEFAULT_ITEMS;

  const renderTrack = (hidden) => (
    <ul
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center gap-3 pr-3"
    >
      {list.map((item) => (
        <li
          key={item}
          className="whitespace-nowrap rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground"
        >
          {item}
        </li>
      ))}
    </ul>
  );

  return (
    <section
      aria-label="Technologies I work with"
      className={cn("tech-marquee border-y border-border py-5", className)}
    >
      <style>{`
        .tech-marquee-viewport {
          overflow: hidden;
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
          mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
        }
        .tech-marquee-track {
          display: flex;
          width: max-content;
          animation: tech-marquee 40s linear infinite;
        }
        .tech-marquee:hover .tech-marquee-track,
        .tech-marquee:focus-within .tech-marquee-track {
          animation-play-state: paused;
        }
        @keyframes tech-marquee {
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .tech-marquee-track { animation: none; flex-wrap: wrap; width: auto; }
          .tech-marquee-viewport { -webkit-mask-image: none; mask-image: none; }
        }
      `}</style>
      <div className="tech-marquee-viewport">
        <div className="tech-marquee-track">
          {renderTrack(false)}
          {renderTrack(true)}
        </div>
      </div>
    </section>
  );
}
