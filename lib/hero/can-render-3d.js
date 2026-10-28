/**
 * Whether the decorative hero scene should load.
 * CTA and copy must stay usable even when this returns false.
 *
 * @param {{
 *   prefersReducedMotion?: boolean,
 *   saveData?: boolean,
 *   deviceMemory?: number,
 *   hardwareConcurrency?: number,
 *   hasWebGL?: boolean,
 * }} input
 */
export function canRenderHero3D({
  prefersReducedMotion = false,
  saveData = false,
  deviceMemory,
  hardwareConcurrency,
  hasWebGL = false,
} = {}) {
  if (prefersReducedMotion || saveData || !hasWebGL) return false;
  if (typeof deviceMemory === "number" && deviceMemory <= 2) return false;
  if (typeof hardwareConcurrency === "number" && hardwareConcurrency <= 2) {
    return false;
  }
  return true;
}
