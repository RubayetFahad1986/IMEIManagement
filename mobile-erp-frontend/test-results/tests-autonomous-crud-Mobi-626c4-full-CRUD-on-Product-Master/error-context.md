# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/autonomous-crud.spec.ts >> Mobile ERP Product Master CRUD >> should perform full CRUD on Product Master
- Location: tests/autonomous-crud.spec.ts:14:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /.*verify-otp/
Received string:  "http://localhost:3000/signup"

Call log:
  - Expect "toHaveURL" with timeout 30000ms
    31 × unexpected value "http://localhost:3000/signup"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e6]:
      - generic [ref=e8]:
        - generic [ref=e9]:
          - generic [ref=e11]:
            - generic [ref=e12]:
              - img [ref=e14]
              - generic [ref=e16]: MobileERP
            - heading "Scale your Inventory faster." [level=2] [ref=e17]:
              - text: Scale your
              - text: Inventory
              - text: faster.
            - paragraph [ref=e18]: The all-in-one distribution platform for mobile retailers.
            - generic [ref=e19]:
              - generic [ref=e20]:
                - img [ref=e22]
                - generic [ref=e25]:
                  - heading "IMEI SECURITY" [level=4] [ref=e26]
                  - paragraph [ref=e27]: Automated fraud detection & tracking
              - generic [ref=e28]:
                - img [ref=e30]
                - generic [ref=e32]:
                  - heading "REAL-TIME SYNC" [level=4] [ref=e33]
                  - paragraph [ref=e34]: Instant stock updates across branches
              - generic [ref=e35]:
                - img [ref=e37]
                - generic [ref=e40]:
                  - heading "SaaS READY" [level=4] [ref=e41]
                  - paragraph [ref=e42]: Access your business from anywhere
              - generic [ref=e43]:
                - img [ref=e45]
                - generic [ref=e48]:
                  - heading "SECURE AUDIT" [level=4] [ref=e49]
                  - paragraph [ref=e50]: Full history of every transaction
          - generic [ref=e52]:
            - generic [ref=e53]:
              - paragraph [ref=e54]: "Configuration:"
              - paragraph [ref=e55]: Monthly Professional
            - paragraph [ref=e57]: 14Days Free
        - generic [ref=e58]:
          - heading "Initialize Account" [level=3] [ref=e60]
          - generic [ref=e62]:
            - generic [ref=e63]:
              - generic [ref=e64]:
                - generic [ref=e65]: Business Identity
                - textbox "Elite Mobile Ltd." [ref=e66]: CRUD Demo ERP 1778814433029
              - generic [ref=e67]:
                - generic [ref=e68]: Global Phone
                - textbox "+880..." [ref=e69]: "01700000000"
            - generic [ref=e70]:
              - generic [ref=e71]: Admin Official Email
              - textbox "admin@company.com" [ref=e72]: crud.test.1778814433029@test.com
            - generic [ref=e73]:
              - generic [ref=e74]:
                - generic [ref=e75]: Admin Full Name
                - textbox "MD. Rashid Ali" [ref=e76]: CRUD Admin
              - generic [ref=e77]:
                - generic [ref=e78]: Secure Password
                - textbox "••••••••" [ref=e79]: Password123!
            - generic [ref=e80]:
              - generic [ref=e81]:
                - generic [ref=e82]: Reseller / Referral (Optional)
                - generic [ref=e83]: VALIDATED ON SIGNUP
              - textbox "E.G. PARTNER2026" [ref=e84]
            - button "Launch Network" [ref=e86]:
              - generic [ref=e87]:
                - text: Launch Network
                - img
            - paragraph [ref=e89]:
              - text: Already have an instance?
              - link "Access Login" [ref=e90] [cursor=pointer]:
                - /url: /login
      - generic [ref=e91]:
        - generic [ref=e92]: Trusted By 500+ Dealers
        - generic [ref=e93]: PCI DSS Compliant
        - generic [ref=e94]: 256-bit Encryption
    - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e100] [cursor=pointer]:
    - img [ref=e101]
  - alert [ref=e104]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | /**
  4   |  * Autonomous Product CRUD Test for Mobile ERP
  5   |  * Verifies: Signup -> Auto-Verify -> Dashboard -> Product Master (Add, Edit, Delete)
  6   |  */
  7   | test.describe('Mobile ERP Product Master CRUD', () => {
  8   |   const timestamp = Date.now();
  9   |   const email = `crud.test.${timestamp}@test.com`;
  10  |   const companyName = `CRUD Demo ERP ${timestamp}`;
  11  |   const password = 'Password123!';
  12  |   const testProduct = `CRUD Phone ${timestamp}`;
  13  | 
  14  |   test('should perform full CRUD on Product Master', async ({ page }) => {
  15  |     page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  16  |     page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  17  | 
  18  |     // 1. Signup
  19  |     console.log(`Step 1: Signing up with ${email}...`);
  20  |     await page.goto('http://localhost:3000/signup');
  21  |     await page.fill('input[placeholder="Elite Mobile Ltd."]', companyName);
  22  |     await page.fill('input[placeholder="admin@company.com"]', email);
  23  |     await page.fill('input[placeholder="+880..."]', '01700000000');
  24  |     await page.fill('input[placeholder="MD. Rashid Ali"]', 'CRUD Admin');
  25  |     await page.fill('input[placeholder="••••••••"]', password);
  26  |     await page.click('button[type="submit"]');
  27  |     
> 28  |     await expect(page).toHaveURL(/.*verify-otp/, { timeout: 30000 });
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  29  | 
  30  |     // 2. Auto-Verification
  31  |     const verificationLink = `http://localhost:3000/verify-otp?email=${encodeURIComponent(email)}&otp=111111`;
  32  |     await page.goto(verificationLink);
  33  |     await expect(page).toHaveURL(/.*dashboard/, { timeout: 45000 });
  34  |     console.log('Step 2: Logged in and reached Dashboard.');
  35  | 
  36  |     // 3. Add Model
  37  |     console.log('Step 3: Adding Product Model...');
  38  |     await page.goto('http://localhost:3000/settings/products');
  39  |     await page.waitForLoadState('networkidle');
  40  |     
  41  |     await page.click('button:has-text("Add Model")');
  42  |     await page.fill('input[placeholder="e.g. Samsung"]', 'CRUD-Brand');
  43  |     await page.fill('input[placeholder="e.g. S24 Ultra"]', testProduct);
  44  |     await page.fill('input[placeholder="Mixed / Black / Blue"]', 'Titanium');
  45  |     await page.fill('input[placeholder="12GB"]', '12GB');
  46  |     await page.fill('input[placeholder="512GB"]', '256GB');
  47  |     
  48  |     const priceInputs = page.locator('input[type="number"]');
  49  |     await priceInputs.nth(0).fill('45000');
  50  |     await priceInputs.nth(1).fill('55000');
  51  |     
  52  |     await page.click('button:has-text("Save Model")');
  53  |     await expect(page.locator('text=Success!')).toBeVisible();
  54  |     console.log(`Product created: ${testProduct}`);
  55  | 
  56  |     // Wait for the Add Model dialog to close
  57  |     await expect(page.locator('text=Add New Model')).not.toBeVisible({ timeout: 10000 });
  58  |     
  59  |     // 4. Edit Model
  60  |     console.log('Step 4: Editing Product Model...');
  61  |     // Find the row and wait for it
  62  |     const row = page.locator('tr').filter({ hasText: testProduct });
  63  |     await expect(row).toBeVisible({ timeout: 15000 });
  64  |     
  65  |     // There are 3 buttons in the row: Stock, Edit, Delete
  66  |     // nth(1) is Edit
  67  |     await row.locator('button').nth(1).click();
  68  |     
  69  |     // Wait for Edit dialog to appear using getByRole for reliable detection
  70  |     const editDialog = page.getByRole('dialog');
  71  |     await expect(editDialog).toBeVisible({ timeout: 15000 });
  72  |     await expect(editDialog.locator('h2')).toContainText('Edit Model');
  73  |     
  74  |     // In Edit dialog, find inputs by their parent div's label text
  75  |     await editDialog.locator('div:has(> label:has-text("RAM")) input').fill('16GB'); 
  76  |     await editDialog.locator('div:has(> label:has-text("Storage")) input').fill('512GB');
  77  |     
  78  |     // For number inputs in edit mode (Cost and Sales price)
  79  |     const editPriceInputs = editDialog.locator('input[type="number"]');
  80  |     await editPriceInputs.nth(0).fill('48000');
  81  |     await editPriceInputs.nth(1).fill('58000');
  82  |     
  83  |     await editDialog.getByRole('button', { name: 'Update Model' }).click();
  84  |     await expect(page.locator('text=Updated!')).toBeVisible();
  85  |     console.log('Product updated.');
  86  | 
  87  |     // 5. Delete Model
  88  |     console.log('Step 5: Deleting Product Model...');
  89  |     // Find the row again
  90  |     const rowToDelete = page.locator('tr').filter({ hasText: testProduct });
  91  |     
  92  |     // nth(2) is Delete
  93  |     page.once('dialog', dialog => dialog.accept());
  94  |     await rowToDelete.locator('button').nth(2).click();
  95  |     
  96  |     await expect(page.locator('text=Deleted!')).toBeVisible();
  97  |     console.log('Product deleted.');
  98  | 
  99  |     // Verify it's gone
  100 |     await expect(page.locator('tr').filter({ hasText: testProduct })).not.toBeVisible({ timeout: 10000 });
  101 |     console.log('CRUD verification complete.');
  102 |   });
  103 | });
  104 | 
```