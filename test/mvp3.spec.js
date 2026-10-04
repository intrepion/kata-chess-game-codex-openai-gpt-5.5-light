const { test, expect } = require("@playwright/test");

test("MVP 3 supports castling in the browser", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.evaluate(() => window.__quietChessDebug.setFen("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1"));

  await page.locator("[data-square='e1']").click();
  await expect(page.locator("[data-square='g1']")).toHaveClass(/legal/);
  await page.locator("[data-square='g1']").click();

  await expect(page.locator("[data-square='g1'] svg")).toBeVisible();
  await expect(page.locator("[data-square='f1'] svg")).toBeVisible();
  await expect(page.locator("#move-history")).toContainText("O-O");
});

test("MVP 3 requires explicit promotion choice in the browser", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.evaluate(() => window.__quietChessDebug.setFen("8/P7/8/8/8/8/8/4k2K w - - 0 1"));

  await page.locator("[data-square='a7']").click();
  await page.locator("[data-square='a8']").click();
  await expect(page.locator("#promotion-modal")).toBeVisible();
  await page.getByRole("button", { name: "Knight" }).click();

  await expect(page.locator("[data-square='a8'] svg")).toBeVisible();
  await expect(page.locator("#move-history")).toContainText("a8=N");
});
