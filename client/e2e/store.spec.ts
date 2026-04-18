import { test, expect } from '@playwright/test';

test('has title and can load featured products', async ({ page }) => {
  await page.goto('/');

  // Expect a title
  await expect(page).toHaveTitle(/Vite \+ React/);
  
  // Verify main heading
  await expect(page.getByRole('heading', { name: 'Welcome to Me-Commerce' })).toBeVisible();

  // Test adding item to cart
  const addToCartBtn = page.getByRole('button', { name: 'Add to Cart' }).first();
  await addToCartBtn.click();
  
  // Cart badge should appear/update
  await expect(page.getByRole('button', { name: 'Cart' })).toBeVisible();
});
