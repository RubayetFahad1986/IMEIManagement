import { test, expect } from '@playwright/test';

/**
 * Extended Modules Test Suite
 * Covers: Accounting (Expenses), Inventory (Transfers), Stolen Registry, Staff, and Settings
 */
test.describe('Mobile ERP Extended Modules', () => {
  const timestamp = Date.now();
  
  test.beforeEach(async ({ page }) => {
    // Shared Login for all tests
    await page.goto('http://localhost:3000/login');
    await page.fill('input[id="username"]', 'admin');
    await page.fill('input[id="password"]', 'Admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  });

  test('Accounting: Record and verify expense', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('http://localhost:3000/accounting/expenses');
    await page.waitForLoadState('networkidle');
    
    // Click the "New Expense" tab trigger
    await page.click('button[role="tab"]:has-text("New Expense")');
    
    const expenseTitle = `Office Utility ${timestamp}`;
    await page.fill('input[placeholder="Optional notes..."]', expenseTitle);
    
    // Select an account from the searchable select
    await page.click('button:has-text("Search placeholder")');
    await page.locator('.bg-popover div').first().click();
    
    await page.fill('input[type="number"]', '1500');
    
    await page.click('button:has-text("Save Expense")');
    
    // Wait for the "Expense recorded!" toast and list reload
    await expect(page.locator('text=Expense recorded!')).toBeVisible({ timeout: 20000 });
    
    // Switch back to list tab
    await page.click('button[role="tab"]:has-text("Expense List")');
    await expect(page.locator('table')).toContainText(expenseTitle, { timeout: 15000 });
  });

  test('Inventory: Verify Inventory list and Audit view', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('http://localhost:3000/inventory');
    await page.waitForLoadState('networkidle');
    
    // Check if table has content
    await expect(page.locator('table')).toBeVisible({ timeout: 20000 });
    
    // Open Audit Console from Dashboard
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForLoadState('networkidle');
    await page.click('text=STOCK VALUE');
    await expect(page.locator('text=Stock Audit Console')).toBeVisible({ timeout: 15000 });
  });

  test('Stolen Registry: Add and search stolen device', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('http://localhost:3000/stolen-registry');
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Start New Report")');
    const stolenImei = `STOLEN${timestamp.toString().slice(-10)}`;
    
    await page.fill('label:has-text("IMEI 1") + input', stolenImei);
    await page.fill('input[placeholder*="iPhone 15 Pro Max"]', 'Lost Phone ' + timestamp);
    await page.fill('label:has-text("Your Name") + input', 'Test Reporter');
    await page.fill('label:has-text("Contact Phone") + input', '01712345678');
    
    await page.click('button:has-text("Submit Report")');
    await expect(page.locator('text=Device reported successfully')).toBeVisible({ timeout: 20000 });
    
    // Search for it
    await page.fill('input[placeholder*="IMEI 1 or 2"]', stolenImei);
    await page.click('button:has-text("Check")');
    
    await expect(page.locator('text=STOLEN DEVICE DETECTED')).toBeVisible({ timeout: 20000 });
  });

  test('Staff: Verify staff list', async ({ page }) => {
    await page.goto('http://localhost:3000/staff');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Staff');
    await expect(page.locator('table')).toBeVisible();
  });

  test('Settings: Update Company Profile', async ({ page }) => {
    await page.goto('http://localhost:3000/settings/company');
    await page.waitForLoadState('networkidle');
    
    const newName = `GTR Mobile ${timestamp}`;
    await page.fill('input[placeholder="Elite Mobile Ltd."]', newName);
    await page.click('button:has-text("Update Profile")');
    
    // Verify toast or page update
    await expect(page.locator(`text=${newName}`)).toBeVisible();
  });
});
