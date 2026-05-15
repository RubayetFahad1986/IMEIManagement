import { test, expect } from '@playwright/test';

test.describe('General Ledger Page Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[id="username"]', 'admin');
    await page.fill('input[id="password"]', 'Admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  });

  test('should interact with general ledger features', async ({ page }) => {
    // Navigate to General Ledger page
    await page.goto('http://localhost:3000/accounting/ledgers');
    await expect(page.locator('h1', { hasText: 'General Ledger' })).toBeVisible();

    // 1. Search functionality
    const searchInput = page.locator('input[placeholder="Search Voucher or Ref..."]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('VCH');
    await page.waitForTimeout(1000); // debounce

    // 2. Date filtering
    const startDateInput = page.locator('input[type="date"]').nth(0);
    const endDateInput = page.locator('input[type="date"]').nth(1);
    
    await expect(startDateInput).toBeVisible();
    await expect(endDateInput).toBeVisible();
    
    // Fill specific dates to test filter
    await startDateInput.fill('2024-01-01');
    await endDateInput.fill('2024-12-31');
    await page.waitForTimeout(1000); // debounce

    // 3. Clear Filters
    await page.click('button:has-text("Clear Filters")');
    await page.waitForTimeout(500);

    // Verify search is cleared
    await expect(searchInput).toHaveValue('');

    // Verify dates are not exactly 2024-01-01 anymore (they reset to current month)
    const currentStartDate = await startDateInput.inputValue();
    expect(currentStartDate).not.toBe('2024-01-01');

    // 4. Verify transaction entries visibility if any
    // The page shows loading then either text "No transactions found..." or cards with border
    const loadingText = page.locator('text=Loading secure transaction log...');
    await expect(loadingText).toBeHidden({ timeout: 10000 }); // Wait for loading to finish

    const noTransactionsText = page.locator('text=No transactions found for the selected criteria.');
    const transactionCard = page.locator('.border.rounded-lg.overflow-hidden').first();
    
    const hasNoTransactions = await noTransactionsText.isVisible();
    if (!hasNoTransactions) {
      await expect(transactionCard).toBeVisible();
      // Should have a table inside the transaction card
      await expect(transactionCard.locator('table')).toBeVisible();
    }
  });
});
