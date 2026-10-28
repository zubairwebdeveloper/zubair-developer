import {
  Bot,
  CreditCard,
  Gauge,
  LayoutDashboard,
  Plug2,
  Search,
  ShieldCheck,
  Workflow,
} from "lucide-react";

import { TiltCard } from "@/components/motion/TiltCard";
import { Reveal } from "@/components/shared/Reveal";
import { Section } from "@/components/shared/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";

const CAPABILITIES = [
  {
    id: "authentication",
    icon: ShieldCheck,
    title: "Authentication",
    description:
      "Give each user a secure, appropriate way into your product with sign-in and role-based access.",
    size: "lg:col-span-2 lg:row-span-2",
    visual: "authentication",
  },
  {
    id: "dashboards",
    icon: LayoutDashboard,
    title: "Dashboards",
    description:
      "Bring the data and controls your team needs into one clear workspace.",
    size: "lg:col-span-1",
    visual: "dashboard",
  },
  {
    id: "payments",
    icon: CreditCard,
    title: "Payments",
    description:
      "Let customers review their order and complete checkout through a flow matched to your business.",
    size: "lg:col-span-1",
    visual: "payments",
  },
  {
    id: "apis",
    icon: Plug2,
    title: "APIs",
    description:
      "Connect your product to the services and systems already part of your workflow.",
    size: "lg:col-span-1",
    visual: "apis",
  },
  {
    id: "automation",
    icon: Workflow,
    title: "Automation",
    description:
      "Reduce repeated message handling with clear conversation and handoff flows.",
    size: "lg:col-span-2",
    visual: "automation",
  },
  {
    id: "assistants",
    icon: Bot,
    title: "AI Assistants",
    description:
      "Help visitors find answers using approved information, with a path to a person when needed.",
    size: "lg:col-span-1",
    visual: "assistant",
  },
  {
    id: "seo-performance",
    icon: Search,
    secondaryIcon: Gauge,
    title: "SEO & Performance",
    description:
      "Make pages easier to discover and use with semantic structure and practical performance care.",
    size: "lg:col-span-2",
    visual: "performance",
  },
];

function MiniVisual({ type }) {
  if (type === "authentication") {
    return (
      <div className="mx-auto max-w-56 rounded-xl border border-border bg-background/80 p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck aria-hidden="true" className="size-4" />
          </span>
          <span className="h-2 w-20 rounded-full bg-muted-foreground/20" />
        </div>
        <div className="h-7 rounded-md border border-border bg-muted/40" />
        <div className="mt-2 h-7 rounded-md border border-border bg-muted/40" />
        <div className="mt-3 h-7 rounded-md bg-primary/70" />
      </div>
    );
  }

  if (type === "dashboard") {
    return (
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="rounded-lg border border-border bg-background/80 p-2"
          >
            <div className="h-1.5 w-1/2 rounded-full bg-muted-foreground/20" />
            <div className="mt-3 h-5 rounded bg-primary/10" />
          </div>
        ))}
        <div className="col-span-3 flex h-12 items-end gap-1 rounded-lg border border-border bg-background/80 p-2">
          {[35, 55, 42, 75, 58, 90, 68].map((height, index) => (
            <span
              key={index}
              className="flex-1 rounded-t bg-primary/50 motion-safe:animate-pulse"
              style={{ height: `${height}%`, animationDelay: `${index * 80}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (type === "payments") {
    return (
      <div className="mx-auto flex max-w-52 items-center gap-3 rounded-xl border border-border bg-background/80 p-3">
        <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
          <CreditCard aria-hidden="true" className="size-4" />
        </span>
        <div className="flex-1 space-y-2">
          <div className="h-2 w-4/5 rounded-full bg-muted-foreground/20" />
          <div className="h-5 rounded bg-primary/30" />
        </div>
      </div>
    );
  }

  if (type === "apis") {
    return (
      <div className="flex items-center justify-center gap-2">
        <span className="rounded-lg border border-border bg-background/80 px-2 py-2 text-[10px] font-medium">
          APP
        </span>
        <span className="h-px w-8 bg-primary/60 motion-safe:animate-pulse" />
        <Plug2 aria-hidden="true" className="size-5 text-primary" />
        <span className="h-px w-8 bg-primary/60 motion-safe:animate-pulse" />
        <span className="rounded-lg border border-border bg-background/80 px-2 py-2 text-[10px] font-medium">
          TOOLS
        </span>
      </div>
    );
  }

  if (type === "automation") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2">
        {["Message", "Flow", "Handoff"].map((item, index) => (
          <span key={item} className="flex items-center gap-2">
            <span className="rounded-lg border border-border bg-background/80 px-3 py-2 text-xs">
              {item}
            </span>
            {index < 2 ? (
              <span className="text-primary motion-safe:animate-pulse">→</span>
            ) : null}
          </span>
        ))}
      </div>
    );
  }

  if (type === "assistant") {
    return (
      <div className="mx-auto flex max-w-52 flex-col gap-2">
        <span className="w-fit rounded-xl rounded-bl-sm border border-border bg-background/80 px-3 py-2 text-xs">
          How can I help?
        </span>
        <span className="ml-auto w-fit rounded-xl rounded-br-sm bg-primary/15 px-3 py-2 text-xs">
          Find an answer
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3">
      <Gauge aria-hidden="true" className="size-6 text-primary" />
      <span className="h-1.5 w-28 overflow-hidden rounded-full bg-muted">
        <span className="block h-full w-2/3 rounded-full bg-primary motion-safe:animate-pulse" />
      </span>
      <Search aria-hidden="true" className="size-5 text-muted-foreground" />
    </div>
  );
}

function BentoCard({ capability, index }) {
  const Icon = capability.icon;
  const SecondaryIcon = capability.secondaryIcon;

  return (
    <Reveal delay={Math.min(index * 0.05, 0.3)} className={capability.size}>
      <TiltCard>
        <article className="group relative flex h-full min-h-64 flex-col justify-between gap-5 overflow-hidden rounded-2xl border border-border bg-card p-5 transition-colors duration-200 hover:border-primary/40 sm:p-6">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-primary/10 blur-3xl transition-opacity duration-300 group-hover:opacity-100"
          />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex flex-col gap-3">
              <span
                aria-hidden="true"
                className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20"
              >
                <Icon className="size-5" />
              </span>
              <h3 className="text-card-title text-foreground">
                {capability.title}
              </h3>
            </div>
            {SecondaryIcon ? (
              <SecondaryIcon
                aria-hidden="true"
                className="size-5 text-muted-foreground"
              />
            ) : null}
          </div>
          <div
            aria-hidden="true"
            className="relative rounded-xl border border-border/70 bg-muted/30 p-4"
          >
            <MiniVisual type={capability.visual} />
          </div>
          <p className="relative text-sm leading-relaxed text-muted-foreground">
            {capability.description}
          </p>
        </article>
      </TiltCard>
    </Reveal>
  );
}

export function CapabilitiesBento() {
  return (
    <Section className="bg-muted/40">
      <SectionHeading
        eyebrow="Capabilities"
        title="The building blocks behind a useful product."
        description="A considered mix of product features and quality foundations, chosen for your goals."
      />

      <div className="mt-10 grid gap-4 sm:mt-12 md:grid-cols-2 lg:grid-cols-4 lg:auto-rows-fr">
        {CAPABILITIES.map((capability, index) => (
          <BentoCard
            key={capability.id}
            capability={capability}
            index={index}
          />
        ))}
      </div>
    </Section>
  );
}
