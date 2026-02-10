import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Sign in", () => {
  test("sign-in page has no critical a11y violations", async ({ page }) => {
    await page.goto("/signin");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "critical"]).analyze();
    expect(results.violations).toEqual([]);
  });

  test("shows sign in form and can log in", async ({ page }) => {
    await page.goto("/signin");
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();

    await page.getByLabel(/password/i).fill("any");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
  });

  test("unauthenticated access to dashboard redirects to signin", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/signin/);
  });

  test("when login API fails, error message is shown", async ({ page }) => {
    await page.route("**/api/auth/login", (route) =>
      route.fulfill({ status: 401, body: JSON.stringify({ detail: "Invalid credentials" }) })
    );
    await page.goto("/signin");
    await page.getByLabel(/password/i).fill("any");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText(/invalid credentials/i)).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/signin/);
  });
});
