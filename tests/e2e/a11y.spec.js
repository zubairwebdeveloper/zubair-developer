import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const pages = [
  "/",
  "/services",
  "/pricing",
  "/faq",
  "/contact",
  "/hire-me",
  "/about",
  "/login",
];

for (const path of pages) {
  test(`no serious accessibility violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    const serious = results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact),
    );

    expect(
      serious.map((v) => `${v.id}: ${v.help} (${v.nodes.length} nodes)`),
      "axe violations",
    ).toEqual([]);
  });
}

test("dark theme keeps contrast on the homepage", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const results = await new AxeBuilder({ page })
    .withRules(["color-contrast"])
    .analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
});
