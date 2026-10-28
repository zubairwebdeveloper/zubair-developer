// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ShowcaseTabs } from "@/components/home/hero-visual/ShowcaseTabs";

describe("ShowcaseTabs", () => {
  it("exposes tab relationships and moves selection with keyboard arrows", () => {
    const onSelect = vi.fn();
    render(
      <ShowcaseTabs
        activeIndex={0}
        onSelect={onSelect}
        reducedMotion={false}
        cycling={false}
      />,
    );

    const frontend = screen.getByRole("tab", { name: "Frontend" });
    const backend = screen.getByRole("tab", { name: "Backend" });
    expect(frontend).toHaveAttribute("aria-selected", "true");
    expect(frontend).toHaveAttribute("aria-controls", "hero-showcase-panel");
    expect(backend).toHaveAttribute("aria-selected", "false");

    fireEvent.keyDown(frontend, { key: "ArrowLeft" });
    expect(onSelect).toHaveBeenCalledWith(3, { user: true });
    expect(screen.getByRole("tab", { name: "Automation" })).toHaveFocus();
  });

  it("does not render an auto-cycle progress indicator when reduced motion is enabled", () => {
    render(
      <ShowcaseTabs
        activeIndex={0}
        onSelect={vi.fn()}
        reducedMotion
        cycling={false}
      />,
    );

    expect(
      screen
        .getByRole("tab", { name: "Frontend" })
        .querySelector('[data-slot="auto-cycle-progress"]'),
    ).not.toBeInTheDocument();
  });
});
