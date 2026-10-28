import { WhatIDoShowcase } from "@/components/home/WhatIDoShowcase";
import { getServices } from "@/services/services.service";

export async function WhatIDo() {
  const services = await getServices();
  const serviceLinks = {
    web:
      services.find((service) => service.category === "web-development")?.slug ??
      null,
    automation:
      services.find((service) =>
        ["chatbot-automation", "ai-assistant"].includes(service.category),
      )?.slug ?? null,
  };

  return <WhatIDoShowcase serviceLinks={serviceLinks} />;
}
