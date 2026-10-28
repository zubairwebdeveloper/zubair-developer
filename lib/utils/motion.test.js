/**
 * Unit tests for motion utilities.
 * Pure logic only - no DOM, no motion/react.
 */

import { describe, it, expect } from "vitest";
import { clamp, lerp, mapRange, inRange, springConfig } from "./motion.js";

describe("clamp", () => {
  it("clamps value between min and max", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe("lerp", () => {
  it("linearly interpolates between values", () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(lerp(0, 10, 0)).toBe(0);
    expect(lerp(0, 10, 1)).toBe(10);
  });
});

describe("mapRange", () => {
  it("maps value from one range to another", () => {
    expect(mapRange(5, 0, 10, 0, 100)).toBe(50);
    expect(mapRange(0, 0, 10, 0, 100)).toBe(0);
    expect(mapRange(10, 0, 10, 0, 100)).toBe(100);
  });
});

describe("inRange", () => {
  it("checks if value is in range (inclusive)", () => {
    expect(inRange(5, 0, 10)).toBe(true);
    expect(inRange(0, 0, 10)).toBe(true);
    expect(inRange(10, 0, 10)).toBe(true);
    expect(inRange(-1, 0, 10)).toBe(false);
    expect(inRange(11, 0, 10)).toBe(false);
  });
});

describe("springConfig", () => {
  it("returns spring config object", () => {
    const config = springConfig();
    expect(config).toHaveProperty("stiffness");
    expect(config).toHaveProperty("damping");
    expect(config).toHaveProperty("mass");
  });

  it("accepts custom values", () => {
    const config = springConfig(300, 25, 0.5);
    expect(config.stiffness).toBe(300);
    expect(config.damping).toBe(25);
    expect(config.mass).toBe(0.5);
  });
});
