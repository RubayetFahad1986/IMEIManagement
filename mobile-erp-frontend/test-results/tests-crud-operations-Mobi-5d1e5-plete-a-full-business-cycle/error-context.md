# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\crud-operations.spec.ts >> Mobile ERP Full CRUD Flow >> should complete a full business cycle
- Location: tests\crud-operations.spec.ts:9:7

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: page.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Search Device...")')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [active]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e6]:
          - navigation [ref=e7]:
            - button "previous" [disabled] [ref=e8]:
              - img "previous" [ref=e9]
            - generic [ref=e11]:
              - generic [ref=e12]: 1/
              - text: "1"
            - button "next" [disabled] [ref=e13]:
              - img "next" [ref=e14]
          - img
        - generic [ref=e16]:
          - generic [ref=e17]:
            - img [ref=e18]
            - generic "Latest available version is detected (16.2.6)." [ref=e20]: Next.js 16.2.6
            - generic [ref=e21]: Turbopack
          - img
      - dialog "Runtime TypeError" [ref=e23]:
        - generic [ref=e26]:
          - generic [ref=e27]:
            - generic [ref=e28]:
              - generic [ref=e30]: Runtime TypeError
              - generic [ref=e31]:
                - button "Copy Error Info" [ref=e32] [cursor=pointer]:
                  - img [ref=e33]
                - button "No related documentation found" [disabled] [ref=e35]:
                  - img [ref=e36]
                - button "Attach Node.js inspector" [ref=e38] [cursor=pointer]:
                  - img [ref=e39]
            - generic [ref=e48]: devices.map is not a function
          - generic [ref=e49]:
            - generic [ref=e50]:
              - paragraph [ref=e52]:
                - img [ref=e54]
                - generic [ref=e57]: src/app/(protected)/purchases/new/page.tsx (219:44) @ <unknown>
                - button "Open in editor" [ref=e58] [cursor=pointer]:
                  - img [ref=e60]
              - generic [ref=e63]:
                - generic [ref=e64]: 217 | <SearchableSelect
                - generic [ref=e65]: 218 | className="h-9 text-xs"
                - generic [ref=e66]: "> 219 | options={devices.map(d => ({ label: `${d.brand} ${d.modelName}`, value: d.id }))}"
                - generic [ref=e67]: "| ^"
                - generic [ref=e68]: "220 | value={item.mobileDeviceId}"
                - generic [ref=e69]: "221 | onChange={val => updateItem(idx, \"mobileDeviceId\", val)}"
                - generic [ref=e70]: 222 | placeholder="Search Device..."
            - generic [ref=e71]:
              - generic [ref=e72]:
                - paragraph [ref=e73]:
                  - text: Call Stack
                  - generic [ref=e74]: "17"
                - button "Show 14 ignore-listed frame(s)" [ref=e75] [cursor=pointer]:
                  - text: Show 14 ignore-listed frame(s)
                  - img [ref=e76]
              - generic [ref=e78]:
                - generic [ref=e79]:
                  - text: <unknown>
                  - button "Open <unknown> in editor" [ref=e80] [cursor=pointer]:
                    - img [ref=e81]
                - text: src/app/(protected)/purchases/new/page.tsx (219:44)
              - generic [ref=e83]:
                - generic [ref=e84]: Array.map
                - text: <anonymous>
              - generic [ref=e85]:
                - generic [ref=e86]:
                  - text: NewPurchasePage
                  - button "Open NewPurchasePage in editor" [ref=e87] [cursor=pointer]:
                    - img [ref=e88]
                - text: src/app/(protected)/purchases/new/page.tsx (214:34)
        - generic [ref=e90]: "1"
        - generic [ref=e91]: "2"
    - generic [ref=e96] [cursor=pointer]:
      - button "Open Next.js Dev Tools" [ref=e97]:
        - img [ref=e98]
      - generic [ref=e101]:
        - button "Open issues overlay" [ref=e102]:
          - generic [ref=e103]:
            - generic [ref=e104]: "0"
            - generic [ref=e105]: "1"
          - generic [ref=e106]: Issue
        - button "Collapse issues badge" [ref=e107]:
          - img [ref=e108]
  - generic [ref=e111]:
    - img [ref=e112]
    - heading "This page couldn’t load" [level=1] [ref=e114]
    - paragraph [ref=e115]: Reload to try again, or go back.
    - generic [ref=e116]:
      - button "Reload" [ref=e118] [cursor=pointer]
      - button "Back" [ref=e119] [cursor=pointer]
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
  12 |     await page.fill('input[id="username"]', 'Admin@gmail.com');
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
  46 |     await page.fill('input[placeholder="e.g. PUR-10023"]', `INV-${testId}`);
  47 |     
  48 |     await page.click('button:has-text("Add New Row")');
> 49 |     await page.click('button:has-text("Search Device...")');
     |                ^ Error: page.click: Test timeout of 60000ms exceeded.
  50 |     await page.fill('input[placeholder="Search..."]', testProduct);
  51 |     await page.locator('.bg-popover div:text-is("' + testProduct + '")').click();
  52 |     
  53 |     await page.fill('input[placeholder="Scan IMEI 1"]', testImei);
  54 |     await page.click('button:has-text("Finalize Purchase")');
  55 |     await expect(page).toHaveURL(/.*inventory/, { timeout: 15000 });
  56 | 
  57 |     // 5. Process Sale in POS
  58 |     await page.goto('http://localhost:3000/pos');
  59 |     await page.fill('input[placeholder="Scan IMEI or Search Model..."]', testImei);
  60 |     // The POS search uses a regular div result list
  61 |     await page.locator('.hover\\:bg-blue-50').click();
  62 |     
  63 |     await page.fill('input[placeholder="Enter amount paid"]', '12000');
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