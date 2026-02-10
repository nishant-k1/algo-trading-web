import { test, expect } from "@playwright/test";
import { loginAsUser } from "./auth";

test.describe("Visual regression", () => {
  test("sign-in page screenshot", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL(/\/(signin|dashboard)/, { timeout: 20000 });
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel(/password/i)).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveScreenshot("signin.png");
  });

  test("dashboard after login screenshot", async ({ page }) => {
    await page.route("**/api/auth/login", (route) =>
      route.request().method() === "POST"
        ? route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ access_token: "fake-token-for-visual-test" }),
          })
        : route.continue()
    );
    await page.route("**/api/dashboard**", (route) => {
      if (route.request().url().includes("dashboard") && !route.request().url().includes("pnl")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            paper_live: "paper",
            kill_switch: false,
            daily_realized_pnl: 0,
            last_run: null,
            positions: [],
            orders: [],
          }),
        });
      }
      return route.continue();
    });
    await page.route("**/api/dashboard/pnl-history**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      })
    );
    await loginAsUser(page);
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /positions/i, level: 2 })).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveScreenshot("dashboard.png");
  });
});
