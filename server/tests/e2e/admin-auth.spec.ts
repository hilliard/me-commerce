import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@me-commerce.local';
const ADMIN_PASSWORD = 'admin123';

test.describe('Admin path - Protected Route (E2E)', () => {
  test('redirects unauthenticated user to login', async ({ page }) => {
    await page.goto('http://localhost:5173/admin');
    // Expect the SPA to redirect to login page
    await expect(page).toHaveURL(/\/login$/);
  });

  test('logs in admin and reaches admin section', async ({ page }) => {
    // Navigate to login
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // After login, the app should navigate to /admin
    await expect(page).toHaveURL(/\/admin/);

    // Optionally verify admin dashboard is accessible
    await page.goto('http://localhost:5173/admin/dashboard');
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });
});
