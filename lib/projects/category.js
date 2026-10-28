const CATEGORY_GROUPS = [
  { key: "web", label: "Web" },
  { key: "chatbot", label: "Chatbot" },
  { key: "saas", label: "SaaS" },
];

export function getProjectCategoryKey(category) {
  const value = typeof category === "string" ? category.trim().toLowerCase() : "";
  if (!value) return null;
  if (/chatbot|automation|messenger|ai-assistant/.test(value)) return "chatbot";
  if (/saas/.test(value)) return "saas";
  if (/web|website|e-?commerce|landing/.test(value)) return "web";
  return null;
}

export function getProjectCategoryGroups(projects) {
  const counts = new Map();
  for (const project of projects) {
    const key = getProjectCategoryKey(project.category);
    if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return CATEGORY_GROUPS.filter(({ key }) => counts.has(key)).map((group) => ({
    ...group,
    count: counts.get(group.key),
  }));
}
