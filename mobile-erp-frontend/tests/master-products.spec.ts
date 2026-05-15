import { test, expect } from '@playwright/test';

test.describe('Master Product List Functionality', () => {
  const testId = Date.now();
  const testBrand = `TestBrand${testId}`;
  const testModel = `TestModel ${testId}`;
  const updatedModel = `${testModel} Pro`;

  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[id="username"]', 'admin');
    await page.fill('input[id="password"]', 'Admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  });

  test('should create, read, update, and delete a product model', async ({ page }) => {
    // Navigate to Master Products page
    await page.goto('http://localhost:3000/settings/products');
    await expect(page.locator('h1', { hasText: 'Product Master' })).toBeVisible();

    // 1. Create Model
    await page.click('button:has-text("Add Model")');
    const addDialog = page.locator('div[role="dialog"]');
    await expect(addDialog).toBeVisible();
    await expect(addDialog.locator('h2', { hasText: 'Add New Model' })).toBeVisible();

    await addDialog.locator('input[placeholder="e.g. Samsung"]').fill(testBrand);
    await addDialog.locator('input[placeholder="e.g. S24 Ultra"]').fill(testModel);
    await addDialog.locator('input[placeholder="Mixed / Black / Blue"]').fill('Black');
    await addDialog.locator('input[placeholder="12GB"]').fill('8GB');
    await addDialog.locator('input[placeholder="512GB"]').fill('256GB');
    
    // The Cost Price is the first number input, Sales price is the second
    await addDialog.locator('input[type="number"]').nth(0).fill('10000');
    await addDialog.locator('input[type="number"]').nth(1).fill('12000');
    
    await addDialog.locator('button:has-text("Save Model")').click();
    await expect(addDialog).toBeHidden();
    
    // Toast
    await expect(page.locator('text=Success!')).toBeVisible({ timeout: 10000 });

    // 2. Read (Search)
    const searchInput = page.locator('input[placeholder="Search local models..."]');
    await searchInput.fill(testModel);
    await page.waitForTimeout(1000); // Wait for debounce

    const table = page.locator('table');
    await expect(table).toContainText(testModel, { timeout: 10000 });

    // 3. Update Model
    const row = page.locator('tr', { hasText: testModel });
    // In the actions cell, there are Info, Edit, and Delete buttons. 
    // We can select the Edit button by picking the second button in the row or the first button that doesn't have text-destructive or Info icon.
    // Let's use the nth(1) button since Info is nth(0), Edit is nth(1), Delete is nth(2)
    await row.locator('button').nth(1).click();

    const editDialog = page.locator('div[role="dialog"]');
    await expect(editDialog).toBeVisible();
    await expect(editDialog.locator('h2', { hasText: 'Edit Model' })).toBeVisible();

    // Update Model Name (second text input in dialog)
    // There are 7 inputs: Brand, Model, Color, RAM, Storage, Cost Price, Sales Price.
    // Index 1 is Model
    await editDialog.locator('input').nth(1).fill(updatedModel);
    await editDialog.locator('button:has-text("Update Model")').click();
    await expect(editDialog).toBeHidden();

    await expect(page.locator('text=Updated!')).toBeVisible({ timeout: 10000 });

    // Search for updated model
    await searchInput.fill(updatedModel);
    await page.waitForTimeout(1000);
    await expect(table).toContainText(updatedModel, { timeout: 10000 });

    // 4. Delete Model
    page.on('dialog', dialog => dialog.accept()); // Handle confirm dialog
    const updatedRow = page.locator('tr', { hasText: updatedModel });
    await updatedRow.locator('button.text-destructive').click();

    await expect(page.locator('text=Deleted!')).toBeVisible({ timeout: 10000 });

    // Verify deletion
    await searchInput.fill(updatedModel);
    await page.waitForTimeout(1000);
    await expect(table).not.toContainText(updatedModel);

    // 5. Test GSM Archive Dialog
    await page.click('button:has-text("GSM Archive")');
    const globalDialog = page.locator('div[role="dialog"]');
    await expect(globalDialog).toBeVisible();
    await expect(globalDialog.locator('h2', { hasText: 'GSM Archive' })).toBeVisible();
    // Use keyboard escape to close since there might be an X or click outside, playwright handles escape well
    await page.keyboard.press('Escape');
    await expect(globalDialog).toBeHidden();
  });
});
