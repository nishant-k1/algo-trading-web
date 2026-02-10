import { test, expect } from "@playwright/test";
import { loginAsUser } from "./auth";

test.describe("Screener with mocked API", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/screener/**", (route) => {
      if (route.request().url().includes("gainers")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            scan: "gainers",
            exchange: "NSE",
            rows: [
              { exchange: "NSE", symbol: "MOCK1", value: 5.2, extra: null },
              { exchange: "NSE", symbol: "MOCK2", value: 4.1, extra: null },
            ],
            message: null,
          }),
        });
      }
      return route.continue();
    });
    await loginAsUser(page);
  });

  test("run scan shows mocked table", async ({ page }) => {
    await page.goto("/screener");
    await page.getByRole("button", { name: /run scan/i }).click();
    await expect(page.getByText("MOCK1")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("MOCK2")).toBeVisible();
  });
});
