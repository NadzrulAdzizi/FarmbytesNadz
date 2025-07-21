import { test, expect } from '@playwright/test';
import * as XLSX from 'xlsx';
const { chromium } = require('@playwright/test');
import path from 'path';
import fs from 'fs';

// ============================================
// UTILITY FUNCTIONS
// ============================================

async function writeResultToExcel(module, tcId, testScenario, timestamp, result, screenshotPath) {
  console.log(`📊 Writing test results to Excel...`);
  
  const filePath = path.join(process.cwd(), 'AutoReg_FBG2.0_Happy_Flow_E2E_Web.xlsx');
  
  try {
    let workbook;
    const sheetName = 'WEB_Test_Results';
    
    // Read or create workbook
    if (fs.existsSync(filePath)) {
      workbook = XLSX.readFile(filePath);
    } else {
      workbook = XLSX.utils.book_new();
    }
    
    // Get or create worksheet
    let worksheet;
    if (workbook.Sheets[sheetName]) {
      worksheet = workbook.Sheets[sheetName];
    } else {
      worksheet = XLSX.utils.aoa_to_sheet([
        ['Module', 'TC ID', 'Test Scenario', 'Timestamp', 'Result', 'Screenshot']
      ]);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }
    
    // Add new data
    const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const newRow = [module, tcId, testScenario, timestamp, result, screenshotPath || 'N/A'];
    sheetData.push(newRow);
    
    // Update worksheet and save
    const newWorksheet = XLSX.utils.aoa_to_sheet(sheetData);
    workbook.Sheets[sheetName] = newWorksheet;
    XLSX.writeFile(workbook, filePath);
    
    console.log(`✅ Excel file updated successfully`);
    return true;
    
  } catch (error) {
    console.error(`❌ Excel write failed: ${error.message}`);
    
    // Fallback to CSV
    try {
      const csvPath = path.join(process.cwd(), 'test_results_backup.csv');
      const csvRow = `"${module}","${tcId}","${testScenario}","${timestamp}","${result}","${screenshotPath || 'N/A'}"\n`;
      
      if (!fs.existsSync(csvPath)) {
        fs.writeFileSync(csvPath, '"Module","TC ID","Test Scenario","Timestamp","Result","Screenshot"\n');
      }
      
      fs.appendFileSync(csvPath, csvRow);
      console.log(`✅ CSV backup created successfully`);
      return true;
      
    } catch (csvError) {
      console.error(`❌ All write methods failed: ${csvError.message}`);
      return false;
    }
  }
}

