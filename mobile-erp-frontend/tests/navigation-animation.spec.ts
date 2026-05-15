import { test, expect } from '@playwright/test';

// List of all paths extracted from menu-config.ts
const menuRoutes = [
  "/dashboard", "/pos", "/settings/products", "/inventory", "/inventory/transfers",
  "/sales", "/sales/returns", "/purchases", "/purchases/returns",
  "/accounting/smart-transaction", "/accounting/ledgers", "/accounting/contact-ledger", 
  "/accounting/due-management", "/accounting/expenses", "/settings/accounts",
  "/contacts", "/staff", "/settings/users",
  "/stolen-check", "/reseller",
  "/reports", "/settings/subscriptions", "/settings/resellers", "/settings/sample-data", 
  "/settings/sequences", "/settings/company"
];

test.describe('Full Menu Navigation Animation', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate once
    await page.goto('http://localhost:3000/login');
    await page.fill('input[id="username"]', 'admin');
    await page.fill('input[id="password"]', 'Admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  });

  for (const route of menuRoutes) {
    test(`Navigating to ${route}`, async ({ page }) => {
      // Small delay to make the animation visible for the user
      await page.waitForTimeout(500); 
      
      await page.goto(`http://localhost:3000${route}`);
      
      // Wait for network idle to ensure page loaded
      await page.waitForLoadState('networkidle');
      
      // Simple assertion to check page is alive
      await expect(page).toHaveURL(new RegExp(`.*${route.split('/').pop()}|${route.split('/').slice(-2).join('/')}`));
    });
  }
});
