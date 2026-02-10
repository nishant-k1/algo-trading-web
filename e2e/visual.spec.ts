import { test, expect } from "@playwright/test";
import { loginAsUser } from "./auth";

test.describe("Visual regression", () => {
  test("sign-in page screenshot", async ({ page }) => {
    await page.goto("/signin");
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
    await expect(page).toHaveScreenshot("signin.png");
  });

  test("dashboard after login screenshot", async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /positions/i, level: 2 })).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveScreenshot("dashboard.png");
  });
});
