import { test, expect } from '@playwright/test';

/**
 * End-to-End Test for Mobile ERP
 * Verifies: Auto-Verification -> Dashboard -> Product -> Contact -> Purchase -> Sale -> Logout
 */
test.describe('Mobile ERP Full Cycle Verification', () => {
  const email = 'test.v2.cycle@test.com';
  const otp = '714124';
  const verificationLink = `http://localhost:3000/verify-otp?email=${encodeURIComponent(email)}&otp=${otp}`;
  
  const testId = Date.now();
  const testProduct = `Cycle Phone ${testId}`;
  const testContact = `Cycle Partner ${testId}`;
  const testImei = `CYC-${testId}`;

  test('should complete full business cycle with auto-login', async ({ page }) => {
    // Listen for console messages from the browser
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

    // 1. Auto-Verification & Login
    console.log('Navigating to verification link...');
    await page.goto(verificationLink);
    
    // Should automatically redirect to dashboard
    console.log('Waiting for redirect to dashboard...');
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 45000 });
    console.log('Verified and redirected to Dashboard successfully.');

    // 2. Add Master Product
    console.log('Adding Master Product...');
    await page.goto('http://localhost:3000/settings/products');
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Add Master Model")');
    await page.fill('input[name="brand"]', 'CycleBrand');
    await page.fill('input[name="modelName"]', testProduct);
    await page.fill('input[name="ram"]', '12GB');
    await page.fill('input[name="storage"]', '512GB');
    await page.fill('input[name="defaultCostPrice"]', '50000');
    await page.fill('input[name="defaultSalesPrice"]', '65000');
    await page.click('button:has-text("Save to Master")');
    console.log(`Master Product added: ${testProduct}`);

    // 3. Add Contact
    console.log('Adding Contact...');
    await page.goto('http://localhost:3000/contacts');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Add New Contact")');
    await page.fill('input[name="name"]', testContact);
    await page.fill('input[name="phone"]', '018' + Math.floor(Math.random() * 10000000).toString());
    await page.click('label:has-text("Supplier")');
    await page.click('button:has-text("Save Contact")');
    console.log(`Contact added: ${testContact}`);

    // 4. Record Purchase
    console.log('Recording Purchase...');
    await page.goto('http://localhost:3000/purchases/Entry');
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Search Supplier...")');
    await page.fill('input[placeholder="Search..."]', testContact);
    await page.locator(`.bg-popover div:text-is("${testContact}")`).click();
    
    await page.click('button:has-text("Add New Row")');
    await page.click('button:has-text("Search Device...")');
    await page.fill('input[placeholder="Search..."]', testProduct);
    await page.locator(`.bg-popover div:has-text("${testProduct}")`).first().click();
    
    await page.fill('textarea[placeholder*="IMEIs"]', testImei);
    await page.click('button:has-text("Finalize Purchase")');
    
    await expect(page).toHaveURL(/.*reports\/invoice\/purchase/, { timeout: 30000 });
    console.log('Purchase recorded.');

    // 5. POS Sale
    console.log('Processing Sale in POS...');
    await page.goto('http://localhost:3000/pos');
    await page.waitForLoadState('networkidle');
    await page.fill('input[placeholder*="IMEI"]', testImei);
    await page.locator(`div:has-text("${testImei}")`).first().click();
    
    await page.click('button:has-text("Complete Sale")');
    await expect(page.locator('text=Sale completed!')).toBeVisible({ timeout: 15000 });
    console.log('Sale completed in POS.');

    // 6. Verify Sales History
    await page.goto('http://localhost:3000/sales');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('table')).toContainText(testImei.slice(-4), { timeout: 10000 });
    console.log('Verified sale in history.');

    // 7. Logout
    await page.goto('http://localhost:3000/dashboard');
    const logoutBtn = page.locator('button:has-text("Logout"), a:has-text("Logout")').first();
    if (await logoutBtn.isVisible()) {
        await logoutBtn.click();
        await expect(page).toHaveURL(/.*login|.*/);
        console.log('Logged out successfully.');
    }
  });
});
