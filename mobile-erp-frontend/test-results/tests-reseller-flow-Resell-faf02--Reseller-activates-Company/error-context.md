# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/reseller-flow.spec.ts >> Reseller Full Ecosystem Flow >> SuperAdmin creates Reseller -> Reseller activates Company
- Location: tests/reseller-flow.spec.ts:9:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /.*dashboard/
Received string:  "http://localhost:3000/login"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    9 × unexpected value "http://localhost:3000/login"

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
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Reseller Full Ecosystem Flow', () => {
  4  |   const timestamp = Date.now();
  5  |   const resellerEmail = `reseller${timestamp}@test.com`;
  6  |   const companyEmail = `client${timestamp}@test.com`;
  7  |   const promoCode = `TEST${timestamp.toString().slice(-4)}`;
  8  | 
  9  |   test('SuperAdmin creates Reseller -> Reseller activates Company', async ({ page }) => {
  10 |     // 1. SuperAdmin Login
  11 |     await page.goto('http://localhost:3000/login');
  12 |     await page.fill('input[id="username"]', 'admin');
  13 |     await page.fill('input[id="password"]', 'Admin123');
  14 |     await page.click('button:has-text("Login Securely")');
> 15 |     await expect(page).toHaveURL(/.*dashboard/);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  16 | 
  17 |     // 2. Create Reseller User
  18 |     await page.goto('http://localhost:3000/settings/users');
  19 |     await page.click('button:has-text("Create User")');
  20 |     await page.fill('input[placeholder="e.g. johndoe"]', `reseller_${timestamp}`);
  21 |     await page.fill('input[placeholder="e.g. John Doe"]', `Partner ${timestamp}`);
  22 |     await page.fill('input[placeholder="e.g. john@company.com"]', resellerEmail);
  23 |     await page.selectOption('select', 'Reseller');
  24 |     await page.click('button:has-text("Save User")');
  25 |     await expect(page.locator('table')).toContainText(resellerEmail);
  26 | 
  27 |     // 3. Configure Reseller (Promo Code & Licenses)
  28 |     await page.goto('http://localhost:3000/settings/resellers');
  29 |     // Find our reseller row
  30 |     const row = page.locator('tr', { hasText: resellerEmail });
  31 |     await row.locator('button:has-text("Promo Code")').click();
  32 |     await page.fill('input[placeholder="e.g. DHAKA2026"]', promoCode);
  33 |     await page.click('button:has-text("Update Code")');
  34 |     
  35 |     await row.locator('button:has-text("Add Copies")').click();
  36 |     await page.fill('input[type="number"]', '50');
  37 |     await page.click('button:has-text("Confirm & Deposit")');
  38 |     await expect(row).toContainText('50');
  39 | 
  40 |     // 4. Logout SuperAdmin
  41 |     await page.goto('http://localhost:3000/dashboard');
  42 |     await page.click('button:has-text("admin")'); // User profile trigger
  43 |     await page.click('button:has-text("Logout")');
  44 |     await expect(page).toHaveURL('http://localhost:3000/');
  45 | 
  46 |     // 5. New Company Signup with Promo Code
  47 |     console.log('Step 5: Signing up new company with promo code:', promoCode);
  48 |     await page.goto('http://localhost:3000/signup');
  49 |     await page.fill('input[placeholder="Elite Mobile Ltd."]', `Client of ${promoCode}`);
  50 |     await page.fill('input[placeholder="admin@company.com"]', companyEmail);
  51 |     await page.fill('input[placeholder="+880..."]', '01900000000');
  52 |     await page.fill('input[placeholder="MD. Rashid Ali"]', 'Client Admin');
  53 |     await page.fill('input[placeholder="••••••••"]', 'Password123!');
  54 |     await page.fill('input[placeholder="E.G. PARTNER2026"]', promoCode);
  55 |     
  56 |     const signupBtn = page.locator('button:has-text("Launch Network")');
  57 |     await expect(signupBtn).toBeEnabled();
  58 |     await signupBtn.click();
  59 |     
  60 |     await expect(page).toHaveURL(/.*verify-otp/, { timeout: 30000 });
  61 |     console.log('Signup successful for client');
  62 | 
  63 |     // 6. Reseller Login & Activation
  64 |     await page.goto('http://localhost:3000/login');
  65 |     await page.fill('input[id="username"]', resellerEmail);
  66 |     await page.fill('input[id="password"]', 'Admin123');
  67 |     await page.click('button:has-text("Login Securely")');
  68 |     
  69 |     await page.goto('http://localhost:3000/reseller');
  70 |     await expect(page.locator('table')).toContainText(companyEmail);
  71 |     await page.click('button:has-text("Activate Now")');
  72 |     await expect(page.locator('text=Activated')).toBeVisible();
  73 |     await expect(page.locator('text=Remaining Balance')).toContainText('49');
  74 |   });
  75 | });
  76 | 
```