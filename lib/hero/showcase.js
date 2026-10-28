export const SHOWCASE_TABS = [
  {
    id: "frontend",
    label: "Frontend",
    caption: "Fast, responsive interfaces that convert",
    technologies: ["Next.js", "React", "Tailwind", "Motion"],
  },
  {
    id: "backend",
    label: "Backend",
    caption: "Secure APIs, auth and data behind the scenes",
    technologies: ["Node", "Firebase", "Auth", "REST APIs"],
  },
  {
    id: "chatbot",
    label: "Chatbot",
    caption: "Instagram DM bots that capture leads while you sleep",
    technologies: ["ManyChat", "Instagram DM", "Messenger", "AI assistant"],
  },
  {
    id: "automation",
    label: "Automation",
    caption: "From comment to lead in your sheet, automatically",
    technologies: ["Google Sheets", "CRM", "Webhooks"],
  },
];

export function getNextTabIndex(current, total, direction = 1) {
  if (!Number.isInteger(total) || total < 1) return -1;
  const index = Number.isInteger(current) ? current : 0;
  return ((index + direction) % total + total) % total;
}

export function getKeyboardTabIndex(key, current, total) {
  if (!Number.isInteger(total) || total < 1) return -1;
  if (key === "Home") return 0;
  if (key === "End") return total - 1;
  if (key === "ArrowRight" || key === "ArrowDown") {
    return getNextTabIndex(current, total);
  }
  if (key === "ArrowLeft" || key === "ArrowUp") {
    return getNextTabIndex(current, total, -1);
  }
  return null;
}

export function shouldAutoCycle({
  reducedMotion = false,
  hovered = false,
  focused = false,
  hidden = false,
  inView = false,
  userSelected = false,
} = {}) {
  return !(
    reducedMotion ||
    hovered ||
    focused ||
    hidden ||
    !inView ||
    userSelected
  );
}

export function isValidShowcaseTabs(tabs = SHOWCASE_TABS) {
  if (!Array.isArray(tabs) || tabs.length === 0) return false;
  const ids = new Set();

  return tabs.every((tab) => {
    if (
      !tab ||
      typeof tab.id !== "string" ||
      !tab.id.trim() ||
      ids.has(tab.id) ||
      typeof tab.label !== "string" ||
      !tab.label.trim() ||
      typeof tab.caption !== "string" ||
      !tab.caption.trim() ||
      !Array.isArray(tab.technologies) ||
      tab.technologies.some(
        (technology) =>
          typeof technology !== "string" || !technology.trim(),
      )
    ) {
      return false;
    }

    ids.add(tab.id);
    return true;
  });
}
