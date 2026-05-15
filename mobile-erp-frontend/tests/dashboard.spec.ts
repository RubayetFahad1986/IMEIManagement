import { test, expect } from '@playwright/test';

test.describe('Dashboard Page Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[id="username"]', 'admin');
    await page.fill('input[id="password"]', 'Admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  });

  test('should interact with dashboard features', async ({ page }) => {
    // Wait for the loading screen to disappear
    await expect(page.locator('text=Computing Business Intelligence...')).toBeHidden({ timeout: 15000 });
    
    // Header check
    await expect(page.locator('h1')).toBeVisible();

    // 1. Check Date Range Filters
    const startDateInput = page.locator('input[type="date"]').nth(0);
    const endDateInput = page.locator('input[type="date"]').nth(1);
    
    await expect(startDateInput).toBeVisible();
    await expect(endDateInput).toBeVisible();
    
    // Fill specific dates to test filter reload
    await startDateInput.fill('2024-01-01');
    await endDateInput.fill('2024-12-31');
    
    // Click the Load Data button
    await page.locator('button:has-text("Load Data")').click();

    // 2. Open Stock Breakdown Modal
    // The Stock Value card opens the modal. Target the title specifically.
    await page.getByText('Stock Value').click();

    // Verify the modal opens
    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();
    
    // Wait for internal loading to disappear
    await expect(dialog.locator('text=Retrieving secure records...')).toBeHidden({ timeout: 10000 });

    // Close the modal
    // The close button has specific classes
    await dialog.locator('button.hover\\:bg-white\\/10').click();
    await expect(dialog).toBeHidden();

    // 3. Verify Charts Visibility
    await expect(page.locator('.recharts-responsive-container').first()).toBeVisible();
  });
});
