const { test, expect } = require("@playwright/test");

test("MVP 1 supports click movement, legal highlights, and illegal blocking", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator("[data-square='e2']")).toBeVisible();
  await page.locator("[data-square='e2']").click();
  await expect(page.locator("[data-square='e3']")).toHaveClass(/legal/);
  await expect(page.locator("[data-square='e4']")).toHaveClass(/legal/);
  await page.locator("[data-square='e5']").click();
  await expect(page.locator("[data-square='e2'] svg")).toBeVisible();
  await page.locator("[data-square='e2']").click();
  await page.locator("[data-square='e4']").click();
  await expect(page.locator("[data-square='e4'] svg")).toBeVisible();
  await expect(page.locator("#debug-state")).toContainText('"turn":"b"');
});

test("MVP 1 supports drag movement", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.locator("[data-square='g1']").dispatchEvent("pointerdown", { pointerType: "mouse", bubbles: true });
  await page.locator("[data-square='f3']").dispatchEvent("pointerup", { pointerType: "mouse", bubbles: true });
  await expect(page.locator("[data-square='f3'] svg")).toBeVisible();
  await expect(page.locator("#debug-state")).toContainText('"turn":"b"');
});
