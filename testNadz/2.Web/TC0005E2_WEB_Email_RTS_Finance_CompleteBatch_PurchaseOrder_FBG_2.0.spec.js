import { test, expect } from '@playwright/test';
import * as XLSX from 'xlsx';
const { chromium } = require('@playwright/test');
import path from 'path';
import fs from 'fs';
import { generateUniqueTestData, writeResultToExcel } from './testdata.js';

test('Playwright_onWeb', async () => {
  let testResult = 'PASS';
  let screenshotPath = '';
  const screenshotsDir = path.resolve('./screenshots/web_Email_RTS_Finance_CompleteBatch_PurchaseOrder');
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

  let browser, context, page;
  let step = 1;

  const Data = generateUniqueTestData();
  // Add timestamp variable here
  const timestamp = new Date().toLocaleString();
  console.log(`🕐 Test started at: ${timestamp}`);

  const testData = generateUniqueTestData();
  try {
    // Launch the Chromium browser in non-headless mode
    browser = await chromium.launch({ headless: false });
    context = await browser.newContext();
    page = await context.newPage();

    // Step 1: Navigate to login page
    console.log("Step 1: Navigate to login page");
    await page.goto('https://commandcenter-stg.farmbyte.com/login');
    await page.waitForLoadState('networkidle');
    screenshotPath = path.join(screenshotsDir, `step${step++}_login_page.png`);
    await page.screenshot({ path: screenshotPath });

    // Step 2: Fill email
    console.log("Step 2: Fill email");
    await page.locator('input[type="email"]').click();
    await page.locator('input[type="email"]').fill('superadmin001@gmail.com');
    await page.waitForTimeout(1000);
    screenshotPath = path.join(screenshotsDir, `step${step++}_email_filled.png`);
    await page.screenshot({ path: screenshotPath });

    // Step 3: Fill password
    console.log("Step 3: Fill password");
    await page.locator('input[type="email"]').press('Tab');
    await page.locator('input[type="password"]').fill('P@ssw0rd1');
    await page.waitForTimeout(1000);
    screenshotPath = path.join(screenshotsDir, `step${step++}_password_filled.png`);
    await page.screenshot({ path: screenshotPath });

    // Step 4: Click login button
    console.log("Step 4: Click login button");
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForLoadState('networkidle');
    screenshotPath = path.join(screenshotsDir, `step${step++}_after_login.png`);
    await page.screenshot({ path: screenshotPath });

    // Navigate to Purchase Orders > Finance - Bulk Payment
    console.log("Step 5: Navigate to Purchase Orders > Finance - Bulk Payment");
    await page.waitForTimeout(3000);
    await page.locator('div').filter({ hasText: /^Purchase Orders$/ }).first().click();
    await page.waitForTimeout(1000);
    await page.getByRole('link', { name: 'Finance - Bulk Payment' }).click();
    await page.waitForTimeout(1000);
    screenshotPath = path.join(screenshotsDir, `step${step++}_finance_bulk_payment_page_loaded.png`);
    await page.screenshot({ path: screenshotPath });

// Step 1: Click the "Bulk Payments Batches" tab
await page.getByRole('link', { name: 'Bulk Payments Batches' }).click();
await page.waitForTimeout(1000);
await page.getByRole('combobox').click();
await page.waitForTimeout(1000);
await page.getByRole('option', { name: 'Pending' }).click();
await page.waitForTimeout(1000);
await page.getByText('Bulk Payments Batches').click();
await page.waitForTimeout(1000);

await page.waitForSelector('table tbody tr'); // Wait for table to load

const rows = page.locator('table tbody tr');
const rowCount = await rows.count();
let firstPendingBatchId = null;
let batchCompleted = false;

for (let i = 0; i < rowCount && !batchCompleted; i++) {
  const row = rows.nth(i);
  const statusCell = row.locator('td').nth(2); // Adjust index if needed
  const statusText = (await statusCell.innerText())?.trim().toLowerCase();
  console.log(`Row ${i} Status:`, statusText);
  if (statusText.includes('pending')) {
    const batchId = (await row.locator('td').nth(0).locator('span').textContent())?.trim();
    firstPendingBatchId = batchId;
    console.log(`✅ Found Pending Batch ID: ${firstPendingBatchId}`);
    await Promise.all([
      page.waitForLoadState('networkidle'),
      row.locator('td').nth(0).locator('span.cursor-pointer').click(),
      await page.waitForTimeout(1000)
    ]);
    await page.getByRole('textbox').nth(3).click();
    await page.waitForTimeout(1000);
    await page.getByRole('textbox').nth(3).fill(testData.remarksToDriver);
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Complete Batch' }).click();
    await page.waitForTimeout(1000);
    screenshotPath = path.join(screenshotsDir, `step${step++}_after_complete_batch.png`);
    await page.screenshot({ path: screenshotPath });
    await page.getByRole('button', { name: 'Proceed' }).click();
    await page.waitForTimeout(1000);
    screenshotPath = path.join(screenshotsDir, `step${step++}_after_proceed.png`);
    await page.screenshot({ path: screenshotPath });
    batchCompleted = true;
  }
}

if (!firstPendingBatchId) {
  console.warn('⚠️ No batch with "Pending" status found.');
} else {

    screenshotPath = path.join(screenshotsDir, `step${step++}_batch_approve_signoff_grading.png`);
    await page.screenshot({ path: screenshotPath });

    // Write PASS results immediately in try block
    console.log("📊 Writing PASS results to file immediately...");
    console.log(`📋 PASS data: testResult=${testResult}, screenshotPath=${screenshotPath}`);
  
}



   
    try {
      const success = await writeResultToExcel(
        'WEB_AdminLogin',
        'TC005E2',
        'Web_Admin_Email_RTS_Finance_CompleteBatch_PurchaseOrder',
        timestamp,
        testResult,
        screenshotPath
      );
      
      if (success) {
        console.log("✅ PASS results written successfully!");
      } else {
        console.error("❌ Failed to write PASS results!");
      }
    } catch (writeError) {
      console.error("❌ Error writing PASS results:", writeError.message);
      
      // Emergency fallback for passed test
      try {
        const emergencyLog = `${timestamp} | PASS | Test completed successfully | ${screenshotPath}\n`;
        fs.appendFileSync('emergency_test_log.txt', emergencyLog);
        console.log("📝 Emergency PASS log created");
      } catch (emergencyError) {
        console.error("❌ Emergency PASS log also failed:", emergencyError.message);
      }
    }

  } catch (error) {
    testResult = 'FAIL';
    console.error("❌ Error occurred:", error.message);
    console.error("Stack trace:", error.stack);
    
    // Take screenshot on error
    screenshotPath = path.join(screenshotsDir, `step${step++}_error.png`);
    if (page) {
      try {
        await page.screenshot({ path: screenshotPath });
        console.log(`📸 Error screenshot saved: ${screenshotPath}`);
      } catch (screenshotError) {
        console.error("❌ Failed to take error screenshot:", screenshotError.message);
        screenshotPath = 'Screenshot failed';
      }
    }
    
    // Write FAIL results immediately in catch block
    console.log("📊 Writing FAIL results to file immediately...");
    console.log(`📋 FAIL data: testResult=${testResult}, screenshotPath=${screenshotPath}`);
    
    try {
      const success = await writeResultToExcel(
        'WEB_AdminLogin',
        'TC005E2',
        'Web_Admin_Email_RTS_Finance_CompleteBatch_PurchaseOrder',
        timestamp,
        testResult,
        screenshotPath
      );
      
      if (success) {
        console.log("✅ FAIL results written successfully!");
      } else {
        console.error("❌ Failed to write FAIL results!");
      }
    } catch (writeError) {
      console.error("❌ Error writing FAIL results:", writeError.message);
      
      // Emergency fallback for failed test
      try {
        const emergencyLog = `${timestamp} | FAIL | ${error.message} | ${screenshotPath}\n`;
        fs.appendFileSync('emergency_test_log.txt', emergencyLog);
        console.log("📝 Emergency FAIL log created");
      } catch (emergencyError) {
        console.error("❌ Emergency FAIL log also failed:", emergencyError.message);
      }
    }
    
  } finally {
    // Close browser first
    if (context) {
      try {
        await context.close();
        console.log("🌐 Browser context closed");
      } catch (closeError) {
        console.error("❌ Error closing context:", closeError.message);
      }
    }
    if (browser) {
      try {
        await browser.close();
        console.log("🌐 Browser closed");
      } catch (closeError) {
        console.error("❌ Error closing browser:", closeError.message);
      }
    }
    
    console.log("🎯 Test execution completed!");
    console.log(`📋 Final result: ${testResult}`);
  }
});