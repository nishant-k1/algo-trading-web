import { test, expect } from "@playwright/test";
import { loginAsUser } from "./auth";

test.describe("Strategies", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test("page loads and shows strategies and configs", async ({ page }) => {
    await page.goto("/strategies");
    await expect(page.getByRole("heading", { name: /strategies/i })).toBeVisible();
    await expect(page.locator("select").first()).toBeVisible();
    await expect(page.getByText(/Strategy configs|Configs/i)).toBeVisible();
  });

  test("can create strategy config when watchlist exists", async ({ page }) => {
    await page.goto("/watchlists");
    const wlName = `E2E WL ${Date.now()}`;
    await page.getByPlaceholder("New watchlist name").fill(wlName);
    await page.getByRole("button", { name: "Create" }).click();
    await expect(page.getByText(wlName)).toBeVisible();

    await page.goto("/strategies");
    await page.getByPlaceholder("Config name").fill("E2E Config");
    await page.locator('select').first().selectOption("previous_high_breakout");
    await page.locator('select').nth(1).selectOption({ label: wlName });
    await page.getByRole("button", { name: "Create" }).click();
    await expect(page.getByRole("cell", { name: "E2E Config" }).first()).toBeVisible({ timeout: 10000 });
  });
});
