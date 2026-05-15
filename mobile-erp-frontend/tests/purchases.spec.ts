import { test, expect } from '@playwright/test';

test.describe('Purchase History Page Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[id="username"]', 'admin');
    await page.fill('input[id="password"]', 'Admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  });

  test('should interact with purchase history features', async ({ page }) => {
    // Navigate to Purchase History page
    await page.goto('http://localhost:3000/purchases');
    await expect(page.locator('h1', { hasText: 'Purchase History' })).toBeVisible();

    // 1. Search for invoices
    const searchInput = page.locator('input[placeholder="Search Invoice No..."]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('INV');
    await page.waitForTimeout(1000); // debounce

    // 2. Interact with Table Rows (Expand)
    const tableBody = page.locator('tbody');
    const firstRow = tableBody.locator('tr').first();

    const noInvoicesText = await firstRow.innerText();
    if (!noInvoicesText.includes('No purchases found') && !noInvoicesText.includes('Loading...')) {
      // Click the row to expand details
      await firstRow.click();
      await page.waitForTimeout(500); // wait for details fetch
      
      // Verify expanded area shows "IMEI Inventory Items:"
      const expandedRow = tableBody.locator('tr').nth(1);
      await expect(expandedRow).toContainText('IMEI Inventory Items:');
      
      // Click again to collapse
      await firstRow.click();
      await expect(expandedRow).not.toBeVisible();
    }

    // 3. Navigate to Purchase Entry using "Record Purchase" button
    await page.click('button:has-text("Record Purchase")');
    await expect(page).toHaveURL(/.*purchases\/Entry/);
  });
});
