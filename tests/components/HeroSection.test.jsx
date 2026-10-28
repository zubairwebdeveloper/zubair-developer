// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("@/components/home/AnimatedHeadline", () => ({
  AnimatedHeadline: ({ id, lead, accent, className }) => (
    <h1 id={id} className={className}>
      {lead.join(" ")} {accent}
    </h1>
  ),
}));
vi.mock("@/components/home/HeroVisual", () => ({
  HeroVisual: () => <div aria-label="What I build visual" />,
}));
vi.mock("@/components/home/RotatingWords", () => ({
  RotatingWords: () => <span>websites</span>,
}));
vi.mock("@/components/home/hero/HeroScrollCue", () => ({
  HeroScrollCue: () => <a href="#what-i-do">Scroll to explore</a>,
}));
vi.mock("@/components/motion/Magnetic", () => ({
  Magnetic: ({ children }) => children,
}));
vi.mock("@/components/shared/Reveal", () => ({
  Reveal: ({ children, className }) => <div className={className}>{children}</div>,
}));
vi.mock("@/components/layout/CopyEmailButton", () => ({
  CopyEmailButton: () => null,
}));
vi.mock("@/lib/profile/public-profile", () => ({
  SocialRow: () => null,
}));

import { HeroSection } from "@/components/home/HeroSection";

describe("HeroSection", () => {
  it("renders a single useful heading and working primary, work, demo, and service links", () => {
    render(
      <HeroSection
        services={[
          { category: "web-development", slug: "business-websites" },
          { category: "chatbot-automation", slug: "chatbot-automation" },
        ]}
        plans={[
          { category: "web", price: 99, currency: "USD" },
          { category: "automation", price: 99, currency: "USD" },
        ]}
      />,
    );

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: /websites and chatbots/i })).toHaveAttribute(
      "id",
      "hero-title",
    );
    expect(screen.getByRole("link", { name: "Start a Project" })).toHaveAttribute(
      "href",
      "/hire-me",
    );
    expect(screen.getByRole("link", { name: "See My Work" })).toHaveAttribute(
      "href",
      "/projects",
    );
    expect(
      screen.getByRole("link", { name: "Watch the chatbot demo" }),
    ).toHaveAttribute("href", "#chatbot-demo");
    expect(
      screen.getByRole("link", { name: "Explore Full Stack Web services" }),
    ).toHaveAttribute("href", "/services/business-websites");
    expect(
      screen.getByRole("link", { name: "Explore Chatbot & Automation services" }),
    ).toHaveAttribute("href", "/services/chatbot-automation");
  });

  it("does not render an availability status when none is supplied", () => {
    render(<HeroSection />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
