# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\crud-operations.spec.ts >> Mobile ERP Full CRUD Flow >> should complete a full business cycle
- Location: tests\crud-operations.spec.ts:9:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('div:has-text("IMEI-1778526436729")').first()

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]:
          - img [ref=e7]
          - generic [ref=e9]: Dominate ERP
        - generic [ref=e10]:
          - generic [ref=e11]:
            - heading "General" [level=2] [ref=e12]
            - generic [ref=e13]:
              - link "Dashboard" [ref=e14] [cursor=pointer]:
                - /url: /dashboard
                - img [ref=e15]
                - text: Dashboard
              - link "POS / Sale" [ref=e20] [cursor=pointer]:
                - /url: /pos
                - img [ref=e21]
                - text: POS / Sale
              - link "Master Product List" [ref=e25] [cursor=pointer]:
                - /url: /settings/products
                - img [ref=e26]
                - text: Master Product List
              - link "Inventory" [ref=e30] [cursor=pointer]:
                - /url: /inventory
                - img [ref=e31]
                - text: Inventory
              - link "Branch Transfers" [ref=e33] [cursor=pointer]:
                - /url: /inventory/transfers
                - img [ref=e34]
                - text: Branch Transfers
          - generic [ref=e39]:
            - heading "Transactions" [level=2] [ref=e40]
            - generic [ref=e41]:
              - link "Sales History" [ref=e42] [cursor=pointer]:
                - /url: /sales
                - img [ref=e43]
                - text: Sales History
              - link "Sales Returns" [ref=e47] [cursor=pointer]:
                - /url: /sales/returns
                - img [ref=e48]
                - text: Sales Returns
              - link "Purchases" [ref=e51] [cursor=pointer]:
                - /url: /purchases
                - img [ref=e52]
                - text: Purchases
              - link "Purchase Returns" [ref=e54] [cursor=pointer]:
                - /url: /purchases/returns
                - img [ref=e55]
                - text: Purchase Returns
          - generic [ref=e58]:
            - heading "Accounting" [level=2] [ref=e59]
            - generic [ref=e60]:
              - link "Ledgers" [ref=e61] [cursor=pointer]:
                - /url: /accounting/ledgers
                - img [ref=e62]
                - text: Ledgers
              - link "Expenses" [ref=e64] [cursor=pointer]:
                - /url: /accounting/expenses
                - img [ref=e65]
                - text: Expenses
              - link "Chart of Accounts" [ref=e69] [cursor=pointer]:
                - /url: /settings/accounts
                - img [ref=e70]
                - text: Chart of Accounts
          - generic [ref=e72]:
            - heading "People" [level=2] [ref=e73]
            - generic [ref=e74]:
              - link "Contacts" [ref=e75] [cursor=pointer]:
                - /url: /contacts
                - img [ref=e76]
                - text: Contacts
              - link "Staff" [ref=e80] [cursor=pointer]:
                - /url: /staff
                - img [ref=e81]
                - text: Staff
              - link "User Management" [ref=e85] [cursor=pointer]:
                - /url: /settings/users
                - img [ref=e86]
                - text: User Management
          - generic [ref=e98]:
            - heading "Security" [level=2] [ref=e99]
            - link "Stolen Registry" [ref=e101] [cursor=pointer]:
              - /url: /stolen-check
              - img [ref=e102]
              - text: Stolen Registry
          - generic [ref=e104]:
            - heading "System" [level=2] [ref=e105]
            - link "Company Settings" [ref=e107] [cursor=pointer]:
              - /url: /settings/company
              - img [ref=e108]
              - text: Company Settings
        - button "Logout" [ref=e112]:
          - img
          - text: Logout
      - generic [ref=e113]:
        - banner [ref=e114]:
          - generic [ref=e115]:
            - img [ref=e116]
            - textbox "Search IMEI or Invoice..." [active] [ref=e119]: IMEI-1778526436729
          - generic [ref=e120]:
            - button [ref=e121]:
              - img
            - button [ref=e122]:
              - img [ref=e123]
            - generic [ref=e127]:
              - generic [ref=e128]:
                - paragraph [ref=e129]: Super Administrator
                - paragraph [ref=e130]: SuperAdmin
              - img [ref=e132]
        - main [ref=e135]:
          - generic [ref=e137]:
            - generic [ref=e138]:
              - generic [ref=e139]:
                - heading "Point of Sale" [level=1] [ref=e140]
                - paragraph [ref=e141]: Process new sales and manage customer transactions.
              - link "Back to Sales" [ref=e142] [cursor=pointer]:
                - /url: /sales
                - button "Back to Sales" [ref=e143]:
                  - img
                  - text: Back to Sales
            - generic [ref=e144]:
              - generic [ref=e146]:
                - generic [ref=e148]: Item Search
                - generic [ref=e149]:
                  - generic [ref=e150]:
                    - img [ref=e151]
                    - textbox "Scan IMEI or Search Model..." [ref=e154]
                  - table [ref=e156]:
                    - rowgroup [ref=e157]:
                      - row "Item Warranty Price" [ref=e158]:
                        - columnheader "Item" [ref=e159]
                        - columnheader "Warranty" [ref=e160]
                        - columnheader "Price" [ref=e161]
                        - columnheader [ref=e162]
                    - rowgroup [ref=e163]:
                      - row "Cart is empty." [ref=e164]:
                        - cell "Cart is empty." [ref=e165]
              - generic [ref=e166]:
                - generic [ref=e167]:
                  - generic [ref=e169]:
                    - generic [ref=e170]:
                      - img [ref=e171]
                      - text: Customer
                    - button "New" [ref=e174]:
                      - img
                      - text: New
                  - generic [ref=e175]:
                    - generic [ref=e176]:
                      - img [ref=e177]
                      - textbox "Search Phone No..." [ref=e179]
                    - generic [ref=e180]:
                      - generic [ref=e181]:
                        - generic [ref=e182]: Full Name
                        - textbox [ref=e183]: Walk-in Customer
                      - generic [ref=e184]:
                        - generic [ref=e185]: Address
                        - textbox [ref=e186]
                - generic [ref=e187]:
                  - img [ref=e189]
                  - generic [ref=e192]: Checkout
                  - generic [ref=e193]:
                    - generic [ref=e194]:
                      - generic [ref=e195]: Subtotal
                      - generic [ref=e196]: $0
                    - generic [ref=e197]:
                      - generic [ref=e198]: Discount
                      - spinbutton [ref=e199]: "0"
                    - generic [ref=e200]:
                      - generic [ref=e201]: Total
                      - generic [ref=e202]: $0
                    - generic [ref=e203]:
                      - text: Invoice No (Optional)
                      - textbox "Auto-generated if empty" [ref=e204]
                    - generic [ref=e205]:
                      - text: Payment Received
                      - spinbutton [ref=e206]: "0"
                  - generic [ref=e207]:
                    - button "Complete Sale" [disabled]
    - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e213] [cursor=pointer]:
    - img [ref=e214]
  - alert [ref=e217]
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
  12 |     await page.fill('input[id="username"]', 'admin');
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
> 61 |     await page.locator('div:has-text("' + testImei + '")').first().click();
     |                                                                    ^ Error: locator.click: Test timeout of 30000ms exceeded.
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