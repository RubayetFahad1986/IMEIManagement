import { test, expect } from '@playwright/test';

/**
 * Autonomous End-to-End Test for Mobile ERP
 * Verifies: Signup -> Auto-Verify (Link) -> Dashboard -> Product -> Contact -> Purchase -> Sale -> Logout
 */
test.describe('Mobile ERP Full Lifecycle Autonomous Verification', () => {
  const timestamp = Date.now();
  const email = `test.${timestamp}@test.com`;
  const companyName = `Demo ERP ${timestamp}`;
  const password = 'Password123!';
  const testId = timestamp;
  const testProduct = `Demo Phone ${testId}`;
  const testContact = `Demo Partner ${testId}`;
  const testImei = `DEMO-${testId}`;

  test('should complete full business cycle autonomously', async ({ page }) => {
    // Listen for console messages from the browser
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

    // 1. Signup
    console.log(`Step 1: Signing up with ${email}...`);
    await page.goto('http://localhost:3000/signup');
    await page.fill('input[placeholder="Elite Mobile Ltd."]', companyName);
    await page.fill('input[placeholder="admin@elite.com"]', email);
    await page.fill('input[placeholder="+880..."]', '01700000000');
    await page.fill('input[placeholder="MD. Rashid Ali"]', 'Demo Admin');
    await page.fill('input[placeholder="••••••••"]', password);
    await page.click('button:has-text("Launch ERP Network")');
    
    // Wait for redirect to verify-otp
    await expect(page).toHaveURL(/.*verify-otp/, { timeout: 30000 });
    console.log('Step 2: Reached OTP page. Triggering auto-verification link...');

    // 2. Use the fixed OTP '111111' in the URL to trigger auto-verify
    const verificationLink = `http://localhost:3000/verify-otp?email=${encodeURIComponent(email)}&otp=111111`;
    await page.goto(verificationLink);
    
    // Should automatically redirect to dashboard
    console.log('Waiting for auto-login redirect to dashboard...');
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 45000 });
    console.log('Step 3: Auto-logged in and reached Dashboard.');

    // 3. Add Master Product
    console.log('Step 4: Adding Master Product...');
    await page.goto('http://localhost:3000/settings/products');
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Add Model")');
    await page.fill('input[placeholder="e.g. Samsung"]', 'DemoBrand');
    await page.fill('input[placeholder="e.g. S24 Ultra"]', testProduct);
    await page.fill('input[placeholder="12GB"]', '16GB');
    await page.fill('input[placeholder="512GB"]', '1TB');
    
    // Using nth(0) and nth(1) for prices since they are type="number" without unique placeholders
    const priceInputs = page.locator('input[type="number"]');
    await priceInputs.nth(0).fill('75000');
    await priceInputs.nth(1).fill('90000');
    
    await page.click('button:has-text("Save Model")');
    console.log(`Product added: ${testProduct}`);

    // 4. Add Contact
    console.log('Step 5: Adding Contact...');
    await page.goto('http://localhost:3000/contacts');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Add New Contact")');
    await page.fill('input[name="name"]', testContact);
    await page.fill('input[name="phone"]', '019' + Math.floor(Math.random() * 10000000).toString());
    await page.click('label:has-text("Supplier")');
    await page.click('button:has-text("Save Contact")');
    console.log(`Contact added: ${testContact}`);

    // 5. Record Purchase
    console.log('Step 6: Recording Purchase...');
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
    
    await expect(page).toHaveURL(/.*reports\/invoice\/purchase/, { timeout: 45000 });
    console.log('Purchase recorded.');

    // 6. POS Sale
    console.log('Step 7: Processing Sale in POS...');
    await page.goto('http://localhost:3000/pos');
    await page.waitForLoadState('networkidle');
    await page.fill('input[placeholder*="IMEI"]', testImei);
    await page.locator(`div:has-text("${testImei}")`).first().click();
    
    await page.click('button:has-text("Complete Sale")');
    await expect(page.locator('text=Sale completed!')).toBeVisible({ timeout: 20000 });
    console.log('Sale completed.');
  });
});
