import { ProjectBriefBuilder } from "@/components/home/ProjectBriefBuilder";
import { Reveal } from "@/components/shared/Reveal";
import { Section } from "@/components/shared/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";

export function BriefSection() {
  return (
    <Section className="bg-muted/40">
      <SectionHeading
        eyebrow="Plan your project"
        title="Shape your idea in two minutes"
        description="Answer a few questions and get a clear brief you can send with your quote request."
      />
      <Reveal delay={0.06}>
        <div className="mt-10 sm:mt-12">
          <ProjectBriefBuilder />
        </div>
      </Reveal>
    </Section>
  );
}
