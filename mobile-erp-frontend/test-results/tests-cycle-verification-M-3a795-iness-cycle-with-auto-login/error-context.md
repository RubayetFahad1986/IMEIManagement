# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/cycle-verification.spec.ts >> Mobile ERP Full Cycle Verification >> should complete full business cycle with auto-login
- Location: tests/cycle-verification.spec.ts:17:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /.*dashboard/
Received string:  "http://localhost:3000/verify-otp?email=test.v2.cycle%40test.com&otp=714124"

Call log:
  - Expect "toHaveURL" with timeout 45000ms
    33 × unexpected value "http://localhost:3000/verify-otp?email=test.v2.cycle%40test.com&otp=714124"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e5]:
        - generic [ref=e6]:
          - img [ref=e8]
          - generic [ref=e11]: Identity Lock
          - generic [ref=e12]:
            - text: We sent a verification code to
            - text: test.v2.cycle@test.com
        - generic [ref=e13]:
          - generic [ref=e14]:
            - generic [ref=e15]:
              - generic [ref=e16]: Enter 6-Digit OTP
              - textbox "000000" [ref=e17]: "714124"
            - generic [ref=e18]:
              - img [ref=e19]
              - paragraph [ref=e22]: If you don't see it, please check your spam folder or the backend console log for mock delivery.
          - generic [ref=e23]:
            - button "Unlock My Account" [ref=e24]
            - button "Resend Code (Wait 59s)" [ref=e25]
      - link "Return to Login" [ref=e26] [cursor=pointer]:
        - /url: /login
    - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e32] [cursor=pointer]:
    - img [ref=e33]
  - alert [ref=e36]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | /**
  4   |  * End-to-End Test for Mobile ERP
  5   |  * Verifies: Auto-Verification -> Dashboard -> Product -> Contact -> Purchase -> Sale -> Logout
  6   |  */
  7   | test.describe('Mobile ERP Full Cycle Verification', () => {
  8   |   const email = 'test.v2.cycle@test.com';
  9   |   const otp = '714124';
  10  |   const verificationLink = `http://localhost:3000/verify-otp?email=${encodeURIComponent(email)}&otp=${otp}`;
  11  |   
  12  |   const testId = Date.now();
  13  |   const testProduct = `Cycle Phone ${testId}`;
  14  |   const testContact = `Cycle Partner ${testId}`;
  15  |   const testImei = `CYC-${testId}`;
  16  | 
  17  |   test('should complete full business cycle with auto-login', async ({ page }) => {
  18  |     // Listen for console messages from the browser
  19  |     page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  20  |     page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  21  | 
  22  |     // 1. Auto-Verification & Login
  23  |     console.log('Navigating to verification link...');
  24  |     await page.goto(verificationLink);
  25  |     
  26  |     // Should automatically redirect to dashboard
  27  |     console.log('Waiting for redirect to dashboard...');
> 28  |     await expect(page).toHaveURL(/.*dashboard/, { timeout: 45000 });
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  29  |     console.log('Verified and redirected to Dashboard successfully.');
  30  | 
  31  |     // 2. Add Master Product
  32  |     console.log('Adding Master Product...');
  33  |     await page.goto('http://localhost:3000/settings/products');
  34  |     await page.waitForLoadState('networkidle');
  35  |     
  36  |     await page.click('button:has-text("Add Master Model")');
  37  |     await page.fill('input[name="brand"]', 'CycleBrand');
  38  |     await page.fill('input[name="modelName"]', testProduct);
  39  |     await page.fill('input[name="ram"]', '12GB');
  40  |     await page.fill('input[name="storage"]', '512GB');
  41  |     await page.fill('input[name="defaultCostPrice"]', '50000');
  42  |     await page.fill('input[name="defaultSalesPrice"]', '65000');
  43  |     await page.click('button:has-text("Save to Master")');
  44  |     console.log(`Master Product added: ${testProduct}`);
  45  | 
  46  |     // 3. Add Contact
  47  |     console.log('Adding Contact...');
  48  |     await page.goto('http://localhost:3000/contacts');
  49  |     await page.waitForLoadState('networkidle');
  50  |     await page.click('button:has-text("Add New Contact")');
  51  |     await page.fill('input[name="name"]', testContact);
  52  |     await page.fill('input[name="phone"]', '018' + Math.floor(Math.random() * 10000000).toString());
  53  |     await page.click('label:has-text("Supplier")');
  54  |     await page.click('button:has-text("Save Contact")');
  55  |     console.log(`Contact added: ${testContact}`);
  56  | 
  57  |     // 4. Record Purchase
  58  |     console.log('Recording Purchase...');
  59  |     await page.goto('http://localhost:3000/purchases/Entry');
  60  |     await page.waitForLoadState('networkidle');
  61  |     
  62  |     await page.click('button:has-text("Search Supplier...")');
  63  |     await page.fill('input[placeholder="Search..."]', testContact);
  64  |     await page.locator(`.bg-popover div:text-is("${testContact}")`).click();
  65  |     
  66  |     await page.click('button:has-text("Add New Row")');
  67  |     await page.click('button:has-text("Search Device...")');
  68  |     await page.fill('input[placeholder="Search..."]', testProduct);
  69  |     await page.locator(`.bg-popover div:has-text("${testProduct}")`).first().click();
  70  |     
  71  |     await page.fill('textarea[placeholder*="IMEIs"]', testImei);
  72  |     await page.click('button:has-text("Finalize Purchase")');
  73  |     
  74  |     await expect(page).toHaveURL(/.*reports\/invoice\/purchase/, { timeout: 30000 });
  75  |     console.log('Purchase recorded.');
  76  | 
  77  |     // 5. POS Sale
  78  |     console.log('Processing Sale in POS...');
  79  |     await page.goto('http://localhost:3000/pos');
  80  |     await page.waitForLoadState('networkidle');
  81  |     await page.fill('input[placeholder*="IMEI"]', testImei);
  82  |     await page.locator(`div:has-text("${testImei}")`).first().click();
  83  |     
  84  |     await page.click('button:has-text("Complete Sale")');
  85  |     await expect(page.locator('text=Sale completed!')).toBeVisible({ timeout: 15000 });
  86  |     console.log('Sale completed in POS.');
  87  | 
  88  |     // 6. Verify Sales History
  89  |     await page.goto('http://localhost:3000/sales');
  90  |     await page.waitForLoadState('networkidle');
  91  |     await expect(page.locator('table')).toContainText(testImei.slice(-4), { timeout: 10000 });
  92  |     console.log('Verified sale in history.');
  93  | 
  94  |     // 7. Logout
  95  |     await page.goto('http://localhost:3000/dashboard');
  96  |     const logoutBtn = page.locator('button:has-text("Logout"), a:has-text("Logout")').first();
  97  |     if (await logoutBtn.isVisible()) {
  98  |         await logoutBtn.click();
  99  |         await expect(page).toHaveURL(/.*login|.*/);
  100 |         console.log('Logged out successfully.');
  101 |     }
  102 |   });
  103 | });
  104 | 
```