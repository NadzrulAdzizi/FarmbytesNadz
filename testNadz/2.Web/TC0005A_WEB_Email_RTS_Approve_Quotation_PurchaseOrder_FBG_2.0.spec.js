import { test, expect } from '@playwright/test';
import * as XLSX from 'xlsx';
const { chromium } = require('@playwright/test');
import path from 'path';
import fs from 'fs';

async function writeResultToExcel(module, tcId, testScenario, timestamp, result, screenshotPath) {
  console.log(`📊 Starting Excel write process...`);
  console.log(`📋 Data: Module=${module}, TC=${tcId}, Result=${result}`);
  console.log(`📂 Current working directory: ${process.cwd()}`);
  
  const filePath = path.join(process.cwd(), 'AutoReg_FBG2.0_Happy_Flow_E2E_Web.xlsx');
  const csvPath = path.join(process.cwd(), 'test_results_backup.csv');
  
  console.log(`📁 Excel file path: ${filePath}`);
  console.log(`📁 CSV backup path: ${csvPath}`);
  
  // Method 1: Try XLSX library
  try {
    console.log(`🔧 Testing XLSX library...`);
    
    // Test if XLSX is working
    const testWorkbook = XLSX.utils.book_new();
    const testSheet = XLSX.utils.aoa_to_sheet([['Test', 'Data']]);
    XLSX.utils.book_append_sheet(testWorkbook, testSheet, 'TestSheet');
    
    console.log(`✅ XLSX library is working`);
    
    let workbook;
    let worksheet;
    const sheetName = 'WEB_Test_Results';
    
    // Try to read existing workbook
    if (fs.existsSync(filePath)) {
      console.log("📖 Reading existing Excel file...");
      workbook = XLSX.readFile(filePath);
      
      if (workbook.Sheets[sheetName]) {
        worksheet = workbook.Sheets[sheetName];
        console.log("📋 Found existing worksheet");
      } else {
        console.log("📋 Creating new worksheet in existing file");
        worksheet = XLSX.utils.aoa_to_sheet([
          ['Module', 'TC ID', 'Test Scenario', 'Timestamp', 'Result', 'Screenshot']
        ]);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      }
    } else {
      console.log("📄 Creating new Excel file and worksheet");
      workbook = XLSX.utils.book_new();
      worksheet = XLSX.utils.aoa_to_sheet([
        ['Module', 'TC ID', 'Test Scenario', 'Timestamp', 'Result', 'Screenshot']
      ]);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }
    
    // Convert sheet to array of arrays
    const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log(`📊 Current sheet data rows: ${sheetData.length}`);
    
    // Add new row
    const newRow = [module, tcId, testScenario, timestamp, result, screenshotPath || 'N/A'];
    sheetData.push(newRow);
    
    console.log(`📝 Adding row: ${JSON.stringify(newRow)}`);
    
    // Convert back to worksheet
    const newWorksheet = XLSX.utils.aoa_to_sheet(sheetData);
    workbook.Sheets[sheetName] = newWorksheet;
    
    // Write file
    console.log(`💾 Writing Excel file to: ${filePath}`);
    XLSX.writeFile(workbook, filePath);
    
    // Verify file was created
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`✅ Excel file created successfully - Size: ${stats.size} bytes`);
      return true;
    } else {
      console.error("❌ Excel file was not created!");
      throw new Error("Excel file not created");
    }
    
  } catch (xlsxError) {
    console.error('❌ XLSX method failed:', xlsxError.message);
    console.error('Stack trace:', xlsxError.stack);
    
    // Method 2: Try CSV backup
    try {
      console.log(`📋 Attempting CSV backup...`);
      
      const csvRow = `"${module}","${tcId}","${testScenario}","${timestamp}","${result}","${screenshotPath || 'N/A'}"\n`;
      
      if (!fs.existsSync(csvPath)) {
        console.log(`📄 Creating new CSV file`);
        fs.writeFileSync(csvPath, '"Module","TC ID","Test Scenario","Timestamp","Result","Screenshot"\n');
      }
      
      fs.appendFileSync(csvPath, csvRow);
      
      if (fs.existsSync(csvPath)) {
        const stats = fs.statSync(csvPath);
        console.log(`✅ CSV backup created successfully - Size: ${stats.size} bytes`);
        return true;
      } else {
        throw new Error("CSV file not created");
      }
      
    } catch (csvError) {
      console.error('❌ CSV backup failed:', csvError.message);
      
      // Method 3: Try JSON backup
      try {
        console.log(`📋 Attempting JSON backup...`);
        
        const jsonPath = path.join(process.cwd(), 'test_results_backup.json');
        const newRecord = {
          module,
          tcId,
          testScenario,
          timestamp,
          result,
          screenshotPath: screenshotPath || 'N/A'
        };
        
        let jsonData = [];
        if (fs.existsSync(jsonPath)) {
          const existingData = fs.readFileSync(jsonPath, 'utf8');
          jsonData = JSON.parse(existingData);
        }
        
        jsonData.push(newRecord);
        fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
        
        if (fs.existsSync(jsonPath)) {
          const stats = fs.statSync(jsonPath);
          console.log(`✅ JSON backup created successfully - Size: ${stats.size} bytes`);
          return true;
        } else {
          throw new Error("JSON file not created");
        }
        
      } catch (jsonError) {
        console.error('❌ JSON backup also failed:', jsonError.message);
        
        // Method 4: Try simple text file
        try {
          console.log(`📋 Attempting simple text file backup...`);
          
          const txtPath = path.join(process.cwd(), 'test_results_backup.txt');
          const txtRow = `${timestamp} | ${module} | ${tcId} | ${testScenario} | ${result} | ${screenshotPath || 'N/A'}\n`;
          
          if (!fs.existsSync(txtPath)) {
            fs.writeFileSync(txtPath, 'Timestamp | Module | TC ID | Test Scenario | Result | Screenshot\n');
          }
          
          fs.appendFileSync(txtPath, txtRow);
          
          if (fs.existsSync(txtPath)) {
            const stats = fs.statSync(txtPath);
            console.log(`✅ Text file backup created successfully - Size: ${stats.size} bytes`);
            return true;
          } else {
            throw new Error("Text file not created");
          }
          
        } catch (txtError) {
          console.error('❌ All backup methods failed:', txtError.message);
          return false;
        }
      }
    }
  }
}

