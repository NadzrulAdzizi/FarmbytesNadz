import { test, expect } from '@playwright/test';
import * as XLSX from 'xlsx';
const { chromium } = require('@playwright/test');
import path from 'path';
import fs from 'fs';

async function writeResultToExcel(module, tcId, testScenario, result, screenshotPath, sheetName = 'WEB Test Results') {
  const filePath = 'AutoReg_FBG2.0_Happy_Flow_E2E_Web.xlsx';
  let workbook, worksheet;

  // Try to read existing file, or create new
  try {
    workbook = XLSX.readFile(filePath);
    worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      worksheet = XLSX.utils.aoa_to_sheet([['Module', 'TC ID', 'Test Case Scenario', 'Timestamp', 'Result', 'Screenshot']]);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }
  } catch {
    workbook = XLSX.utils.book_new();
    worksheet = XLSX.utils.aoa_to_sheet([['Module', 'TC ID', 'Test Case Scenario', 'Timestamp', 'Result', 'Screenshot']]);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  }

  // Prepare data
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  // Add new row
  const now = new Date();
  const timestamp = now.toLocaleString();
  data.push([module, tcId, testScenario, timestamp, result, screenshotPath]);

  // Write back to the specified sheet
  const newSheet = XLSX.utils.aoa_to_sheet(data);
  workbook.Sheets[sheetName] = newSheet;
  XLSX.writeFile(workbook, filePath);
}

test('Playwright_onWeb', async () => {
  let testResult = 'PASS';
  let screenshotPath = '';
  const screenshotsDir = path.resolve('./screenshots/web_admin_management');
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

  try {
    // Launch the Chromium browser in non-headless mode
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Go to login page
    await page.goto('https://commandcenter-stg.farmbyte.com/login');
    screenshotPath = path.join(screenshotsDir, `login_${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath });

    // Fill in the email address
    await page.locator('input[type="email"]').fill('superadmin001@gmail.com');
    await page.locator('input[type="email"]').press('Tab');
    await page.locator('input[type="password"]').fill('P@ssw0rd1');

    // Click the "Login" button to log in
    await page.getByRole('button', { name: 'Login' }).click();
    screenshotPath = path.join(screenshotsDir, `after_login_${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath });

    // Navigate to the "Supplier Management" section
    await page.getByRole('link', { name: 'Supplier Management' }).click();
    screenshotPath = path.join(screenshotsDir, `supplier_management_${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath });

    // Navigate to the "System Administration" section
    await page.locator('div').filter({ hasText: /^System Administration$/ }).first().click();
    screenshotPath = path.join(screenshotsDir, `system_administration_${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath });

    // Click on the "Admin Management" link
    await page.getByRole('link', { name: 'Admin Management' }).click();
    screenshotPath = path.join(screenshotsDir, `admin_management_${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath });

    // Open the "States" dropdown and select "Terengganu"
    await page.getByRole('combobox').filter({ hasText: 'States' }).click();
    await page.getByRole('option', { name: 'Terengganu' }).click();
    screenshotPath = path.join(screenshotsDir, `states_terengganu_${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath });

    // Select "Johor" in the "States" dropdown
    await page.getByRole('option', { name: 'Johor' }).click();
    screenshotPath = path.join(screenshotsDir, `states_johor_${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath });

    // Open the "Department" dropdown and select "create"
    await page.getByRole('combobox').filter({ hasText: 'Department' }).click();
    await page.getByRole('option', { name: 'create', exact: true }).click();
    screenshotPath = path.join(screenshotsDir, `department_create_${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath });

    // Select "baru" in the "Department" dropdown
    await page.getByRole('option', { name: 'baru' }).click();
    screenshotPath = path.join(screenshotsDir, `department_baru_${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath });

    // Select "All" in the "Department" dropdown
    await page.getByRole('option', { name: 'All' }).click();
    screenshotPath = path.join(screenshotsDir, `department_all_${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath });

    // Open the "Role" dropdown and select "All"
    await page.getByRole('combobox').filter({ hasText: 'Role' }).click();
    await page.getByRole('option', { name: 'All' }).click();
    screenshotPath = path.join(screenshotsDir, `role_all_${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath });

    // Click on the "Admin Management" heading
    await page.getByRole('heading', { name: 'Admin Management' }).click();
    screenshotPath = path.join(screenshotsDir, `admin_management_heading_${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath });

    // Logout steps
    await page.getByRole('button', { name: 'Logout' }).click();
    await page.getByRole('button', { name: 'Logout' }).first().click();
    await page.getByRole('link', { name: 'Login' }).click();
    screenshotPath = path.join(screenshotsDir, `after_logout_${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath });

    await context.close();
    await browser.close();
  } catch (error) {
    testResult = 'FAIL';
    screenshotPath = path.join(screenshotsDir, `error_${Date.now()}.png`);
    if (typeof page !== 'undefined') {
      await page.screenshot({ path: screenshotPath });
    }
    throw error;
  } finally {
    await writeResultToExcel(
      'WEB_AdminManagement',
      'TC_002',
      'FBG_2.0_Sorting_AdminManagement_TC_002',
      testResult,
      screenshotPath
    );
  }
});