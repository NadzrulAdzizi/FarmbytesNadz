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
  const screenshotsDir = path.resolve('./screenshots/web_AppleId_Individual_approve_supplier_management_CompanyInfo');
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

    // Step 5: Open search filter
    console.log("Step 5: Open search filter");
    await page.getByRole('textbox').click();
    await page.waitForTimeout(1000);
    screenshotPath = path.join(screenshotsDir, `step${step++}_search_filter_opened.png`);
    await page.screenshot({ path: screenshotPath });

    // Step 6: Click Filter button (first time)
    console.log("Step 6: Click Filter button (first time)");
    await page.getByRole('button', { name: 'Filter' }).click();
    await page.waitForTimeout(1000);
    screenshotPath = path.join(screenshotsDir, `step${step++}_filter_clicked_first.png`);
    await page.screenshot({ path: screenshotPath });

    // Step 7: Click Filter button (second time)
    console.log("Step 7: Click Filter button (second time)");
    await page.getByRole('button', { name: 'Filter' }).click();
    await page.waitForTimeout(1000);
    screenshotPath = path.join(screenshotsDir, `step${step++}_filter_clicked_second.png`);
    await page.screenshot({ path: screenshotPath });

    // Step 8: Enter search text
    console.log("Step 8: Enter search text");
    await page.getByRole('textbox').click();
    await page.getByRole('textbox').fill('Nadzrul Apple');
    await page.waitForTimeout(1000);
    screenshotPath = path.join(screenshotsDir, `step${step++}_search_text_entered.png`);
    await page.screenshot({ path: screenshotPath });

    // Step 9: Click on search result
    console.log("Step 9: Click on search result");
    await page.getByRole('textbox').click();
    await page.waitForTimeout(1000);
    screenshotPath = path.join(screenshotsDir, `step${step++}_search_result_clicked.png`);
    await page.screenshot({ path: screenshotPath });

    // Step 10: Click on Pending status
    console.log("Step 10: Click on Pending status");
    await page.getByRole('cell', { name: 'Pending' }).first().click();
    await page.waitForTimeout(1000);
    screenshotPath = path.join(screenshotsDir, `step${step++}_pending_status_clicked.png`);
    await page.screenshot({ path: screenshotPath });

    // Step 11: Click on user link
    console.log("Step 11: Click on user link");
    await page.getByRole('link', { name: 'Nadzrul Apple' }).click();
    await page.waitForLoadState('networkidle');
    screenshotPath = path.join(screenshotsDir, `step${step++}_user_profile_opened.png`);
    await page.screenshot({ path: screenshotPath });

    // Step 12: Click Preview button
    console.log("Step 12: Click Preview button");
    await page.getByRole('button', { name: 'Preview' }).first().click();
    await page.waitForTimeout(2000);
    screenshotPath = path.join(screenshotsDir, `step${step++}_preview_opened.png`);
    await page.screenshot({ path: screenshotPath });

    // Step 13: Click on document in Company Information tab
    console.log("Step 13: Click on document in Company Information tab");
    await page.getByRole('tabpanel', { name: 'Company Information' }).getByRole('button').nth(4).click();
    await page.waitForTimeout(1000);
    screenshotPath = path.join(screenshotsDir, `step${step++}_company_info_document_clicked.png`);
    await page.screenshot({ path: screenshotPath });

    // Step 14: Close document preview
    console.log("Step 14: Close document preview");
    await page.locator('div').filter({ hasText: /^Document Preview$/ }).getByRole('button').click();
    await page.waitForTimeout(1000);
    screenshotPath = path.join(screenshotsDir, `step${step++}_document_preview_closed.png`);
    await page.screenshot({ path: screenshotPath });

    // Step 15: Change KYC status to Verified (first time)
    console.log("Step 15: Change KYC status to Verified (first time)");
    await page.getByText('Pending KYC Status').click();
    await page.getByRole('option', { name: 'Verified' }).click();
    await page.waitForTimeout(1000);
    screenshotPath = path.join(screenshotsDir, `step${step++}_kyc_status_verified_first.png`);
    await page.screenshot({ path: screenshotPath });

    // Step 16: Open KYC status dropdown again
    console.log("Step 16: Open KYC status dropdown again");
    await page.getByText('Pending KYC Status').click();
    await page.waitForTimeout(1000);
    screenshotPath = path.join(screenshotsDir, `step${step++}_kyc_status_dropdown_opened.png`);
    await page.screenshot({ path: screenshotPath });

    // Step 17: Select Supplier Type
    console.log("Step 17: Select Supplier Type");
    await page.getByRole('combobox').filter({ hasText: 'Supplier Type' }).click();
    await page.getByRole('option', { name: 'Medium-sized' }).click();
    await page.waitForTimeout(1000);
    screenshotPath = path.join(screenshotsDir, `step${step++}_supplier_type_selected.png`);
    await page.screenshot({ path: screenshotPath });

    // Step 18: Select Contract Type
    console.log("Step 18: Select Contract Type");
    await page.getByRole('combobox').filter({ hasText: 'Contract Type' }).click();
    await page.waitForTimeout(3000);
    await page.getByRole('option', { name: 'Regular Contract' }).click();
    await page.waitForTimeout(1000);
    screenshotPath = path.join(screenshotsDir, `step${step++}_contract_type_selected.png`);
    await page.screenshot({ path: screenshotPath });

    // Step 19: Set KYC status to Verified (final time)
    console.log("Step 19: Set KYC status to Verified (final time)");
    await page.getByText('Pending KYC Status').click();
    await page.getByRole('option', { name: 'Verified' }).click();
    await page.waitForTimeout(1000);
    screenshotPath = path.join(screenshotsDir, `step${step++}_kyc_status_verified_final.png`);
    await page.screenshot({ path: screenshotPath });

    // Step 20: Click Approve button
    console.log("Step 20: Click Approve button");
    await page.locator('div').filter({ hasText: /^approve$/ }).first().click();
    await page.waitForTimeout(2000);
    screenshotPath = path.join(screenshotsDir, `step${step++}_approve_clicked.png`);
    await page.screenshot({ path: screenshotPath });

    console.log("✅ Test completed successfully!");
    
    // Set final success screenshot
    screenshotPath = path.join(screenshotsDir, `step${step++}_test_completed_success.png`);
    await page.screenshot({ path: screenshotPath });

    // Write PASS results immediately in try block
    console.log("📊 Writing PASS results to file immediately...");
    console.log(`📋 PASS data: testResult=${testResult}, screenshotPath=${screenshotPath}`);
    
    try {
      const success = await writeResultToExcel(
        'WEB_AdminLogin',
        'TC004A',
        'Web_Admin_AppleId_Individual_Approve_SupplierManagement_CompanyDetails_HappyFlow',
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
        'TC004A',
        'Web_Admin_AppleId_Individual_Approve_SupplierManagement_CompanyDetails_HappyFlow',
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