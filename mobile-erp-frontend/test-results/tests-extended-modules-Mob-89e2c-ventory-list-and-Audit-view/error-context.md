# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/extended-modules.spec.ts >> Mobile ERP Extended Modules >> Inventory: Verify Inventory list and Audit view
- Location: tests/extended-modules.spec.ts:46:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /.*dashboard/
Received string:  "http://localhost:3000/login"
Timeout: 15000ms

Call log:
  - Expect "toHaveURL" with timeout 15000ms
    19 × unexpected value "http://localhost:3000/login"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - link "Back to Website" [ref=e7] [cursor=pointer]:
        - /url: /
        - img [ref=e8]
        - text: Back to Website
      - generic [ref=e10]:
        - generic [ref=e11]:
          - img [ref=e13]
          - generic [ref=e15]: Welcome Back
          - generic [ref=e16]: Enter credentials to access ERP
        - generic [ref=e19]:
          - button "Google এর মাধ্যমে সাইন-ইন করুন. নতুন ট্যাবে খোলে" [ref=e21] [cursor=pointer]:
            - generic [ref=e23]:
              - img [ref=e26]
              - generic [ref=e33]: Google এর মাধ্যমে সাইন-ইন করুন
          - iframe
        - generic [ref=e36]: Or Continue With
        - generic [ref=e38]:
          - generic [ref=e39]:
            - generic [ref=e40]:
              - generic [ref=e41]: Login ID / Email
              - textbox "admin@example.com" [ref=e42]: admin
            - generic [ref=e43]:
              - generic [ref=e44]:
                - generic [ref=e45]: Secret Key
                - link "Forgot?" [ref=e46] [cursor=pointer]:
                  - /url: "#"
              - textbox [ref=e47]: Admin123
          - generic [ref=e48]:
            - button "Login Securely" [ref=e49]
            - paragraph [ref=e50]:
              - text: New Company?
              - link "Register Now" [ref=e51] [cursor=pointer]:
                - /url: /signup
      - paragraph [ref=e52]: Dominate Software Solution © 2026
    - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e58] [cursor=pointer]:
    - img [ref=e59]
  - alert [ref=e62]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | /**
  4   |  * Extended Modules Test Suite
  5   |  * Covers: Accounting (Expenses), Inventory (Transfers), Stolen Registry, Staff, and Settings
  6   |  */
  7   | test.describe('Mobile ERP Extended Modules', () => {
  8   |   const timestamp = Date.now();
  9   |   
  10  |   test.beforeEach(async ({ page }) => {
  11  |     // Shared Login for all tests
  12  |     await page.goto('http://localhost:3000/login');
  13  |     await page.fill('input[id="username"]', 'admin');
  14  |     await page.fill('input[id="password"]', 'Admin123');
  15  |     await page.click('button[type="submit"]');
> 16  |     await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  17  |   });
  18  | 
  19  |   test('Accounting: Record and verify expense', async ({ page }) => {
  20  |     test.setTimeout(60000);
  21  |     await page.goto('http://localhost:3000/accounting/expenses');
  22  |     await page.waitForLoadState('networkidle');
  23  |     
  24  |     // Click the "New Expense" tab trigger
  25  |     await page.click('button[role="tab"]:has-text("New Expense")');
  26  |     
  27  |     const expenseTitle = `Office Utility ${timestamp}`;
  28  |     await page.fill('input[placeholder="Optional notes..."]', expenseTitle);
  29  |     
  30  |     // Select an account from the searchable select
  31  |     await page.click('button:has-text("Select option...")');
  32  |     await page.locator('.bg-popover div').first().click();
  33  |     
  34  |     await page.fill('input[type="number"]', '1500');
  35  |     
  36  |     await page.click('button:has-text("Save Expense")');
  37  |     
  38  |     // Wait for the "Expense recorded!" toast and list reload
  39  |     await expect(page.locator('text=Expense recorded!')).toBeVisible({ timeout: 20000 });
  40  |     
  41  |     // Switch back to list tab
  42  |     await page.click('button[role="tab"]:has-text("Expense List")');
  43  |     await expect(page.locator('table')).toContainText(expenseTitle, { timeout: 15000 });
  44  |   });
  45  | 
  46  |   test('Inventory: Verify Inventory list and Audit view', async ({ page }) => {
  47  |     test.setTimeout(60000);
  48  |     await page.goto('http://localhost:3000/inventory');
  49  |     await page.waitForLoadState('networkidle');
  50  |     
  51  |     // Check if table has content
  52  |     await expect(page.locator('table')).toBeVisible({ timeout: 20000 });
  53  |     
  54  |     // Open Audit Console from Dashboard
  55  |     await page.goto('http://localhost:3000/dashboard');
  56  |     await page.waitForLoadState('networkidle');
  57  |     await page.click('text=STOCK VALUE');
  58  |     await expect(page.locator('text=Stock Audit Console')).toBeVisible({ timeout: 15000 });
  59  |   });
  60  | 
  61  |   test('Stolen Registry: Add and search stolen device', async ({ page }) => {
  62  |     test.setTimeout(60000);
  63  |     await page.goto('http://localhost:3000/stolen-registry');
  64  |     await page.waitForLoadState('networkidle');
  65  |     
  66  |     await page.click('button:has-text("Start New Report")');
  67  |     const stolenImei = `STOLEN${timestamp.toString().slice(-10)}`;
  68  |     
  69  |     await page.fill('label:has-text("IMEI 1") + input', stolenImei);
  70  |     await page.fill('input[placeholder*="iPhone 15 Pro Max"]', 'Lost Phone ' + timestamp);
  71  |     await page.fill('label:has-text("Your Name") + input', 'Test Reporter');
  72  |     await page.fill('label:has-text("Contact Phone") + input', '01712345678');
  73  |     
  74  |     await page.click('button:has-text("Submit Report")');
  75  |     await expect(page.locator('text=Device reported successfully')).toBeVisible({ timeout: 20000 });
  76  |     
  77  |     // Search for it
  78  |     await page.fill('input[placeholder*="IMEI 1 or 2"]', stolenImei);
  79  |     await page.click('button:has-text("Check")');
  80  |     
  81  |     await expect(page.locator('text=STOLEN DEVICE DETECTED')).toBeVisible({ timeout: 20000 });
  82  |   });
  83  | 
  84  |   test('Staff: Verify staff list', async ({ page }) => {
  85  |     await page.goto('http://localhost:3000/staff');
  86  |     await page.waitForLoadState('networkidle');
  87  |     await expect(page.locator('h1')).toContainText('Staff');
  88  |     await expect(page.locator('table')).toBeVisible();
  89  |   });
  90  | 
  91  |   test('Settings: Update Company Profile', async ({ page }) => {
  92  |     await page.goto('http://localhost:3000/settings/company');
  93  |     await page.waitForLoadState('networkidle');
  94  |     
  95  |     const newName = `GTR Mobile ${timestamp}`;
  96  |     await page.fill('input[placeholder="Elite Mobile Ltd."]', newName);
  97  |     await page.click('button:has-text("Update Profile")');
  98  |     
  99  |     // Verify toast or page update
  100 |     await expect(page.locator(`text=${newName}`)).toBeVisible();
  101 |   });
  102 | });
  103 | 
```