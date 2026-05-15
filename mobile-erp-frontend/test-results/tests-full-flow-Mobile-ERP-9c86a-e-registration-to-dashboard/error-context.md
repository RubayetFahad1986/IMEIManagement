# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/full-flow.spec.ts >> Mobile ERP Business Lifecycle >> full cycle: registration to dashboard
- Location: tests/full-flow.spec.ts:13:7

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
    30 × unexpected value "http://localhost:3000/signup"

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
                - textbox "Elite Mobile Ltd." [ref=e66]: Company 1778814433039
              - generic [ref=e67]:
                - generic [ref=e68]: Global Phone
                - textbox "+880..." [ref=e69]: "01700000000"
            - generic [ref=e70]:
              - generic [ref=e71]: Admin Official Email
              - textbox "admin@company.com" [ref=e72]: user1778814433039@test.com
            - generic [ref=e73]:
              - generic [ref=e74]:
                - generic [ref=e75]: Admin Full Name
                - textbox "MD. Rashid Ali" [ref=e76]: Test Admin
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
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | /**
  4  |  * End-to-End Test for Mobile ERP
  5  |  * Flows: Registration -> OTP Verification -> Login -> Entry -> Logout
  6  |  */
  7  | test.describe('Mobile ERP Business Lifecycle', () => {
  8  |   const timestamp = Date.now();
  9  |   const email = `user${timestamp}@test.com`;
  10 |   const companyName = `Company ${timestamp}`;
  11 |   const password = 'Password123!';
  12 | 
  13 |   test('full cycle: registration to dashboard', async ({ page }) => {
  14 |     // 1. Registration
  15 |     console.log(`Starting registration for ${email}...`);
  16 |     await page.goto('http://localhost:3000/signup');
  17 |     await page.fill('input[placeholder="Elite Mobile Ltd."]', companyName);
  18 |     await page.fill('input[placeholder="admin@company.com"]', email);
  19 |     await page.fill('input[placeholder="+880..."]', '01700000000');
  20 |     await page.fill('input[placeholder="MD. Rashid Ali"]', 'Test Admin');
  21 |     await page.fill('input[placeholder="••••••••"]', password);
  22 |     
  23 |     // Listen for console messages from the browser
  24 |     page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  25 | 
  26 |     await page.click('button:has-text("Launch Network")');
  27 |     
  28 |     // Should navigate to verify-otp
> 29 |     await expect(page).toHaveURL(/.*verify-otp/, { timeout: 30000 });
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  30 |     console.log('Registration successful, moved to OTP page');
  31 |   });
  32 | });
  33 | 
```