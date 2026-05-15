# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/crud-operations.spec.ts >> Mobile ERP Full CRUD Flow >> should complete a full business cycle
- Location: tests/crud-operations.spec.ts:9:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[id="username"]')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - navigation [ref=e4]:
        - generic [ref=e5]:
          - generic [ref=e6]:
            - img [ref=e8]
            - generic [ref=e10]: Dominate ERP
          - generic [ref=e11]:
            - link "Features" [ref=e12] [cursor=pointer]:
              - /url: "#features"
            - link "Solutions" [ref=e13] [cursor=pointer]:
              - /url: "#solutions"
            - link "Pricing" [ref=e14] [cursor=pointer]:
              - /url: "#pricing"
            - link "Support" [ref=e15] [cursor=pointer]:
              - /url: "#support"
          - generic [ref=e16]:
            - link "Login" [ref=e17] [cursor=pointer]:
              - /url: /login
            - link "Get Started" [ref=e18] [cursor=pointer]:
              - /url: /signup
              - text: Get Started
              - img
      - generic [ref=e20]:
        - generic [ref=e21]: Next-Gen Inventory Intelligence
        - heading "Command Your Mobile Empire" [level=1] [ref=e22]:
          - text: Command Your
          - text: Mobile Empire
        - paragraph [ref=e23]: The ultimate ERP solution engineered for mobile retailers and distributors. Track IMEIs, manage multi-branch inventory, and automate financial settlements in one high-performance interface.
        - generic [ref=e24]:
          - link "Start Free Trial" [ref=e25] [cursor=pointer]:
            - /url: /signup
          - link "Public IMEI Check" [ref=e26] [cursor=pointer]:
            - /url: /stolen-check
            - img
            - text: Public IMEI Check
        - img "ERP Dashboard" [ref=e30]
      - generic [ref=e32]:
        - generic [ref=e33]:
          - generic [ref=e34]:
            - heading "Built for the Mobile Industry" [level=2] [ref=e35]:
              - text: Built for the
              - text: Mobile Industry
            - paragraph [ref=e36]: Every tool you need to scale from one shop to a global chain.
          - generic [ref=e37]:
            - img [ref=e39]
            - img [ref=e42]
            - img [ref=e46]
        - generic [ref=e49]:
          - link "IMEI Intelligence Scan, track, and audit every single device by IMEI1, IMEI2 or Serial Number with zero errors." [ref=e50] [cursor=pointer]:
            - /url: /signup
            - generic [ref=e52]:
              - img [ref=e54]
              - heading "IMEI Intelligence" [level=3] [ref=e56]
              - paragraph [ref=e57]: Scan, track, and audit every single device by IMEI1, IMEI2 or Serial Number with zero errors.
          - link "Multi-Branch Flow Seamlessly transfer stock between branches with automated transit tracking and verification." [ref=e58] [cursor=pointer]:
            - /url: /signup
            - generic [ref=e60]:
              - img [ref=e62]
              - heading "Multi-Branch Flow" [level=3] [ref=e67]
              - paragraph [ref=e68]: Seamlessly transfer stock between branches with automated transit tracking and verification.
          - link "Smart POS Lightning fast sales interface with support for exchange, partial payments, and digital receipts." [ref=e69] [cursor=pointer]:
            - /url: /signup
            - generic [ref=e71]:
              - img [ref=e73]
              - heading "Smart POS" [level=3] [ref=e77]
              - paragraph [ref=e78]: Lightning fast sales interface with support for exchange, partial payments, and digital receipts.
          - link "Contact Ledgers Full 360-degree audit trail for every customer and supplier with automated due calculation." [ref=e79] [cursor=pointer]:
            - /url: /signup
            - generic [ref=e81]:
              - img [ref=e83]
              - heading "Contact Ledgers" [level=3] [ref=e87]
              - paragraph [ref=e88]: Full 360-degree audit trail for every customer and supplier with automated due calculation.
          - link "Advanced Finance Automated double-entry accounting with real-time balance sheets and expense vouchers." [ref=e89] [cursor=pointer]:
            - /url: /signup
            - generic [ref=e91]:
              - img [ref=e93]
              - heading "Advanced Finance" [level=3] [ref=e95]
              - paragraph [ref=e96]: Automated double-entry accounting with real-time balance sheets and expense vouchers.
          - link "Anti-Theft Registry Integrated stolen device registry to protect your shop from fraudulent inventory." [ref=e97] [cursor=pointer]:
            - /url: /stolen-check
            - generic [ref=e99]:
              - img [ref=e101]
              - heading "Anti-Theft Registry" [level=3] [ref=e103]
              - paragraph [ref=e104]: Integrated stolen device registry to protect your shop from fraudulent inventory.
      - generic [ref=e106]:
        - generic [ref=e107]:
          - heading "Precision Pricing" [level=2] [ref=e108]
          - paragraph [ref=e109]: Choose the plan that fits your growth trajectory
        - generic [ref=e110]:
          - generic [ref=e111]:
            - heading "Monthly" [level=3] [ref=e112]
            - generic [ref=e113]:
              - generic [ref=e114]: ৳2,500
              - generic [ref=e115]: / mo
            - paragraph [ref=e116]: Perfect for single shops
            - generic [ref=e117]:
              - generic [ref=e118]:
                - img [ref=e119]
                - generic [ref=e122]: Unlimited IMEIs
              - generic [ref=e123]:
                - img [ref=e124]
                - generic [ref=e127]: Up to 3 Branches
              - generic [ref=e128]:
                - img [ref=e129]
                - generic [ref=e132]: Contact Ledgers
              - generic [ref=e133]:
                - img [ref=e134]
                - generic [ref=e137]: Mobile POS App
              - generic [ref=e138]:
                - img [ref=e139]
                - generic [ref=e142]: WhatsApp Alerts
            - link "Subscribe Now" [ref=e143] [cursor=pointer]:
              - /url: /signup?plan=Monthly
          - generic [ref=e144]:
            - generic [ref=e145]: Most Selected
            - heading "Quarterly" [level=3] [ref=e146]
            - generic [ref=e147]:
              - generic [ref=e148]: ৳6,500
              - generic [ref=e149]: / 3 mo
            - paragraph [ref=e150]: Popular for growing startups
            - generic [ref=e151]:
              - generic [ref=e152]:
                - img [ref=e153]
                - generic [ref=e156]: Unlimited IMEIs
              - generic [ref=e157]:
                - img [ref=e158]
                - generic [ref=e161]: Up to 3 Branches
              - generic [ref=e162]:
                - img [ref=e163]
                - generic [ref=e166]: Contact Ledgers
              - generic [ref=e167]:
                - img [ref=e168]
                - generic [ref=e171]: Mobile POS App
              - generic [ref=e172]:
                - img [ref=e173]
                - generic [ref=e176]: WhatsApp Alerts
            - link "Subscribe Now" [ref=e177] [cursor=pointer]:
              - /url: /signup?plan=Quarterly
          - generic [ref=e178]:
            - heading "Half-Yearly" [level=3] [ref=e179]
            - generic [ref=e180]:
              - generic [ref=e181]: ৳12,000
              - generic [ref=e182]: / 6 mo
            - paragraph [ref=e183]: Best for established retailers
            - generic [ref=e184]:
              - generic [ref=e185]:
                - img [ref=e186]
                - generic [ref=e189]: Unlimited IMEIs
              - generic [ref=e190]:
                - img [ref=e191]
                - generic [ref=e194]: Up to 3 Branches
              - generic [ref=e195]:
                - img [ref=e196]
                - generic [ref=e199]: Contact Ledgers
              - generic [ref=e200]:
                - img [ref=e201]
                - generic [ref=e204]: Mobile POS App
              - generic [ref=e205]:
                - img [ref=e206]
                - generic [ref=e209]: WhatsApp Alerts
            - link "Subscribe Now" [ref=e210] [cursor=pointer]:
              - /url: /signup?plan=Half-Yearly
          - generic [ref=e211]:
            - heading "Yearly" [level=3] [ref=e212]
            - generic [ref=e213]:
              - generic [ref=e214]: ৳22,000
              - generic [ref=e215]: / 12 mo
            - paragraph [ref=e216]: Full power for enterprise
            - generic [ref=e217]:
              - generic [ref=e218]:
                - img [ref=e219]
                - generic [ref=e222]: Unlimited IMEIs
              - generic [ref=e223]:
                - img [ref=e224]
                - generic [ref=e227]: Up to 3 Branches
              - generic [ref=e228]:
                - img [ref=e229]
                - generic [ref=e232]: Contact Ledgers
              - generic [ref=e233]:
                - img [ref=e234]
                - generic [ref=e237]: Mobile POS App
              - generic [ref=e238]:
                - img [ref=e239]
                - generic [ref=e242]: WhatsApp Alerts
            - link "Subscribe Now" [ref=e243] [cursor=pointer]:
              - /url: /signup?plan=Yearly
      - generic [ref=e244]:
        - generic [ref=e245]:
          - generic [ref=e246]:
            - heading "Ready to Dominate?" [level=2] [ref=e247]:
              - text: Ready to
              - text: Dominate?
            - paragraph [ref=e248]: Our engineering team is ready to help you migrate your data and set up your multi-branch network within 24 hours.
            - generic [ref=e249]:
              - generic [ref=e250]:
                - img [ref=e252]
                - generic [ref=e254]:
                  - paragraph [ref=e255]: Direct Hotline
                  - paragraph [ref=e256]: +880 1700-000000
              - generic [ref=e257]:
                - img [ref=e259]
                - generic [ref=e262]:
                  - paragraph [ref=e263]: Inquiry Email
                  - paragraph [ref=e264]: hello@dominateerp.com
              - generic [ref=e265]:
                - img [ref=e267]
                - generic [ref=e270]:
                  - paragraph [ref=e271]: HQ Office
                  - paragraph [ref=e272]: Banani, Dhaka - 1213, Bangladesh
          - generic [ref=e273]:
            - heading "Send a Message" [level=3] [ref=e274]
            - generic [ref=e275]:
              - generic [ref=e276]:
                - generic [ref=e277]:
                  - text: Your Name
                  - textbox [ref=e278]
                - generic [ref=e279]:
                  - text: Business Phone
                  - textbox [ref=e280]
              - generic [ref=e281]:
                - text: Requirements / Notes
                - textbox "Tell us about your shop..." [ref=e282]
              - button "Submit Request" [ref=e283]
        - generic [ref=e284]:
          - generic [ref=e285]:
            - img [ref=e286]
            - generic [ref=e288]: Dominate ERP
          - paragraph [ref=e289]: Engineered by Dominate Software Solution © 2026
          - generic [ref=e290]:
            - link "Terms" [ref=e291] [cursor=pointer]:
              - /url: "#"
            - link "Privacy" [ref=e292] [cursor=pointer]:
              - /url: "#"
            - link "Cookies" [ref=e293] [cursor=pointer]:
              - /url: "#"
    - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e299] [cursor=pointer]:
    - img [ref=e300]
  - alert [ref=e303]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Mobile ERP Full CRUD Flow', () => {
  4  |   const testId = Date.now();
  5  |   const testProduct = `Test Phone ${testId}`;
  6  |   const testContact = `Test Partner ${testId}`;
  7  |   const testImei = `IMEI-${testId}`;
  8  | 
  9  |   test('should complete a full business cycle', async ({ page }) => {
  10 |     // 1. Login
  11 |     await page.goto('http://localhost:3000/');
> 12 |     await page.fill('input[id="username"]', 'admin');
     |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  13 |     await page.fill('input[id="password"]', 'Admin123');
  14 |     await page.click('button[type="submit"]');
  15 |     await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  16 | 
  17 |     // 2. Add Master Product
  18 |     await page.goto('http://localhost:3000/settings/products');
  19 |     await page.click('button:has-text("Add Master Model")');
  20 |     await page.fill('input[name="brand"]', 'TestBrand');
  21 |     await page.fill('input[name="modelName"]', testProduct);
  22 |     await page.fill('input[name="ram"]', '8GB');
  23 |     await page.fill('input[name="storage"]', '256GB');
  24 |     await page.fill('input[name="defaultCostPrice"]', '10000');
  25 |     await page.fill('input[name="defaultSalesPrice"]', '12000');
  26 |     await page.click('button:has-text("Save to Master")');
  27 |     await expect(page.locator('table')).toContainText(testProduct, { timeout: 15000 });
  28 | 
  29 |     // 3. Add Contact (Supplier)
  30 |     await page.goto('http://localhost:3000/contacts');
  31 |     await page.click('button:has-text("Add New Contact")');
  32 |     await page.waitForSelector('div[role="dialog"]');
  33 |     await page.fill('input[name="name"]', testContact);
  34 |     await page.fill('input[name="phone"]', `017${testId.toString().slice(-8)}`);
  35 |     await page.click('label:has-text("Supplier")');
  36 |     await page.click('button:has-text("Save Contact")');
  37 |     await expect(page.locator('table')).toContainText(testContact, { timeout: 15000 });
  38 | 
  39 |     // 4. Record Purchase
  40 |     await page.goto('http://localhost:3000/purchases/new');
  41 |     await page.click('button:has-text("Search Supplier...")');
  42 |     await page.fill('input[placeholder="Search..."]', testContact);
  43 |     // Use a more specific selector for the dropdown item
  44 |     await page.locator('.bg-popover div:text-is("' + testContact + '")').click();
  45 | 
  46 |     await page.fill('input[placeholder="Auto-generated if empty"]', `INV-${testId}`);
  47 |     
  48 |     await page.click('button:has-text("Add New Row")');
  49 |     await page.click('button:has-text("Search Device...")');
  50 |     await page.fill('input[placeholder="Search..."]', testProduct);
  51 |     await page.locator(`.bg-popover div:text-is("TestBrand ${testProduct}")`).click();
  52 |     
  53 |     await page.fill('textarea[placeholder="Paste IMEIs here (separated by comma, space, or newline)"]', testImei);
  54 |     await page.click('button:has-text("Finalize Purchase")');
  55 |     await expect(page).toHaveURL(/.*reports\/invoice\/purchase/, { timeout: 15000 });
  56 | 
  57 |     // 5. Process Sale in POS
  58 |     await page.goto('http://localhost:3000/pos');
  59 |     await page.fill('input[placeholder="Search IMEI or Invoice..."]', testImei);
  60 |     // The POS search uses a regular div result list, targeting the specific result
  61 |     await page.locator('div:has-text("' + testImei + '")').first().click();
  62 |     
  63 |     await page.fill('input[placeholder="0"]', '12000');
  64 |     await page.click('button:has-text("Complete Sale")');
  65 |     await expect(page.locator('text=Sale completed!')).toBeVisible({ timeout: 15000 });
  66 | 
  67 |     // 6. Verify Sales History
  68 |     await page.goto('http://localhost:3000/sales');
  69 |     await expect(page.locator('table')).toContainText(`SAL-`, { timeout: 15000 });
  70 |   });
  71 | });
  72 | 
```