test('Playwright_onWeb', async () => {
  let testResult = 'PASS';
  let screenshotPath = '';
  const screenshotsDir = path.resolve('./screenshots/web_Email_RTS_Approve_Quote');
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

  let browser, context, page;
  let step = 1;
  
  // Add timestamp variable here
  const timestamp = new Date().toLocaleString();
  console.log(`🕐 Test started at: ${timestamp}`);

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

    // Navigate to Purchase Orders > Quotation
    console.log("Step 5: Navigate to Purchase Orders > Quotation");
    await page.waitForTimeout(3000);
    await page.locator('div').filter({ hasText: /^Purchase Orders$/ }).first().click();
    await page.waitForTimeout(1000);
    await page.getByRole('link', { name: 'Quotation' }).click();
    await page.waitForTimeout(1000);
    screenshotPath = path.join(screenshotsDir, `step${step++}_quotation_page_loaded.png`);
    await page.screenshot({ path: screenshotPath });

    // Dynamic approach - Find first pending quotation (SINGLE METHOD)
    console.log("Step 6: Finding first pending quotation dynamically...");

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
      
      // Step 6c: Find rows with "Quotation Pending" status (not "Quotation Status")
      const pendingRows = await page.locator('tr:has-text("Quotation Pending")').all();
      console.log(`📋 Found ${pendingRows.length} quotations with "Quotation Pending" status`);

      if (pendingRows.length > 0) {
        // Get the first pending quotation row
        const firstPendingRow = pendingRows[0];
        
        // Extract PO ID from the first column (assuming it's a link)
        const poIdLink = firstPendingRow.locator('td:first-child a').first();
        const poId = await poIdLink.textContent();
        
        console.log(`🎯 Found first pending PO ID: ${poId}`);
        
        // Click on the first pending quotation
        await poIdLink.click();
        console.log(`✅ Clicked on pending quotation: ${poId}`);

        await page.waitForTimeout(2000);
        screenshotPath = path.join(screenshotsDir, `step${step++}_pending_quotation_opened.png`);
        await page.screenshot({ path: screenshotPath });
        
      } else {
        // Simple fallback - use hardcoded search if no pending found
        console.log("⚠️ No pending quotations found, using search fallback...");
        
        await page.locator('div').filter({ hasText: /^Search by Purchase Order ID \/ Supplier Name$/ }).getByRole('textbox').click();
        await page.locator('div').filter({ hasText: /^Search by Purchase Order ID \/ Supplier Name$/ }).getByRole('textbox').fill('autotest');
        await page.waitForTimeout(2000);
        
        // Click first available quotation after search
        const firstLink = page.locator('td:first-child a').first();
        const poId = await firstLink.textContent();
        await firstLink.click();
        
        console.log(`✅ Fallback: Used first search result: ${poId}`);
        
        await page.waitForLoadState('networkidle');
        screenshotPath = path.join(screenshotsDir, `step${step++}_search_quotation_opened.png`);
        await page.screenshot({ path: screenshotPath });
      }
      
    } catch (error) {
      console.error("❌ Error finding quotation:", error.message);
      throw new Error(`Failed to find and open quotation: ${error.message}`);
    }

    await page.getByRole('button', { name: 'Approve' }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Approve' }).click();
    await page.waitForTimeout(1000);
    screenshotPath = path.join(screenshotsDir, `step${step++}_quotation_approved.png`);
    await page.screenshot({ path: screenshotPath });

    // Write PASS results immediately in try block
    console.log("📊 Writing PASS results to file immediately...");
    console.log(`📋 PASS data: testResult=${testResult}, screenshotPath=${screenshotPath}`);
    
    try {
      const success = await writeResultToExcel(
        'WEB_AdminLogin',
        'TC005A',
        'Web_Admin_Email_RTS_Approve_Quote',
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
        'TC005A',
        'Web_Admin_Email_RTS_Approve_Quote',
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