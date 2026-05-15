import { test, expect } from '@playwright/test';

test.describe('POS Page Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[id="username"]', 'admin');
    await page.fill('input[id="password"]', 'Admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  });

  test('should interact with POS features', async ({ page }) => {
    // Navigate to POS page
    await page.goto('http://localhost:3000/pos');
    await expect(page.locator('h1')).toBeVisible();

    // 1. Check Search Input
    const searchInput = page.locator('input.h-14.pl-12').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('TestSearch123');
    await page.waitForTimeout(500); // debounce

    // 2. Interact with Customer Section
    const walkInDiv = page.locator('div.bg-amber-50\\/50');
    const phoneInput = walkInDiv.locator('input').nth(0);
    await expect(phoneInput).toBeVisible();
    await phoneInput.fill('01700000000');

    const nameInput = walkInDiv.locator('input').nth(1);
    await nameInput.fill('Walk-in Test Customer');

    // 3. Interact with Payment Breakdown
    const discountInput = page.locator('input[type="number"]').nth(0);
    await discountInput.fill('100');

    // 4. Reset Terminal
    await page.click('button:has-text("Reset Terminal")');
    await page.waitForTimeout(500);

    // Verify reset (phone should be empty)
    await expect(phoneInput).toHaveValue('');
    
    // 5. Test Quick Add Contact dialog via Button
    await page.locator('button[title*="Quick Add Contact"]').click();
    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();
    await dialog.locator('button:has-text("Cancel")').click();
    await expect(dialog).toBeHidden();
  });
});
