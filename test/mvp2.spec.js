const { test, expect } = require("@playwright/test");

test("MVP 2 shows ordinary move history, captures, and undo", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.locator("[data-square='e2']").click();
  await page.locator("[data-square='e4']").click();
  await page.locator("[data-square='d7']").click();
  await page.locator("[data-square='d5']").click();
  await page.locator("[data-square='e4']").click();
  await page.locator("[data-square='d5']").click();

  await expect(page.locator("#move-history")).toContainText("e4 (e2-e4)");
  await expect(page.locator("#move-history")).toContainText("d5 (d7-d5)");
  await expect(page.locator("#move-history")).toContainText("exd5 (e4-d5)");
  await expect(page.locator("#captured-pieces")).toContainText("Black Pawn");

  await page.locator("#undo-move").click();
  await expect(page.locator("[data-square='e4'] svg")).toBeVisible();
  await expect(page.locator("[data-square='d5'] svg")).toBeVisible();
  await expect(page.locator("#captured-pieces")).toContainText("None");
});
