import { test, expect } from '@playwright/test';

test.describe('Inventory Page Functionality', () => {
  const testId = Date.now();

  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[id="username"]', 'admin');
    await page.fill('input[id="password"]', 'Admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  });

  test('should interact with inventory features', async ({ page }) => {
    // Navigate to Inventory page
    await page.goto('http://localhost:3000/inventory');
    await expect(page.locator('h1', { hasText: 'Inventory' })).toBeVisible();

    // 1. Stats Cards (Filters)
    const inStockCard = page.locator('.group').filter({ hasText: 'In Stock' }).first();
    await inStockCard.click();
    await page.waitForTimeout(500); // Wait for fetch

    const soldCard = page.locator('.group').filter({ hasText: 'Sold Items' }).first();
    await soldCard.click();
    await page.waitForTimeout(500); // Wait for fetch

    // 2. Clear filter
    await page.click('button:has-text("Clear")');
    await page.waitForTimeout(500);

    // 3. Search
    await page.fill('input[placeholder*="IMEI, Brand, or Model"]', 'Test');
    await page.waitForTimeout(1000); // Wait for debounce

    // Clear search to show all items
    await page.fill('input[placeholder*="IMEI, Brand, or Model"]', '');
    await page.waitForTimeout(1000);

    // Check if there are any items in the table
    const tableBody = page.locator('tbody');
    const firstRow = tableBody.locator('tr').first();
    
    // If the row doesn't have the text "No assets found", we can test the dialogs
    const noAssetsText = await firstRow.innerText();
    if (!noAssetsText.includes('No assets found') && !noAssetsText.includes('Fetching inventory data')) {
      
      // 4. Asset Preview Dialog
      const infoButton = firstRow.locator('button').filter({ has: page.locator('svg.lucide-info') });
      await infoButton.click();
      
      const dialog = page.locator('div[role="dialog"]');
      await expect(dialog).toBeVisible();
      await expect(dialog.locator('text=Asset Profile')).toBeVisible();
      
      await dialog.locator('button:has-text("Close Profile")').click();
      await expect(dialog).toBeHidden();

      // 5. Report Incident Dialog (only available on unsold items, but we don't know if first row is unsold, so we'll look for an alert circle button)
      const reportButton = firstRow.locator('button').filter({ has: page.locator('svg.lucide-alert-circle') });
      if (await reportButton.isVisible()) {
          await reportButton.click();
          const incidentDialog = page.locator('div[role="dialog"]');
          await expect(incidentDialog).toBeVisible();
          await expect(incidentDialog.locator('text=Report Incident')).toBeVisible();

          await incidentDialog.locator('textarea').fill(`Test damage report ${testId}`);
          
          // Cancel it so we don't pollute data for other tests
          await incidentDialog.locator('button:has-text("Discard")').click();
          await expect(incidentDialog).toBeHidden();
      }
    }
  });
});
