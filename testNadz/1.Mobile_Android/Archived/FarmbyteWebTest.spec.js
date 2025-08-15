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
  await page.locator('input[type="password"]').fill('P@ssw0rd1');

  // Click the "Login" button to log in
  await page.getByRole('button', { name: 'Login' }).click();

  // Navigate to the "Supplier Management" section
  await page.getByRole('link', { name: 'Supplier Management' }).click();

  // Navigate to the "System Administration" section
  await page.locator('div').filter({ hasText: /^System Administration$/ }).first().click();

  // Click on the "Admin Management" link
  await page.getByRole('link', { name: 'Admin Management' }).click();

  // Open the "States" dropdown and select "Terengganu"
  await page.getByRole('combobox').filter({ hasText: 'States' }).click();
  await page.getByRole('option', { name: 'Terengganu' }).click();

  // Select "Johor" in the "States" dropdown
  await page.getByRole('option', { name: 'Johor' }).click();

  // Open the "Department" dropdown and select "create"
  await page.getByRole('combobox').filter({ hasText: 'Department' }).click();
  await page.getByRole('option', { name: 'create', exact: true }).click();

  // Select "baru" in the "Department" dropdown
  await page.getByRole('option', { name: 'baru' }).click();

  // Select "All" in the "Department" dropdown
  await page.getByRole('option', { name: 'All' }).click();

  // Open the "Role" dropdown and select "All"
  await page.getByRole('combobox').filter({ hasText: 'Role' }).click();
  await page.getByRole('option', { name: 'All' }).click();

  // Click on the "Admin Management" heading
  await page.getByRole('heading', { name: 'Admin Management' }).click();

  // Open the dropdown for roles and select "All"
  await page.getByRole('combobox').filter({ hasText: 'administratordelete_admindelete_adminnew_role_examplenon_finance_testingoms_supe' }).click();
  await page.getByRole('option', { name: 'All' }).click();

  // Select "delete_admin" in the roles dropdown
  await page.getByRole('option', { name: 'delete_admin' }).nth(1).click();

  // Select "administrator" in the roles dropdown
  await page.getByRole('option', { name: 'administrator', exact: true }).click();

  // Click on the "Admin Management" heading again
  await page.getByRole('heading', { name: 'Admin Management' }).click();

  // Click the "Logout" button to log out
  await page.getByRole('button', { name: 'Logout' }).click();

  // Click the first "Logout" button (if multiple logout buttons exist)
  await page.getByRole('button', { name: 'Logout' }).first().click();

  // Click the "Login" link to return to the login page
  await page.getByRole('link', { name: 'Login' }).click();

  // ---------------------
  // Close the browser context and the browser
  await context.close();
  await browser.close();
});