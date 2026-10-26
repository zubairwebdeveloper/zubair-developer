import { renderOg } from "@/lib/og";

export const alt = "Zubair Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOg({
    eyebrow: "Full Stack · SaaS · AI Automation",
    title: "Building digital products that move businesses forward.",
  });
}
