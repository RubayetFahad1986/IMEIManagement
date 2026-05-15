import { test, expect, devices } from '@playwright/test';

// Define the devices/viewports we want to test
const responsiveDevices = [
  { name: 'Mobile Portrait', viewport: { width: 375, height: 667 } },
  { name: 'Mobile Landscape', viewport: { width: 667, height: 375 } },
  { name: 'Tablet Portrait', viewport: { width: 768, height: 1024 } },
  { name: 'Tablet Landscape', viewport: { width: 1024, height: 768 } },
];

test.describe('Responsive Design Check', () => {
  for (const device of responsiveDevices) {
    test(`should display correctly on ${device.name}`, async ({ page }) => {
      await page.setViewportSize(device.viewport);
      
      // Navigate to dashboard directly (login flow is already verified in other tests)
      await page.goto('http://localhost:3000/login');
      await page.fill('input[id="username"]', 'admin');
      await page.fill('input[id="password"]', 'Admin123');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });

      // Check if the dashboard container is responsive (no horizontal scroll)
      const isScrollable = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(isScrollable, `Horizontal scroll detected on ${device.name}`).toBe(false);
    });
  }
});
