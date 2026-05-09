# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\admin-auth.spec.ts >> Admin path - Protected Route (E2E) >> redirects unauthenticated user to login
- Location: tests\e2e\admin-auth.spec.ts:7:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/admin
Call log:
  - navigating to "http://localhost:5173/admin", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const ADMIN_EMAIL = 'admin@me-commerce.local';
  4  | const ADMIN_PASSWORD = 'admin123';
  5  | 
  6  | test.describe('Admin path - Protected Route (E2E)', () => {
  7  |   test('redirects unauthenticated user to login', async ({ page }) => {
> 8  |     await page.goto('http://localhost:5173/admin');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/admin
  9  |     // Expect the SPA to redirect to login page
  10 |     await expect(page).toHaveURL(/\/login$/);
  11 |   });
  12 | 
  13 |   test('logs in admin and reaches admin section', async ({ page }) => {
  14 |     // Navigate to login
  15 |     await page.goto('http://localhost:5173/login');
  16 |     await page.fill('input[type="email"]', ADMIN_EMAIL);
  17 |     await page.fill('input[type="password"]', ADMIN_PASSWORD);
  18 |     await page.click('button[type="submit"]');
  19 | 
  20 |     // After login, the app should navigate to /admin
  21 |     await expect(page).toHaveURL(/\/admin/);
  22 | 
  23 |     // Optionally verify admin dashboard is accessible
  24 |     await page.goto('http://localhost:5173/admin/dashboard');
  25 |     await expect(page).toHaveURL(/\/admin\/dashboard/);
  26 |   });
  27 | });
  28 | 
```