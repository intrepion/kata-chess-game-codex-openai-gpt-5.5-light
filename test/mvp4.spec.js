const { test, expect } = require("@playwright/test");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

test("Complete Game Slice shows checkmate and stalemate explanations", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.evaluate(() => window.__quietChessDebug.setFen("rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3"));
  await expect(page.locator("#turn-status")).toContainText("Black wins by checkmate.");

  await page.evaluate(() => window.__quietChessDebug.setFen("7k/5Q2/6K1/8/8/8/8/8 b - - 0 1"));
  await expect(page.locator("#turn-status")).toContainText("Draw by stalemate.");
});

test("Complete Game Slice persists the current game across refresh", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.locator("[data-square='e2']").click();
  await page.locator("[data-square='e4']").click();
  await page.reload();
  await expect(page.locator("[data-square='e4'] svg")).toBeVisible();
  await expect(page.locator("#fen-box")).toHaveValue(/4P3/);
  await expect(page.locator("#move-history")).toContainText("e4 (e2-e4)");
});

test("Complete Game Slice loads FEN and supports keyboard square navigation", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.locator("#fen-box").fill("8/P7/8/8/8/8/8/4k2K w - - 0 1");
  await page.locator("#load-fen").click();
  await expect(page.locator("[data-square='a7'] svg")).toBeVisible();
  await page.locator("[data-square='a7']").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-square='a8']")).toHaveClass(/legal/);
});

test("Complete Game Slice launches directly from file URL without console errors", async ({ page }) => {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto(pathToFileURL(path.resolve(__dirname, "..", "index.html")).href);
  await expect(page.locator("[data-square='e2']")).toBeVisible();
  await page.locator("[data-square='e2']").click();
  await expect(page.locator("[data-square='e4']")).toHaveClass(/legal/);
  expect(errors).toEqual([]);
});
