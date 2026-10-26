import { ProcessSection } from "@/components/home/ProcessSection";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata = {
  title: "Process",
  description: "How a project goes from discovery to delivery.",
  alternates: { canonical: "/process" },
};

export default function ProcessPage() {
  return (
    <>
      <PageHeader
        eyebrow="Process"
        title="How we work together"
        description="A clear workflow from first call to handover."
      />
      <ProcessSection showHeading={false} />
    </>
  );
}
