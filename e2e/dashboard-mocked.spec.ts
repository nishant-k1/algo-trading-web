import { test, expect } from "@playwright/test";
import { loginAsUser } from "./auth";

test.describe("Dashboard with mocked API", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/dashboard**", (route) => {
      if (route.request().url().includes("dashboard") && !route.request().url().includes("pnl")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            paper_live: "paper",
            kill_switch: false,
            daily_realized_pnl: 1000,
            last_run: {
              run_at: "2025-01-15T10:00:00Z",
              signals_count: 2,
              symbols_scanned: 20,
              symbols_filtered_by_gap: 3,
            },
            positions: [{ symbol: "MOCK", exchange: "NSE", side: "BUY", quantity: 10, average_price: 100, product: "CNC" }],
            orders: [
              {
                id: 1,
                client_order_id: "c1",
                symbol: "MOCK",
                side: "BUY",
                quantity: 10,
                status: "COMPLETE",
                average_price: 100,
                created_at: "2025-01-15T09:00:00Z",
              },
            ],
          }),
        });
      }
      return route.continue();
    });
    await page.route("**/api/dashboard/pnl-history**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([{ date: "2025-01-14", realized_pnl: 500 }, { date: "2025-01-15", realized_pnl: 1000 }]),
      })
    );
    await loginAsUser(page);
  });

  test("dashboard shows mocked positions and orders", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /positions/i, level: 2 })).toBeVisible();
    await expect(page.getByRole("cell", { name: "MOCK" }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("COMPLETE")).toBeVisible();
  });
});
