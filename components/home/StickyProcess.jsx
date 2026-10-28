// components/home/StickyProcess.jsx
// Server component — fetches process steps, passes to client sticky scroller.
// Falls back to null if no steps found.

import { Section } from "@/components/shared/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { getProcessSteps } from "@/services/content.service";
import { StickyProcessClient } from "./StickyProcessClient";

function normalizeStep(step, index) {
  return {
    id: String(step?.id ?? step?.title ?? index),
    title: step?.title ?? `Step ${index + 1}`,
    description: step?.description ?? "",
    duration: typeof step?.duration === "string" ? step.duration : null,
    outcome: typeof step?.outcome === "string" ? step.outcome : null,
    deliverables: Array.isArray(step?.deliverables)
      ? step.deliverables.filter((item) => typeof item === "string")
      : [],
  };
}

export async function StickyProcess() {
  let rawSteps = [];
  try {
    rawSteps = await getProcessSteps();
  } catch (err) {
    console.error("[StickyProcess] failed to load steps:", err);
    return null;
  }

  if (!Array.isArray(rawSteps) || rawSteps.length === 0) return null;

  const steps = rawSteps.map(normalizeStep);

  return (
    <Section id="process">
      <SectionHeading
        eyebrow="Process"
        title="From first message to launch."
        description="A predictable workflow so you always know what comes next."
      />
      <div className="mt-10 sm:mt-12">
        <StickyProcessClient steps={steps} />
      </div>
    </Section>
  );
}
