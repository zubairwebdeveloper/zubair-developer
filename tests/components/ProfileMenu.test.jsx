// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: mocks.push, refresh: vi.fn() }),
}));
vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));
vi.mock("@/components/layout/CommandPalette", () => ({
  OPEN_PALETTE_EVENT: "open-command-palette",
}));

import { ProfileMenu } from "@/components/layout/ProfileMenu";

const profile = { name: "Zubair Developer", email: "hello@example.com" };

describe("ProfileMenu", () => {
  beforeEach(() => mocks.push.mockClear());

  it("does not show the dashboard action without verified access", async () => {
    const user = userEvent.setup();
    render(<ProfileMenu user={profile} />);

    await user.click(screen.getByRole("button", { name: /account menu/i }));
    expect(
      screen.queryByRole("menuitem", { name: /admin dashboard/i }),
    ).not.toBeInTheDocument();
  });

  it("routes verified admins to the dashboard", async () => {
    const user = userEvent.setup();
    render(<ProfileMenu user={profile} canAccessDashboard />);

    await user.click(screen.getByRole("button", { name: /account menu/i }));
    const dashboardAction = await screen.findByRole("menuitem", {
      name: /admin dashboard/i,
    });

    await user.click(dashboardAction);
    expect(mocks.push).toHaveBeenCalledWith("/admin");
  });
});
