import { test, expect } from "@playwright/test";
import { loginAsUser } from "./auth";

test.describe("Watchlists", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test("page loads and shows watchlists section", async ({ page }) => {
    await page.goto("/watchlists");
    await expect(page.getByRole("heading", { name: "Watchlists", exact: true })).toBeVisible();
    await expect(page.getByPlaceholder("New watchlist name")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create" })).toBeVisible();
  });

  test("can create a new watchlist", async ({ page }) => {
    await page.goto("/watchlists");
    const name = `E2E WL ${Date.now()}`;
    await page.getByPlaceholder("New watchlist name").fill(name);
    await page.getByRole("button", { name: "Create" }).click();
    await expect(page.getByText(name)).toBeVisible();
  });

  test("can add symbol to watchlist", async ({ page }) => {
    await page.goto("/watchlists");
    const name = `E2E WL ${Date.now()}`;
    await page.getByPlaceholder("New watchlist name").fill(name);
    await page.getByRole("button", { name: "Create" }).click();
    await page.getByText(name).click();
    await page.getByPlaceholder(/add symbol/i).fill("RELIANCE");
    await page.getByRole("button", { name: "Add" }).click();
    await expect(page.getByText("RELIANCE")).toBeVisible();
  });
});
