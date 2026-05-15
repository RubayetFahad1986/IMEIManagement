import { test, expect } from '@playwright/test';

test.describe('Reseller Full Ecosystem Flow', () => {
  const timestamp = Date.now();
  const resellerEmail = `reseller${timestamp}@test.com`;
  const companyEmail = `client${timestamp}@test.com`;
  const promoCode = `TEST${timestamp.toString().slice(-4)}`;

  test('SuperAdmin creates Reseller -> Reseller activates Company', async ({ page }) => {
    // 1. SuperAdmin Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[id="username"]', 'admin');
    await page.fill('input[id="password"]', 'Admin123');
    await page.click('button:has-text("Login Securely")');
    await expect(page).toHaveURL(/.*dashboard/);

    // 2. Create Reseller User
    await page.goto('http://localhost:3000/settings/users');
    await page.click('button:has-text("Create User")');
    await page.fill('input[placeholder="e.g. johndoe"]', `reseller_${timestamp}`);
    await page.fill('input[placeholder="e.g. John Doe"]', `Partner ${timestamp}`);
    await page.fill('input[placeholder="e.g. john@company.com"]', resellerEmail);
    await page.selectOption('select', 'Reseller');
    await page.click('button:has-text("Save User")');
    await expect(page.locator('table')).toContainText(resellerEmail);

    // 3. Configure Reseller (Promo Code & Licenses)
    await page.goto('http://localhost:3000/settings/resellers');
    // Find our reseller row
    const row = page.locator('tr', { hasText: resellerEmail });
    await row.locator('button:has-text("Promo Code")').click();
    await page.fill('input[placeholder="e.g. DHAKA2026"]', promoCode);
    await page.click('button:has-text("Update Code")');
    
    await row.locator('button:has-text("Add Copies")').click();
    await page.fill('input[type="number"]', '50');
    await page.click('button:has-text("Confirm & Deposit")');
    await expect(row).toContainText('50');

    // 4. Logout SuperAdmin
    await page.goto('http://localhost:3000/dashboard');
    await page.click('button:has-text("admin")'); // User profile trigger
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL('http://localhost:3000/');

    // 5. New Company Signup with Promo Code
    console.log('Step 5: Signing up new company with promo code:', promoCode);
    await page.goto('http://localhost:3000/signup');
    await page.fill('input[placeholder="Elite Mobile Ltd."]', `Client of ${promoCode}`);
    await page.fill('input[placeholder="admin@company.com"]', companyEmail);
    await page.fill('input[placeholder="+880..."]', '01900000000');
    await page.fill('input[placeholder="MD. Rashid Ali"]', 'Client Admin');
    await page.fill('input[placeholder="••••••••"]', 'Password123!');
    await page.fill('input[placeholder="E.G. PARTNER2026"]', promoCode);
    
    const signupBtn = page.locator('button:has-text("Launch Network")');
    await expect(signupBtn).toBeEnabled();
    await signupBtn.click();
    
    await expect(page).toHaveURL(/.*verify-otp/, { timeout: 30000 });
    console.log('Signup successful for client');

    // 6. Reseller Login & Activation
    await page.goto('http://localhost:3000/login');
    await page.fill('input[id="username"]', resellerEmail);
    await page.fill('input[id="password"]', 'Admin123');
    await page.click('button:has-text("Login Securely")');
    
    await page.goto('http://localhost:3000/reseller');
    await expect(page.locator('table')).toContainText(companyEmail);
    await page.click('button:has-text("Activate Now")');
    await expect(page.locator('text=Activated')).toBeVisible();
    await expect(page.locator('text=Remaining Balance')).toContainText('49');
  });
});
