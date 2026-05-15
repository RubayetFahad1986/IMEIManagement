import { test, expect } from '@playwright/test';

test.describe('Contacts Page Functionality', () => {
  const testId = Date.now();
  const contactName = `Test Contact ${testId}`;
  const updatedContactName = `${contactName} Updated`;
  const contactPhone = `017${testId.toString().slice(-8)}`;

  test.beforeEach(async ({ page }) => {
    // 1. Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[id="username"]', 'admin');
    await page.fill('input[id="password"]', 'Admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  });

  test('should create, read, update, and delete a contact', async ({ page }) => {
    // Navigate to Contacts page
    await page.goto('http://localhost:3000/contacts');
    await expect(page.locator('h1', { hasText: 'Business Contacts' })).toBeVisible();

    // 1. Create
    await page.click('button:has-text("Add New Contact")');
    await page.waitForSelector('div[role="dialog"]');
    
    await page.fill('input[name="name"]', contactName);
    await page.fill('input[name="phone"]', contactPhone);
    await page.fill('input[name="email"]', `test${testId}@example.com`);
    await page.fill('input[name="address"]', `123 Test St ${testId}`);
    
    // Check both Customer and Supplier
    const isCustomerCheckbox = page.locator('label[for="isCust"]');
    const isSupplierCheckbox = page.locator('label[for="isSupp"]');
    
    // If not checked, check them (it should be customer by default but we'll click supplier)
    await page.click('label[for="isSupp"]');
    
    await page.click('button:has-text("Save Contact")');
    
    // Toast notification check
    await expect(page.locator('text=Contact created successfully!')).toBeVisible({ timeout: 10000 });

    // 2. Read (Search)
    await page.fill('input[placeholder="Search name or phone..."]', contactName);
    // Wait for the table to filter
    await page.waitForTimeout(1000); // Wait for debounce
    await expect(page.locator('table')).toContainText(contactName, { timeout: 10000 });

    // 3. Update
    // Click the Edit button in the row containing the contactName
    const row = page.locator('tr', { hasText: contactName });
    await row.locator('button.text-blue-600').click();
    
    await page.waitForSelector('div[role="dialog"]', { state: 'visible' });
    await expect(page.locator('h2', { hasText: 'Edit Contact' })).toBeVisible();
    
    // Clear and fill new name
    const editDialog = page.locator('div[role="dialog"]');
    await editDialog.locator('input').nth(0).fill(updatedContactName);
    await editDialog.locator('button:has-text("Update Contact")').click();
    
    await expect(page.locator('text=Contact updated successfully!')).toBeVisible({ timeout: 10000 });
    
    // Search for updated name
    await page.fill('input[placeholder="Search name or phone..."]', updatedContactName);
    await page.waitForTimeout(1000);
    await expect(page.locator('table')).toContainText(updatedContactName, { timeout: 10000 });

    // 4. Delete
    page.on('dialog', dialog => dialog.accept()); // Handle the confirm dialog
    const updatedRow = page.locator('tr', { hasText: updatedContactName });
    await updatedRow.locator('button.text-destructive').click();
    
    await expect(page.locator('text=Contact deleted!')).toBeVisible({ timeout: 10000 });
    
    // Verify deletion
    await page.fill('input[placeholder="Search name or phone..."]', updatedContactName);
    await page.waitForTimeout(1000);
    await expect(page.locator('table')).not.toContainText(updatedContactName);
  });
});
