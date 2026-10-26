// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { FaqAccordion } from "@/components/faq/FaqAccordion";

const faqs = [
  {
    id: "1",
    question: "Are the listed prices final?",
    answer: "They are starting prices.",
  },
  {
    id: "2",
    question: "How do I start a project?",
    answer: "Use the project form.",
  },
];

describe("FaqAccordion", () => {
  it("filters questions by search text", async () => {
    const user = userEvent.setup();
    render(<FaqAccordion faqs={faqs} searchable />);

    await user.type(
      screen.getByRole("searchbox", {
        name: /search frequently asked questions/i,
      }),
      "start a project",
    );

    expect(screen.getByText("How do I start a project?")).toBeInTheDocument();
    expect(
      screen.queryByText("Are the listed prices final?"),
    ).not.toBeInTheDocument();
  });

  it("shows an empty state when nothing matches", async () => {
    const user = userEvent.setup();
    render(<FaqAccordion faqs={faqs} searchable />);

    await user.type(screen.getByRole("searchbox"), "zzzz");
    expect(screen.getByText("No matching questions")).toBeInTheDocument();
  });
});
