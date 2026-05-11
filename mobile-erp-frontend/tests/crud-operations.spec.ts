import { test, expect } from '@playwright/test';

test.describe('Mobile ERP Full CRUD Flow', () => {
  const testId = Date.now();
  const testProduct = `Test Phone ${testId}`;
  const testContact = `Test Partner ${testId}`;
  const testImei = `IMEI-${testId}`;

  test('should complete a full business cycle', async ({ page }) => {
    // 1. Login
    await page.goto('http://localhost:3000/');
    await page.fill('input[id="username"]', 'Admin@gmail.com');
    await page.fill('input[id="password"]', 'Admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });

    // 2. Add Master Product
    await page.goto('http://localhost:3000/settings/products');
    await page.click('button:has-text("Add Master Model")');
    await page.fill('input[name="brand"]', 'TestBrand');
    await page.fill('input[name="modelName"]', testProduct);
    await page.fill('input[name="ram"]', '8GB');
    await page.fill('input[name="storage"]', '256GB');
    await page.fill('input[name="defaultCostPrice"]', '10000');
    await page.fill('input[name="defaultSalesPrice"]', '12000');
    await page.click('button:has-text("Save to Master")');
    await expect(page.locator('table')).toContainText(testProduct, { timeout: 15000 });

    // 3. Add Contact (Supplier)
    await page.goto('http://localhost:3000/contacts');
    await page.click('button:has-text("Add New Contact")');
    await page.waitForSelector('div[role="dialog"]');
    await page.fill('input[name="name"]', testContact);
    await page.fill('input[name="phone"]', `017${testId.toString().slice(-8)}`);
    await page.click('label:has-text("Supplier")');
    await page.click('button:has-text("Save Contact")');
    await expect(page.locator('table')).toContainText(testContact, { timeout: 15000 });

    // 4. Record Purchase
    await page.goto('http://localhost:3000/purchases/new');
    await page.click('button:has-text("Search Supplier...")');
    await page.fill('input[placeholder="Search..."]', testContact);
    // Use a more specific selector for the dropdown item
    await page.locator('.bg-popover div:text-is("' + testContact + '")').click();

    await page.fill('input[placeholder="e.g. PUR-10023"]', `INV-${testId}`);
    
    await page.click('button:has-text("Add New Row")');
    await page.click('button:has-text("Search Device...")');
    await page.fill('input[placeholder="Search..."]', testProduct);
    await page.locator('.bg-popover div:text-is("' + testProduct + '")').click();
    
    await page.fill('input[placeholder="Scan IMEI 1"]', testImei);
    await page.click('button:has-text("Finalize Purchase")');
    await expect(page).toHaveURL(/.*inventory/, { timeout: 15000 });

    // 5. Process Sale in POS
    await page.goto('http://localhost:3000/pos');
    await page.fill('input[placeholder="Scan IMEI or Search Model..."]', testImei);
    // The POS search uses a regular div result list
    await page.locator('.hover\\:bg-blue-50').click();
    
    await page.fill('input[placeholder="Enter amount paid"]', '12000');
    await page.click('button:has-text("Complete Sale")');
    await expect(page.locator('text=Sale completed!')).toBeVisible({ timeout: 15000 });

    // 6. Verify Sales History
    await page.goto('http://localhost:3000/sales');
    await expect(page.locator('table')).toContainText(`SAL-`, { timeout: 15000 });
  });
});
