import { expect, test } from "@playwright/test";

test("homepage shows the hero and primary calls to action", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
    /I build digital products/,
  );
  await expect(
    page.getByRole("link", { name: "Start a Project" }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "See My Work" }),
  ).toHaveAttribute("href", "/projects");
});

test("primary navigation works on every viewport", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");

  if (isMobile)
    await page.getByRole("button", { name: "Open navigation menu" }).click();
  await page
    .getByRole("link", { name: "Pricing", exact: true })
    .first()
    .click();

  await expect(page).toHaveURL(/\/pricing$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Simple starting prices",
  );
});

test("choosing a plan pre-selects the service on the project form", async ({
  page,
}) => {
  await page.goto("/pricing");
  await page.getByRole("link", { name: "Choose Business" }).first().click();

  await expect(page).toHaveURL(
    /\/hire-me\?service=web-development&plan=web-business/,
  );
  await expect(
    page.getByRole("combobox", { name: "Service needed" }),
  ).toContainText("Web development");
});

test("contact form validates before submitting", async ({ page }) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Please enter your full name.")).toBeVisible();
});

test("unknown pages show the custom 404", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("link", { name: "Back to home" })).toBeVisible();
});

test("admin requires login", async ({ page }) => {
  await page.goto("/admin/leads");
  await expect(page).toHaveURL(/\/admin\/login\?next=/);
  await expect(
    page.getByRole("heading", { name: "Admin sign in" }),
  ).toBeVisible();
});

test("draft-only routes and private files are not exposed", async ({
  request,
}) => {
  expect((await request.get("/robots.txt")).ok()).toBe(true);
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /admin");

  const unauthenticated = await request.post("/api/admin/team", {
    data: {},
    headers: { origin: "https://zubair-developer.vercel.app" },
  });
  expect([401, 403]).toContain(unauthenticated.status());
});

test("theme toggle switches without a page error", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error));
  await page.goto("/");

  await page
    .getByRole("button", { name: /switch to (dark|light) theme/i })
    .click();
  await expect(page.locator("html")).toHaveClass(/dark|light/);
  expect(errors).toHaveLength(0);
});
