import { test, expect } from '@playwright/test';
import * as XLSX from 'xlsx';
const { chromium } = require('@playwright/test');
import path from 'path';
import fs from 'fs';

async function writeResultToExcel(module, tcId, testScenario, result, screenshotPath) {
  const filePath = 'AutoReg_FBG2.0_Happy_Flow_E2E_Web.xlsx';
  let workbook, worksheet;

  // Try to read existing file, or create new
  try {
    workbook = XLSX.readFile(filePath);
    worksheet = workbook.Sheets[workbook.SheetNames[0]];
  } catch {
    workbook = XLSX.utils.book_new();
    worksheet = XLSX.utils.aoa_to_sheet([['Module', 'TC ID', 'Test Case Scenario', 'Timestamp', 'Result', 'Screenshot']]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'WEB Test Results');
  }

  // Prepare data
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  // Add new row
  const now = new Date();
  const timestamp = now.toLocaleString();
  data.push([module, tcId, testScenario, timestamp, result, screenshotPath]);

  // Write back to sheet
  const newSheet = XLSX.utils.aoa_to_sheet(data);
  workbook.Sheets[workbook.SheetNames[0]] = newSheet;
  XLSX.writeFile(workbook, filePath);
}

test('Playwright_onWeb', async () => {
  let testResult = 'PASS';
  let screenshotPath = '';
  const screenshotsDir = path.resolve('./screenshots/web_login');
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
    // Take screenshot after login
    screenshotPath = path.join(screenshotsDir, `after_login_${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath });

    // Click on the "Logout" button to log out
    await page.getByRole('button', { name: 'Logout' }).click();
    await page.getByRole('button', { name: 'Logout' }).first().click();
    await page.getByRole('link', { name: 'Login' }).click();
    // Take screenshot after logout
    screenshotPath = path.join(screenshotsDir, `after_logout_${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath });

    await context.close();
    await browser.close();
  } catch (error) {
    testResult = 'FAIL';
    // Take screenshot on error
    screenshotPath = path.join(screenshotsDir, `error_${Date.now()}.png`);
    if (typeof page !== 'undefined') {
      await page.screenshot({ path: screenshotPath });
    }
    throw error;
  } finally {
    await writeResultToExcel(
      'WEB_Login',
      'TC_001',
      'FBG_2.0_ValidLogin_TC_001',
      testResult,
      screenshotPath
    );
  }
});