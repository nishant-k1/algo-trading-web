import { test, expect } from "@playwright/test";
import { loginAsUser } from "./auth";

test.describe("Settings", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test("page loads and shows settings form", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: /settings/i })).toBeVisible();
    await expect(page.getByText(/paper|live/i).first()).toBeVisible();
    await expect(page.getByText(/risk|max position|orders per day|loss limit/i).first()).toBeVisible();
  });

  test("can change paper/live mode", async ({ page }) => {
    await page.goto("/settings");
    const modeSelect = page.locator('select').filter({ has: page.locator('option[value="paper"]') });
    await expect(modeSelect).toBeVisible();
    await modeSelect.selectOption("live");
    await expect(modeSelect).toHaveValue("live");
    await modeSelect.selectOption("paper");
    await expect(modeSelect).toHaveValue("paper");
  });

  test("risk limits section is visible", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByText("Max position (₹)").first()).toBeVisible();
    await expect(page.getByText("Max orders/day").first()).toBeVisible();
  });
});
