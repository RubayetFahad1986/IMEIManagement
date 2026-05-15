import { test, expect } from '@playwright/test';

/**
 * Autonomous Product CRUD Test for Mobile ERP
 * Verifies: Signup -> Auto-Verify -> Dashboard -> Product Master (Add, Edit, Delete)
 */
test.describe('Mobile ERP Product Master CRUD', () => {
  const timestamp = Date.now();
  const email = `crud.test.${timestamp}@test.com`;
  const companyName = `CRUD Demo ERP ${timestamp}`;
  const password = 'Password123!';
  const testProduct = `CRUD Phone ${timestamp}`;

  test('should perform full CRUD on Product Master', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

    // 1. Signup
    console.log(`Step 1: Signing up with ${email}...`);
    await page.goto('http://localhost:3000/signup');
    await page.fill('input[placeholder="Elite Mobile Ltd."]', companyName);
    await page.fill('input[placeholder="admin@company.com"]', email);
    await page.fill('input[placeholder="+880..."]', '01700000000');
    await page.fill('input[placeholder="MD. Rashid Ali"]', 'CRUD Admin');
    await page.fill('input[placeholder="••••••••"]', password);
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*verify-otp/, { timeout: 30000 });

    // 2. Auto-Verification
    const verificationLink = `http://localhost:3000/verify-otp?email=${encodeURIComponent(email)}&otp=111111`;
    await page.goto(verificationLink);
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 45000 });
    console.log('Step 2: Logged in and reached Dashboard.');

    // 3. Add Model
    console.log('Step 3: Adding Product Model...');
    await page.goto('http://localhost:3000/settings/products');
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Add Model")');
    await page.fill('input[placeholder="e.g. Samsung"]', 'CRUD-Brand');
    await page.fill('input[placeholder="e.g. S24 Ultra"]', testProduct);
    await page.fill('input[placeholder="Mixed / Black / Blue"]', 'Titanium');
    await page.fill('input[placeholder="12GB"]', '12GB');
    await page.fill('input[placeholder="512GB"]', '256GB');
    
    const priceInputs = page.locator('input[type="number"]');
    await priceInputs.nth(0).fill('45000');
    await priceInputs.nth(1).fill('55000');
    
    await page.click('button:has-text("Save Model")');
    await expect(page.locator('text=Success!')).toBeVisible();
    console.log(`Product created: ${testProduct}`);

    // Wait for the Add Model dialog to close
    await expect(page.locator('text=Add New Model')).not.toBeVisible({ timeout: 10000 });
    
    // 4. Edit Model
    console.log('Step 4: Editing Product Model...');
    // Find the row and wait for it
    const row = page.locator('tr').filter({ hasText: testProduct });
    await expect(row).toBeVisible({ timeout: 15000 });
    
    // There are 3 buttons in the row: Stock, Edit, Delete
    // nth(1) is Edit
    await row.locator('button').nth(1).click();
    
    // Wait for Edit dialog to appear using getByRole for reliable detection
    const editDialog = page.getByRole('dialog');
    await expect(editDialog).toBeVisible({ timeout: 15000 });
    await expect(editDialog.locator('h2')).toContainText('Edit Model');
    
    // In Edit dialog, find inputs by their parent div's label text
    await editDialog.locator('div:has(> label:has-text("RAM")) input').fill('16GB'); 
    await editDialog.locator('div:has(> label:has-text("Storage")) input').fill('512GB');
    
    // For number inputs in edit mode (Cost and Sales price)
    const editPriceInputs = editDialog.locator('input[type="number"]');
    await editPriceInputs.nth(0).fill('48000');
    await editPriceInputs.nth(1).fill('58000');
    
    await editDialog.getByRole('button', { name: 'Update Model' }).click();
    await expect(page.locator('text=Updated!')).toBeVisible();
    console.log('Product updated.');

    // 5. Delete Model
    console.log('Step 5: Deleting Product Model...');
    // Find the row again
    const rowToDelete = page.locator('tr').filter({ hasText: testProduct });
    
    // nth(2) is Delete
    page.once('dialog', dialog => dialog.accept());
    await rowToDelete.locator('button').nth(2).click();
    
    await expect(page.locator('text=Deleted!')).toBeVisible();
    console.log('Product deleted.');

    // Verify it's gone
    await expect(page.locator('tr').filter({ hasText: testProduct })).not.toBeVisible({ timeout: 10000 });
    console.log('CRUD verification complete.');
  });
});
