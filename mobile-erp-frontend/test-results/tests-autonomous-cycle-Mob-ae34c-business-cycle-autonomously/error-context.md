# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/autonomous-cycle.spec.ts >> Mobile ERP Full Lifecycle Autonomous Verification >> should complete full business cycle autonomously
- Location: tests/autonomous-cycle.spec.ts:17:7

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
                - textbox "Elite Mobile Ltd." [ref=e66]: Demo ERP 1778814433045
              - generic [ref=e67]:
                - generic [ref=e68]: Global Phone
                - textbox "+880..." [ref=e69]: "01700000000"
            - generic [ref=e70]:
              - generic [ref=e71]: Admin Official Email
              - textbox "admin@company.com" [ref=e72]: test.1778814433045@test.com
            - generic [ref=e73]:
              - generic [ref=e74]:
                - generic [ref=e75]: Admin Full Name
                - textbox "MD. Rashid Ali" [ref=e76]: Demo Admin
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
  4   |  * Autonomous End-to-End Test for Mobile ERP
  5   |  * Verifies: Signup -> Auto-Verify (Link) -> Dashboard -> Product -> Contact -> Purchase -> Sale -> Logout
  6   |  */
  7   | test.describe('Mobile ERP Full Lifecycle Autonomous Verification', () => {
  8   |   const timestamp = Date.now();
  9   |   const email = `test.${timestamp}@test.com`;
  10  |   const companyName = `Demo ERP ${timestamp}`;
  11  |   const password = 'Password123!';
  12  |   const testId = timestamp;
  13  |   const testProduct = `Demo Phone ${testId}`;
  14  |   const testContact = `Demo Partner ${testId}`;
  15  |   const testImei = `DEMO-${testId}`;
  16  | 
  17  |   test('should complete full business cycle autonomously', async ({ page }) => {
  18  |     // Listen for console messages from the browser
  19  |     page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  20  |     page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  21  | 
  22  |     // 1. Signup
  23  |     console.log(`Step 1: Signing up with ${email}...`);
  24  |     await page.goto('http://localhost:3000/signup');
  25  |     await page.fill('input[placeholder="Elite Mobile Ltd."]', companyName);
  26  |     await page.fill('input[placeholder="admin@company.com"]', email);
  27  |     await page.fill('input[placeholder="+880..."]', '01700000000');
  28  |     await page.fill('input[placeholder="MD. Rashid Ali"]', 'Demo Admin');
  29  |     await page.fill('input[placeholder="••••••••"]', password);
  30  |     await page.click('button:has-text("Launch Network")');
  31  |     
  32  |     // Wait for redirect to verify-otp
> 33  |     await expect(page).toHaveURL(/.*verify-otp/, { timeout: 30000 });
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  34  |     console.log('Step 2: Reached OTP page. Triggering auto-verification link...');
  35  | 
  36  |     // 2. Use the fixed OTP '111111' in the URL to trigger auto-verify
  37  |     const verificationLink = `http://localhost:3000/verify-otp?email=${encodeURIComponent(email)}&otp=111111`;
  38  |     await page.goto(verificationLink);
  39  |     
  40  |     // Should automatically redirect to dashboard
  41  |     console.log('Waiting for auto-login redirect to dashboard...');
  42  |     await expect(page).toHaveURL(/.*dashboard/, { timeout: 45000 });
  43  |     console.log('Step 3: Auto-logged in and reached Dashboard.');
  44  | 
  45  |     // 3. Add Master Product
  46  |     console.log('Step 4: Adding Master Product...');
  47  |     await page.goto('http://localhost:3000/settings/products');
  48  |     await page.waitForLoadState('networkidle');
  49  |     
  50  |     await page.click('button:has-text("Add Model")');
  51  |     await page.fill('input[placeholder="e.g. Samsung"]', 'DemoBrand');
  52  |     await page.fill('input[placeholder="e.g. S24 Ultra"]', testProduct);
  53  |     await page.fill('input[placeholder="12GB"]', '16GB');
  54  |     await page.fill('input[placeholder="512GB"]', '1TB');
  55  |     
  56  |     // Using nth(0) and nth(1) for prices since they are type="number" without unique placeholders
  57  |     const priceInputs = page.locator('input[type="number"]');
  58  |     await priceInputs.nth(0).fill('75000');
  59  |     await priceInputs.nth(1).fill('90000');
  60  |     
  61  |     await page.click('button:has-text("Save Model")');
  62  |     console.log(`Product added: ${testProduct}`);
  63  | 
  64  |     // 4. Add Contact
  65  |     console.log('Step 5: Adding Contact...');
  66  |     await page.goto('http://localhost:3000/contacts');
  67  |     await page.waitForLoadState('networkidle');
  68  |     await page.click('button:has-text("Add New Contact")');
  69  |     await page.fill('input[name="name"]', testContact);
  70  |     await page.fill('input[name="phone"]', '019' + Math.floor(Math.random() * 10000000).toString());
  71  |     await page.click('label:has-text("Supplier")');
  72  |     await page.click('button:has-text("Save Contact")');
  73  |     console.log(`Contact added: ${testContact}`);
  74  | 
  75  |     // 5. Record Purchase
  76  |     console.log('Step 6: Recording Purchase...');
  77  |     await page.goto('http://localhost:3000/purchases/Entry');
  78  |     await page.waitForLoadState('networkidle');
  79  |     
  80  |     await page.click('button:has-text("Search Supplier...")');
  81  |     await page.fill('input[placeholder="Search..."]', testContact);
  82  |     await page.locator(`.bg-popover div:text-is("${testContact}")`).click();
  83  |     
  84  |     await page.click('button:has-text("Add New Row")');
  85  |     await page.click('button:has-text("Search Device...")');
  86  |     await page.fill('input[placeholder="Search..."]', testProduct);
  87  |     await page.locator(`.bg-popover div:has-text("${testProduct}")`).first().click();
  88  |     
  89  |     await page.fill('textarea[placeholder*="IMEIs"]', testImei);
  90  |     await page.click('button:has-text("Finalize Purchase")');
  91  |     
  92  |     await expect(page).toHaveURL(/.*reports\/invoice\/purchase/, { timeout: 45000 });
  93  |     console.log('Purchase recorded.');
  94  | 
  95  |     // 6. POS Sale
  96  |     console.log('Step 7: Processing Sale in POS...');
  97  |     await page.goto('http://localhost:3000/pos');
  98  |     await page.waitForLoadState('networkidle');
  99  |     await page.fill('input[placeholder*="IMEI"]', testImei);
  100 |     await page.locator(`div:has-text("${testImei}")`).first().click();
  101 |     
  102 |     await page.click('button:has-text("Complete Sale")');
  103 |     await expect(page.locator('text=Sale completed!')).toBeVisible({ timeout: 20000 });
  104 |     console.log('Sale completed.');
  105 |   });
  106 | });
  107 | 
```