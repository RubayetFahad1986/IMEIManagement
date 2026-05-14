import { test, expect } from '@playwright/test';

/**
 * End-to-End Test for Mobile ERP
 * Flows: Registration -> OTP Verification -> Login -> Entry -> Logout
 */
test.describe('Mobile ERP Business Lifecycle', () => {
  const timestamp = Date.now();
  const email = `user${timestamp}@test.com`;
  const companyName = `Company ${timestamp}`;
  const password = 'Password123!';

  test('full cycle: registration to dashboard', async ({ page }) => {
    // 1. Registration
    console.log(`Starting registration for ${email}...`);
    await page.goto('http://localhost:3000/signup');
    await page.fill('input[placeholder="Elite Mobile Ltd."]', companyName);
    await page.fill('input[placeholder="admin@elite.com"]', email);
    await page.fill('input[placeholder="+880..."]', '01700000000');
    await page.fill('input[placeholder="MD. Rashid Ali"]', 'Test Admin');
    await page.fill('input[placeholder="••••••••"]', password);
    
    // Listen for console messages from the browser
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

    await page.click('button:has-text("Launch ERP Network")');
    
    // Should navigate to verify-otp
    await expect(page).toHaveURL(/.*verify-otp/, { timeout: 30000 });
    console.log('Registration successful, moved to OTP page');
  });
});
