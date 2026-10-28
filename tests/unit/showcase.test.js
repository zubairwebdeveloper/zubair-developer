import { describe, expect, it } from "vitest";

import {
  getKeyboardTabIndex,
  getNextTabIndex,
  isValidShowcaseTabs,
  shouldAutoCycle,
  SHOWCASE_TABS,
} from "@/lib/hero/showcase";

describe("hero showcase data and helpers", () => {
  it("defines unique, labeled showcase tabs with captions and technologies", () => {
    expect(isValidShowcaseTabs()).toBe(true);
    expect(new Set(SHOWCASE_TABS.map((tab) => tab.id)).size).toBe(
      SHOWCASE_TABS.length,
    );
    expect(isValidShowcaseTabs([{ ...SHOWCASE_TABS[0], id: "" }])).toBe(false);
    expect(
      isValidShowcaseTabs([{ ...SHOWCASE_TABS[0], label: " " }]),
    ).toBe(false);
    expect(
      isValidShowcaseTabs([{ ...SHOWCASE_TABS[0], caption: "" }]),
    ).toBe(false);
    expect(
      isValidShowcaseTabs([
        SHOWCASE_TABS[0],
        { ...SHOWCASE_TABS[1], id: SHOWCASE_TABS[0].id },
      ]),
    ).toBe(false);
  });

  it("wraps around in either direction and handles tab-list navigation keys", () => {
    expect(getNextTabIndex(3, 4)).toBe(0);
    expect(getNextTabIndex(0, 4, -1)).toBe(3);
    expect(getNextTabIndex(0, 0)).toBe(-1);
    expect(getKeyboardTabIndex("ArrowDown", 0, 4)).toBe(1);
    expect(getKeyboardTabIndex("ArrowUp", 0, 4)).toBe(3);
    expect(getKeyboardTabIndex("Home", 2, 4)).toBe(0);
    expect(getKeyboardTabIndex("End", 1, 4)).toBe(3);
    expect(getKeyboardTabIndex("Tab", 1, 4)).toBeNull();
  });

  it("cycles only while visible, unpaused, and motion is allowed", () => {
    expect(shouldAutoCycle({ inView: true })).toBe(true);
    expect(shouldAutoCycle({ inView: true, reducedMotion: true })).toBe(false);
    expect(shouldAutoCycle({ inView: true, hovered: true })).toBe(false);
    expect(shouldAutoCycle({ inView: true, focused: true })).toBe(false);
    expect(shouldAutoCycle({ inView: true, hidden: true })).toBe(false);
    expect(shouldAutoCycle({ inView: true, userSelected: true })).toBe(false);
    expect(shouldAutoCycle({ inView: false })).toBe(false);
  });
});
