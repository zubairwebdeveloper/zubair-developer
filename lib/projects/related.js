/** Same category (+3) aur har shared technology (+1). Score 0 wale related nahi maane jate. */
export function rankRelated(current, all, limit = 3) {
  const tech = new Set(
    (current.technologies ?? []).map((item) => item.toLowerCase()),
  );

  return all
    .filter((project) => project.slug !== current.slug)
    .map((project) => {
      let score = project.category === current.category ? 3 : 0;
      (project.technologies ?? []).forEach((item) => {
        if (tech.has(item.toLowerCase())) score += 1;
      });
      return { project, score };
    })
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score || (a.project.order ?? 0) - (b.project.order ?? 0),
    )
    .slice(0, limit)
    .map((entry) => entry.project);
}
