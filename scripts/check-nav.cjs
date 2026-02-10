#!/usr/bin/env node
/**
 * Quick check: open dashboard and verify Logout is in the navbar.
 * Run with: node scripts/check-nav.cjs
 * Requires: dev server on http://localhost:5173 (npm run dev)
 */
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost:5173/signin', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    // Set token so dashboard shows (Layout only checks presence)
    await page.evaluate(() => {
      localStorage.setItem('access_token', 'fake-for-nav-check');
      localStorage.setItem('user_email', 'test@test.com');
    });
    await page.goto('http://localhost:5173/dashboard', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    const logout = page.getByRole('button', { name: /logout/i });
    const visible = await logout.isVisible().catch(() => false);
    const navText = await page.locator('header nav').textContent().catch(() => '');
    await browser.close();
    console.log('Nav text:', navText?.replace(/\s+/g, ' ').trim());
    console.log('Logout button visible:', visible);
    process.exit(visible ? 0 : 1);
  } catch (err) {
    console.error(err.message);
    await browser.close();
    process.exit(1);
  }
})();
