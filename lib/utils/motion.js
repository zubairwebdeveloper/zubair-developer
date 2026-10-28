/**
 * Shared motion utilities (pure functions).
 * Easing curves, durations, and variant helpers.
 */

/**
 * Smooth confidence curve (ease-out-expo-like)
 */
export const EASE_SMOOTH = [0.22, 1, 0.36, 1];

/**
 * Quick snappy curve
 */
export const EASE_SNAPPY = [0.25, 0.1, 0.25, 1];

/**
 * Gentle curve
 */
export const EASE_GENTLE = [0.4, 0, 0.2, 1];

/**
 * Standard durations (in seconds)
 */
export const DURATION = {
  fast: 0.2,
  normal: 0.4,
  slow: 0.6,
  verySlow: 1,
};

/**
 * Direction presets for Reveal/Stagger
 */
export const DIRECTION_PRESETS = {
  up: { y: 16, x: 0, scale: 1 },
  down: { y: -16, x: 0, scale: 1 },
  left: { y: 0, x: 16, scale: 1 },
  right: { y: 0, x: -16, scale: 1 },
  scale: { y: 0, x: 0, scale: 0.96 },
  fade: { y: 0, x: 0, scale: 1 },
};

/**
 * Clamp a value between min and max
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation
 */
export function lerp(start, end, t) {
  return start + (end - start) * t;
}

/**
 * Map a value from one range to another
 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
  return lerp(outMin, outMax, (value - inMin) / (inMax - inMin));
}

/**
 * Create spring config for motion/react
 */
export function springConfig(stiffness = 260, damping = 20, mass = 0.4) {
  return { stiffness, damping, mass };
}

/**
 * Check if a value is between two numbers (inclusive)
 */
export function inRange(value, min, max) {
  return value >= min && value <= max;
}
