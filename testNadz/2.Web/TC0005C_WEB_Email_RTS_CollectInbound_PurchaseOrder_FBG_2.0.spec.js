import { test, expect } from '@playwright/test';
import * as XLSX from 'xlsx';
const { chromium } = require('@playwright/test');
import path from 'path';
import fs from 'fs';
import { generateUniqueTestData, writeResultToExcel } from './testdata.js';

test('Playwright_onWeb', async () => {
  let testResult = 'PASS';
  let screenshotPath = '';
  const screenshotsDir = path.resolve('./screenshots/web_Email_RTS_Collect_Inbound');
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

    // Navigate to Purchase Orders > Inbound
    console.log("Step 5: Navigate to Purchase Orders > Inbound");
    await page.waitForTimeout(3000);
    await page.locator('div').filter({ hasText: /^Purchase Orders$/ }).first().click();
    await page.waitForTimeout(1000);
    await page.getByRole('link', { name: 'Inbound' }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('combobox').filter({ hasText: 'Inbound Status' }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('option', { name: 'Pending Inbound' }).click();
    await page.waitForTimeout(1000);
    await page.getByText('List of InboundSearch by').click();
    await page.waitForTimeout(1000);
    screenshotPath = path.join(screenshotsDir, `step${step++}_inbound_page_loaded.png`);
    await page.screenshot({ path: screenshotPath });

    // Dynamic approach - Find first pending inbound (SINGLE METHOD)
    console.log("Step 6: Finding first pending inbound dynamically...");

    try {
      // Step 6a: Clear search and filter by supplier name
      console.log("🔍 Filtering by supplier name...");
      
      // Clear existing search
      await page.locator('div').filter({ hasText: /^Search by Purchase Order ID \/ Supplier Name$/ }).getByRole('textbox').clear();
      
      // Search for autotest (supplier name filter)
      await page.locator('div').filter({ hasText: /^Search by Purchase Order ID \/ Supplier Name$/ }).getByRole('textbox').fill('autotest');
      await page.waitForTimeout(2000); // Wait for search results to load
      
      screenshotPath = path.join(screenshotsDir, `step${step++}_supplier_filtered.png`);
      await page.screenshot({ path: screenshotPath });
      
      // Step 6b: Wait for table to load with filtered results
      await page.waitForSelector('table tbody tr', { timeout: 10000 });

      // Step 6c: Find rows with "Pending Inbound"
      const pendingRows = await page.locator('tr:has-text("Pending Inbound")').all();
      console.log(`📋 Found ${pendingRows.length} quotations with "Pending Inbound" status`);

      if (pendingRows.length > 0) {
        // Get the first pending inbound row
        const firstPendingRow = pendingRows[0];
        
        // Extract PO ID from the first column (assuming it's a link)
        const poIdLink = firstPendingRow.locator('td:first-child a').first();
        const poId = await poIdLink.textContent();
        
        console.log(`🎯 Found first pending PO ID: ${poId}`);

        // Click on the first pending inbound
        await poIdLink.click();
        console.log(`✅ Clicked on pending inbound: ${poId}`);

        await page.waitForTimeout(2000);
        screenshotPath = path.join(screenshotsDir, `step${step++}_pending_inbound_opened.png`);
        await page.screenshot({ path: screenshotPath });
        
      } else {
        // Simple fallback - use hardcoded search if no pending found
        console.log("⚠️ No pending inbound found, using search fallback...");
        
        await page.locator('div').filter({ hasText: /^Search by Purchase Order ID \/ Supplier Name$/ }).getByRole('textbox').click();
        await page.locator('div').filter({ hasText: /^Search by Purchase Order ID \/ Supplier Name$/ }).getByRole('textbox').fill('autotest');
        await page.waitForTimeout(2000);

        // Click first available inbound after search
        const firstLink = page.locator('td:first-child a').first();
        const poId = await firstLink.textContent();
        await firstLink.click();
        
        console.log(`✅ Fallback: Used first search result: ${poId}`);
        
        await page.waitForLoadState('networkidle');
        screenshotPath = path.join(screenshotsDir, `step${step++}_search_inbound_opened.png`);
        await page.screenshot({ path: screenshotPath });
      }
      
    } catch (error) {
      console.error("❌ Error finding inbound:", error.message);
      throw new Error(`Failed to find and open inbound: ${error.message}`);
    }
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: 'Collect Inbound' }).click();  
    // Find the index of the "Est. QTY" column
    const headers = await page.locator('table th').allTextContents();
    const estQtyIndex = headers.findIndex(h => h.trim().toLowerCase() === 'est. qty');

    // Loop through all rows and set Collected Qty to Est. QTY
    const rows = await page.locator('table tbody tr').all();
    for (const row of rows) {
      const estQtyValue = await row.locator('td').nth(estQtyIndex).textContent();
      console.log('Est. QTY:', estQtyValue);
      await page.getByRole('spinbutton').fill(estQtyValue); // Fill Collected Qty
    }

    // Upload image from local
    await page.waitForTimeout(1000);
    screenshotPath = path.join(screenshotsDir, `step${step++}_file_selected.png`);
    await page.screenshot({ path: screenshotPath });
    await page.locator('input[type="file"]').setInputFiles('/Users/adlanelias/Downloads/Naz-Pic.jpeg');
    await page.waitForTimeout(1000);

    // Fill remarks
    await page.getByRole('textbox').click();
    await page.waitForTimeout(1000);
    await page.getByRole('textbox').fill(Data.remarksToDriver);
    await page.waitForTimeout(1000);
    
    // Screenshot after remarks
    screenshotPath = path.join(screenshotsDir, `step${step++}_remarks_filled.png`);
    await page.screenshot({ path: screenshotPath });

    // Final submit (if needed)
    await page.getByRole('button', { name: 'Collect PO' }).click();

    await page.waitForTimeout(1000);
    screenshotPath = path.join(screenshotsDir, `step${step++}_driver_collected.png`);
    await page.screenshot({ path: screenshotPath });

    // Write PASS results immediately in try block
    console.log("📊 Writing PASS results to file immediately...");
    console.log(`📋 PASS data: testResult=${testResult}, screenshotPath=${screenshotPath}`);
    
    try {
      const success = await writeResultToExcel(
        'WEB_AdminLogin',
        'TC005C',
        'Web_Admin_Email_RTS_Collect_Inbound',
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
        'TC005C',
        'Web_Admin_Email_RTS_Collect_Inbound',
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