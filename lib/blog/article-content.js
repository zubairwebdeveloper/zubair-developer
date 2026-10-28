function headingId(value, usedIds) {
  const base =
    value
      .normalize("NFKD")
      .toLowerCase()
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "section";
  let id = base;
  let suffix = 2;
  while (usedIds.has(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  usedIds.add(id);
  return id;
}

export function parseArticleContent(content) {
  const usedIds = new Set();
  return String(content ?? "")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const match = block.match(/^(#{2,3})\s+(.+)$/);
      if (!match) return { type: "paragraph", text: block };

      const title = match[2].trim();
      return {
        type: match[1].length === 2 ? "heading" : "subheading",
        id: headingId(title, usedIds),
        title,
      };
    });
}
