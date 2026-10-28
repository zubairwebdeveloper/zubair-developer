import { describe, expect, it } from "vitest";

import { parseArticleContent } from "@/lib/blog/article-content";

describe("parseArticleContent", () => {
  it("extracts safe h2 and h3 headings for the article outline", () => {
    expect(
      parseArticleContent(
        "Intro text.\n\n## Building the site\n\n### Form validation\n\nClosing note.",
      ),
    ).toEqual([
      { type: "paragraph", text: "Intro text." },
      { type: "heading", id: "building-the-site", title: "Building the site" },
      { type: "subheading", id: "form-validation", title: "Form validation" },
      { type: "paragraph", text: "Closing note." },
    ]);
  });

  it("creates unique anchor IDs for repeated headings", () => {
    const blocks = parseArticleContent("## Results\n\n## Results");

    expect(blocks.map((block) => block.id)).toEqual(["results", "results-2"]);
  });

  it("keeps raw HTML as plain text", () => {
    expect(parseArticleContent("<script>alert(1)</script>")).toEqual([
      { type: "paragraph", text: "<script>alert(1)</script>" },
    ]);
  });
});
