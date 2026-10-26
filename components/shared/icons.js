import { createElement } from "react";
import {
  FiCode,
  FiCpu,
  FiDatabase,
  FiGlobe,
  FiLayers,
  FiMessageSquare,
  FiSearch,
  FiSettings,
  FiShield,
  FiShoppingCart,
  FiSmartphone,
  FiZap,
} from "react-icons/fi";

/**
 * Icon map for services, plans and categories.
 * Add a new service icon here and every card that uses `service.icon` can show it.
 */
export const serviceIcons = {
  // Original keys (unchanged)
  web: FiCode,
  saas: FiLayers,
  chat: FiMessageSquare,
  ai: FiCpu,

  // New keys
  store: FiShoppingCart,
  mobile: FiSmartphone,
  backend: FiDatabase,
  seo: FiSearch,
  performance: FiZap,
  security: FiShield,
  automation: FiSettings,
  site: FiGlobe,
};

/** Alternative names that point to an existing icon, so data like "chatbot" still works. */
const ALIASES = {
  "web-development": "web",
  website: "web",
  frontend: "web",
  fullstack: "web",
  "full-stack": "web",
  app: "saas",
  software: "saas",
  chatbot: "chat",
  "chatbot-automation": "chat",
  "ai-chatbot": "chat",
  bot: "chat",
  ml: "ai",
  ecommerce: "store",
  "e-commerce": "store",
  shop: "store",
  api: "backend",
  database: "backend",
  speed: "performance",
  workflow: "automation",
  maintenance: "automation",
  landing: "site",
};

const DEFAULT_ICON = "web";

/** All icon keys, handy for admin dropdowns or validation. */
export const serviceIconKeys = Object.keys(serviceIcons);

/**
 * Safe lookup. Handles unknown keys, different casing, spaces and aliases,
 * and always returns a component. Use it outside JSX
 * (for JSX use renderServiceIcon below).
 */
export function getServiceIcon(key) {
  if (typeof key !== "string") return serviceIcons[DEFAULT_ICON];

  const normalized = key
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");

  return (
    serviceIcons[normalized] ??
    serviceIcons[ALIASES[normalized]] ??
    serviceIcons[DEFAULT_ICON]
  );
}

/**
 * Returns a ready-made icon ELEMENT, so nothing creates a component during render.
 *
 * Usage: {renderServiceIcon(service.icon, { className: "size-5" })}
 */
export function renderServiceIcon(key, props) {
  return createElement(getServiceIcon(key), props);
}
