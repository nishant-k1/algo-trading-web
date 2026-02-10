import { test, expect } from "@playwright/test";
import { loginAsUser } from "./auth";

test.describe("Dashboard and orders", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test("dashboard loads and shows positions and orders sections", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /positions/i, level: 2 })).toBeVisible();
    await expect(page.getByRole("heading", { name: /recent orders/i, level: 2 })).toBeVisible();
  });

  test("positions table shows no positions or rows", async ({ page }) => {
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
      route.fulfill({ status: 200, contentType: "application/json", body: "[]" })
    );
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /positions/i, level: 2 })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("No positions")).toBeVisible({ timeout: 10000 });
  });

  test("orders table shows no orders or rows", async ({ page }) => {
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
      route.fulfill({ status: 200, contentType: "application/json", body: "[]" })
    );
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /recent orders/i, level: 2 })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("No orders")).toBeVisible({ timeout: 10000 });
  });
});
