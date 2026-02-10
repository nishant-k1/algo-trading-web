import { test, expect } from "@playwright/test";
import { loginAsUser } from "./auth";

test.describe("Screener", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test("page loads and shows scan tabs and run button", async ({ page }) => {
    await page.goto("/screener");
    await expect(page.getByRole("heading", { name: /screener/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /gainers/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /losers/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /run scan/i })).toBeVisible();
  });

  test("can switch tabs and run scan", async ({ page }) => {
    await page.goto("/screener");
    await page.getByRole("button", { name: /losers/i }).click();
    await page.getByRole("button", { name: /run scan/i }).click();
    await expect(
      page.getByText(/running|configure broker|scan failed|symbol/i).first()
    ).toBeVisible({ timeout: 15000 });
    await expect(
      page.locator("table").or(page.getByText(/configure broker|no data|scan failed/i))
    ).toBeVisible({ timeout: 15000 });
  });
});
