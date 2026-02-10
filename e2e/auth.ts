import { Page } from "@playwright/test";

/** Log in with default password and wait for dashboard. Call before tests that need auth. */
export async function loginAsUser(page: Page, password = "any") {
  await page.goto("/signin");
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/dashboard/);
}
