# Automated Testing Guide

This project uses **Playwright** for end-to-end (E2E) functional testing. These tests cover core modules including Contacts, Inventory, POS, Purchases, Sales History, General Ledger, Reports, Dashboard, and the Reseller Portal.

## Getting Started

Ensure you have installed the dependencies:
```bash
npm install
npx playwright install
```

---

## Running Tests

### 1. Headless Testing (Fast & Standard)
Use this mode for automated pipelines or CI/CD where you don't need to see the UI.
```bash
npx playwright test
```

### 2. Animated/Headed Testing (Visual)
Use this mode to watch the tests execute in real-time. This opens the browser and performs all actions (typing, clicking, navigating) visually.
```bash
npx playwright test --headed --workers=1
```

### 3. UI Mode (Interactive Debugging)
Use this to open the Playwright UI, where you can watch tests, step through actions, and inspect the DOM at any stage.
```bash
npx playwright test --ui
```

---

## Test Organization
Tests are located in `mobile-erp-frontend/tests/`. Each file corresponds to a specific module:

| Module | Test File |
| :--- | :--- |
| Contacts | `contacts.spec.ts` |
| Inventory | `inventory.spec.ts` |
| Point of Sale (POS) | `pos.spec.ts` |
| Purchases | `purchases.spec.ts` |
| Sales History | `sales.spec.ts` |
| General Ledger | `general-ledger.spec.ts` |
| Reports | `reports.spec.ts` |
| Dashboard | `dashboard.spec.ts` |
| Reseller Portal | `reseller.spec.ts` |

---

## Troubleshooting
If a test fails due to timeouts:
1. Ensure the development server is running (`npm run dev`).
2. If the UI is slow, consider increasing the `timeout` values in the `.spec.ts` files.
3. Use `--workers=1` if tests interfere with each other when running in parallel.
