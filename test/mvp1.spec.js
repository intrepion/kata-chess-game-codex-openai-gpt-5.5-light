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

test("MVP 1 renders visually distinct piece silhouettes", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  const signatures = await page.evaluate(() => {
    const squares = ["a1", "b1", "c1", "d1", "e1", "a2"];
    return squares.map((square) => document.querySelector(`[data-square='${square}'] svg`).innerHTML.replace(/#[0-9a-fA-F]{3,6}/g, "#color"));
  });
  expect(new Set(signatures).size).toBe(6);
});

test("MVP 1 keeps empty board rows the same height", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.locator("[data-square='e2']").click();
  await page.locator("[data-square='e4']").click();
  const heights = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".square")).map((square) => Math.round(square.getBoundingClientRect().height));
  });
  expect(new Set(heights).size).toBe(1);
});
