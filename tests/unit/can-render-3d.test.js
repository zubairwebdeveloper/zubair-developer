import { describe, expect, it } from "vitest";

import { canRenderHero3D } from "@/lib/hero/can-render-3d";

describe("canRenderHero3D", () => {
  const capable = {
    prefersReducedMotion: false,
    saveData: false,
    deviceMemory: 8,
    hardwareConcurrency: 8,
    hasWebGL: true,
  };

  it("allows capable devices", () => {
    expect(canRenderHero3D(capable)).toBe(true);
  });

  it("blocks reduced motion, data saver, low power, and missing WebGL", () => {
    expect(canRenderHero3D({ ...capable, prefersReducedMotion: true })).toBe(
      false,
    );
    expect(canRenderHero3D({ ...capable, saveData: true })).toBe(false);
    expect(canRenderHero3D({ ...capable, deviceMemory: 2 })).toBe(false);
    expect(canRenderHero3D({ ...capable, hardwareConcurrency: 2 })).toBe(false);
    expect(canRenderHero3D({ ...capable, hasWebGL: false })).toBe(false);
  });
});
