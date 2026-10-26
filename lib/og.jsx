import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site";

export function renderOg({ eyebrow, title }) {
  const text = String(title).slice(0, 90);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#101116",
        color: "#F4F4F5",
        padding: 72,
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 28,
          color: "#FACC15",
          letterSpacing: 4,
          textTransform: "uppercase",
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: text.length > 60 ? 54 : 70,
          fontWeight: 700,
          lineHeight: 1.1,
        }}
      >
        {text}
      </div>
      <div style={{ display: "flex", fontSize: 30, color: "#A78BFA" }}>
        {siteConfig.name}
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
