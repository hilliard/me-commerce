import { test, expect } from '@playwright/test';

test.describe('Storefront Core Shopping Workflow', () => {
  test('navigates to collections, filters albums, and adds a standalone track to the cart drawer', async ({ page }) => {
    // 1. Navigate dynamically to root
    await page.goto('/');

    // 2. Click Explore the Collection
    await page.click('text="Explore the Collection"');

    // Assume Collections page loaded
    await expect(page.locator('h1').first()).toContainText('Collections');

    // 3. Ensure Tab Filter works
    const albumTab = page.locator('button', { hasText: /^Album$/ });
    await albumTab.click();

    // 4. Click on 'That\'s the Way of the World' implicitly mapped by handle or image alt tag
    const albumCard = page.locator('div', { hasText: "That's the Way of the World" }).first();
    await albumCard.click();

    // 5. Look for the tracklist $0.99 add to cart button on Track 1
    const trackAddBtn = page.getByRole('button', { name: /\+\s*\$/ }).first();
    await trackAddBtn.click();

    // 6. Assert Cart Drawer opens
    const cartDrawer = page.locator('role=dialog');
    await expect(cartDrawer).toBeVisible({ timeout: 10000 });
    await expect(cartDrawer.locator('h2', { hasText: 'Your Cart' })).toBeVisible();

    // 7. Verify Track 1 implicitly mapped inside the drawer structurally
    const cartItems = cartDrawer.locator('ul li, div > strong');
    await expect(cartItems.first()).toBeVisible();
  });
});
