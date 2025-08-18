const { test, expect } = require('@playwright/test');

test('Verify Scroll Up using Arrow button and Scroll Down functionality', async ({ page }) => {
  // 1. Launch browser and 2. Navigate to url
  await page.goto('http://automationexercise.com');

  // 3. Verify that home page is visible successfully
  await expect(page).toHaveTitle(/Automation Exercise/);

  // 4. Scroll down page to bottom
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  // 5. Verify 'SUBSCRIPTION' is visible
  await expect(page.locator('text=SUBSCRIPTION')).toBeVisible();

  // 6. Click on arrow at bottom right side to move upward
  await page.locator('#scrollUp').click();
  await page.waitForTimeout(3000); // Wait for scroll to complete

  // 7. Verify that page is scrolled up and text is visible on screen
  //await expect(page.locator('text=Full-Fledged practice website for Automation Engineers')).toBeVisible();
  //await page.getByRole('heading', { name: 'Full-Fledged practice website' }).toBeVisible();
  //await page.screenshot({ path: 'scrollup-debug.png', fullPage: true });
  await expect(page.getByRole('heading', { name: /Full-Fledged/i })).toBeVisible();

});