import { Page } from "@playwright/test";

/** Log in with default username and password; wait for dashboard. Call before tests that need auth. */
export async function loginAsUser(page: Page, username = "user", password = "any") {
  await page.goto("/");
  await page.waitForURL(/\/(signin|dashboard)/, { timeout: 20000 });
  await page.getByRole("heading", { name: /sign in/i }).waitFor({ state: "visible", timeout: 10000 });
  const hasUsernameField = await page.getByTestId("signin-username").or(page.getByPlaceholder("user")).isVisible().catch(() => false);
  if (hasUsernameField) {
    await page.getByTestId("signin-username").or(page.getByPlaceholder("user")).fill(username);
  }
  await page.getByTestId("signin-password").or(page.getByLabel(/password/i)).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/dashboard/);
}
