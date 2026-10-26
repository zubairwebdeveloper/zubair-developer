// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/pricing" }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { MobileNavigation } from "@/components/layout/MobileNavigation";

describe("MobileNavigation", () => {
  it("opens an accessible menu and marks the current page", async () => {
    const user = userEvent.setup();
    render(<MobileNavigation />);

    const trigger = screen.getByRole("button", {
      name: "Open navigation menu",
    });
    await user.click(trigger);

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pricing" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Services" })).not.toHaveAttribute(
      "aria-current",
    );
    expect(
      screen.getByRole("link", { name: "Start a Project" }),
    ).toHaveAttribute("href", "/hire-me");
  });

  it("closes after choosing a link", async () => {
    const user = userEvent.setup();
    render(<MobileNavigation />);

    await user.click(
      screen.getByRole("button", { name: "Open navigation menu" }),
    );
    await user.click(await screen.findByRole("link", { name: "About" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
