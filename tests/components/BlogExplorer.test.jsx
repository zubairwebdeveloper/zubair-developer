// @vitest-environment jsdom
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/blog/PostCard", () => ({
  PostCard: ({ post }) => <article>{post.title}</article>,
}));

import { BlogExplorer } from "@/components/blog/BlogExplorer";

const posts = [
  {
    slug: "web",
    title: "Building a website",
    excerpt: "A practical guide to websites.",
    publishedAt: "2026-03-01",
    tags: ["Web", "Performance"],
  },
  {
    slug: "automation",
    title: "Chatbot automation",
    excerpt: "A practical guide to automation.",
    publishedAt: "2026-02-01",
    tags: ["Chatbots"],
  },
];

describe("BlogExplorer", () => {
  it("filters published posts by their tags", async () => {
    const user = userEvent.setup();
    render(<BlogExplorer posts={posts} />);

    await user.click(screen.getByRole("button", { name: "Web" }));

    expect(screen.getByText("Building a website")).toBeInTheDocument();
    await waitForElementToBeRemoved(() =>
      screen.queryByText("Chatbot automation"),
    );
  });

  it("includes tags in search and can reset all filters", async () => {
    const user = userEvent.setup();
    render(<BlogExplorer posts={posts} />);

    await user.type(screen.getByRole("searchbox"), "performance");
    expect(screen.getByText("Building a website")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Chatbots" }));
    await screen.findByRole("button", { name: "Clear filters" });
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    await waitFor(() =>
      expect(screen.getByText("Chatbot automation")).toBeInTheDocument(),
    );
  });
});
