import { test, expect } from '@playwright/test';

test.describe('Reseller Dashboard Page Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[id="username"]', 'admin');
    await page.fill('input[id="password"]', 'Admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  });

  test('should interact with reseller dashboard features', async ({ page }) => {
    // Navigate to Reseller page
    await page.goto('http://localhost:3000/reseller');
    
    // Check Header
    await expect(page.locator('h1', { hasText: 'Partner Intelligence' })).toBeVisible();

    // Verify stats cards
    await expect(page.locator('text=Permissions Allocated')).toBeVisible();
    await expect(page.locator('text=Active Deployments')).toBeVisible();
    await expect(page.locator('text=Remaining Balance')).toBeVisible();

    // Verify Table exists
    await expect(page.locator('table')).toBeVisible();
  });
});
