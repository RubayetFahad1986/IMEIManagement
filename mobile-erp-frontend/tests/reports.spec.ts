import { test, expect } from '@playwright/test';

test.describe('Reports Page Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[id="username"]', 'admin');
    await page.fill('input[id="password"]', 'Admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  });

  test('should interact with report features', async ({ page }) => {
    // Navigate to Reports page
    await page.goto('http://localhost:3000/reports');
    
    // Wait for the loading screen to disappear
    await expect(page.locator('text=Generating Intelligence Reports...')).toBeHidden({ timeout: 15000 });
    
    // Header check
    await expect(page.locator('h1', { hasText: 'Business Intelligence' })).toBeVisible();

    // 1. Check top-level stat cards
    await expect(page.locator('text=Total Units in Stock')).toBeVisible();
    await expect(page.locator('text=Total Receivables')).toBeVisible();
    await expect(page.locator('text=Total Payables')).toBeVisible();

    // 2. Default tab is Inventory
    await expect(page.locator('text=Item-wise Stock Summary')).toBeVisible();
    
    // 3. Switch to Finance Tab
    await page.click('button[role="tab"]:has-text("Debtors & Creditors")');
    await expect(page.locator('text=Top Receivables')).toBeVisible();
    await expect(page.locator('text=Top Payables')).toBeVisible();

    // 4. Switch to Staff Tab
    await page.click('button[role="tab"]:has-text("HR & Commissions")');
    await expect(page.locator('text=Staff Commission Ledger')).toBeVisible();
  });
});
