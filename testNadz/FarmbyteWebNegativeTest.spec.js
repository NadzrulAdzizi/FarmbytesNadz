import { test, expect } from '@playwright/test';
const { chromium } = require('@playwright/test');

test('Playwright_onWeb', async () => {
  // Launch the Chromium browser in non-headless mode
  const browser = await chromium.launch({
    headless: false
  });

  // Create a new browser context
  const context = await browser.newContext();

  // Open a new page in the browser
  const page = await context.newPage();

  // Navigate to the login page of the application
  await page.goto('https://commandcenter-stg.farmbyte.com/login');

  // Click on the email input field
  await page.locator('input[type="email"]').click();

  // Fill in the email address
  await page.locator('input[type="email"]').fill('superadmin001@gmail.com');

  // Press the Tab key to move to the password field
  await page.locator('input[type="email"]').press('Tab');

  // Click on the password input field
  await page.locator('input[type="password"]').click();

  // Fill in the password
  await page.locator('input[type="password"]').fill('P@ssw0rd123'); // Incorrect password for negative test

  // Click the "Login" button to log in
  await page.getByRole('button', { name: 'Login' }).click();

  
});