async function takeScreenshot(page, screenshotsDir, step, description) {
  try {
    const screenshotPath = path.join(screenshotsDir, `step${step}_${description}.png`);
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Screenshot taken: ${description}`);
    return screenshotPath;
  } catch (error) {
    console.error(`❌ Screenshot failed: ${error.message}`);
    return null;
  }
}

// ============================================
// MAIN TEST
// ============================================

test('TC004A - Web Admin Approve Company Supplier Management', async () => {
  let testResult = 'PASS';
  let screenshotPath = '';
  let browser, context, page;
  let step = 1;
  
  const timestamp = new Date().toLocaleString();
  const screenshotsDir = path.resolve('./screenshots/web_Gmail_Company_approve_supplier_management_BankDetails');
  
  // Create screenshots directory
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  console.log(`🚀 Starting TC004A at: ${timestamp}`);

  try {
    // ============================================
    // SETUP PHASE
    // ============================================
    console.log("🔧 Setting up browser...");
    browser = await chromium.launch({ headless: false });
    context = await browser.newContext();
    page = await context.newPage();

    // ============================================
    // LOGIN PHASE
    // ============================================
    console.log("🔐 Starting login process...");
    
    // Step 1: Navigate to login page
    console.log("Step 1: Navigate to login page");
    await page.goto('https://commandcenter-stg.farmbyte.com/login');
    await page.waitForLoadState('networkidle');
    screenshotPath = await takeScreenshot(page, screenshotsDir, step++, 'login_page');

    // Step 2: Fill email
    console.log("Step 2: Fill email");
    await page.locator('input[type="email"]').click();
    await page.locator('input[type="email"]').fill('superadmin001@gmail.com');
    await page.waitForTimeout(1000);
    screenshotPath = await takeScreenshot(page, screenshotsDir, step++, 'email_filled');

    // Step 3: Fill password
    console.log("Step 3: Fill password");
    await page.locator('input[type="email"]').press('Tab');
    await page.locator('input[type="password"]').fill('P@ssw0rd1');
    await page.waitForTimeout(1000);
    screenshotPath = await takeScreenshot(page, screenshotsDir, step++, 'password_filled');

    // Step 4: Click login button
    console.log("Step 4: Click login button");
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForLoadState('networkidle');
    screenshotPath = await takeScreenshot(page, screenshotsDir, step++, 'after_login');

    // ============================================
    // USER MANAGEMENT PHASE
    // ============================================
    console.log("👥 Starting user management process...");

    // Step 5: Navigate to User section
    console.log("Step 5: Navigate to User section");
    await page.getByRole('link', { name: 'User' }).click();
    await page.waitForTimeout(2000);
    screenshotPath = await takeScreenshot(page, screenshotsDir, step++, 'user_section_opened');

    // Step 6: Search for user
    console.log("Step 6: Search for user");
    await page.getByRole('textbox').click();
    await page.getByRole('textbox').fill('Mohd Nadzrul Adzizi');
    await page.waitForTimeout(1000);
    screenshotPath = await takeScreenshot(page, screenshotsDir, step++, 'user_search_entered');

    // Step 7: Select user from results
    console.log("Step 7: Select user from results");
    await page.getByRole('cell', { name: 'Mohd Nadzrul Adzizi' }).click();
    await page.waitForTimeout(1000);
    screenshotPath = await takeScreenshot(page, screenshotsDir, step++, 'user_selected');

    // Step 12: Navigate to company profile
    console.log("Step 12: Navigate to company profile");
    await page.getByRole('link', { name: 'Autotest' }).click();
    await page.waitForTimeout(2000);
    screenshotPath = await takeScreenshot(page, screenshotsDir, step++, 'company_profile_opened');

    // ============================================
    // ADDITIONAL TABS VERIFICATION
    // ============================================
    console.log("📋 Verifying additional tabs...");

    // Step 20: Check Farm Information tab
    console.log("Step 20: Check Farm Information tab");
    await page.getByRole('tab', { name: 'Farm Information' }).click();
    await page.waitForTimeout(1000);
    screenshotPath = await takeScreenshot(page, screenshotsDir, step++, 'farm_information_tab');

    // Step 21: Check List of Employees tab
    console.log("Step 21: Check List of Employees tab");
    await page.getByRole('tab', { name: 'List of Employees' }).click();
    await page.waitForTimeout(1000);
    screenshotPath = await takeScreenshot(page, screenshotsDir, step++, 'employees_tab');

    // Step 22: Check Bank Details tab
    console.log("Step 22: Check Bank Details tab");
    await page.getByRole('tab', { name: 'Bank Details' }).click();
    await page.waitForTimeout(1000);
    screenshotPath = await takeScreenshot(page, screenshotsDir, step++, 'bank_details_tab');

    // Step 23: Verify bank details
    console.log("Step 23: Verify bank details");
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Verified' }).click();
    await page.waitForTimeout(1000);
    screenshotPath = await takeScreenshot(page, screenshotsDir, step++, 'bank_details_verified');

    // ============================================
    // COMPLETION
    // ============================================
    console.log("✅ Test completed successfully!");
    await page.waitForTimeout(2000);
    screenshotPath = await takeScreenshot(page, screenshotsDir, step++, 'test_completed_success');

    // Write PASS results
    const writeSuccess = await writeResultToExcel(
      'WEB_AdminLogin',
      'TC002D',
      'Web_Admin_Gmail_Company_Approve_SupplierManagement_BankDetails_HappyFlow',
      timestamp,
      testResult,
      screenshotPath
    );

    if (writeSuccess) {
      console.log("✅ Test results written successfully!");
    }

  } catch (error) {
    testResult = 'FAIL';
    console.error("❌ Test failed:", error.message);
    
    // Take error screenshot
    if (page) {
      screenshotPath = await takeScreenshot(page, screenshotsDir, step++, 'error');
    }
    
    // Write FAIL results
    await writeResultToExcel(
      'WEB_AdminLogin',
      'TC002D',
      'Web_Admin_Gmail_Company_Approve_SupplierManagement_BankDetails_HappyFlow',
      timestamp,
      testResult,
      screenshotPath
    );
    
    throw error; // Re-throw to fail the test
    
  } finally {
    // Cleanup
    if (context) await context.close();
    if (browser) await browser.close();
    
    console.log(`🎯 Test execution completed with result: ${testResult}`);
  }
});