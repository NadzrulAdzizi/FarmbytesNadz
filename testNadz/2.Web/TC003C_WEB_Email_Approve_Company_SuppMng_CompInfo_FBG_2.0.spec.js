import { test, expect } from '@playwright/test';
import * as XLSX from 'xlsx';
const { chromium } = require('@playwright/test');
import path from 'path';
import fs from 'fs';
import { generateUniqueTestData } from './testdata';

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
  const screenshotsDir = path.resolve('./screenshots/web_Email_Company_approve_supplier_management_CompanyInfo');
  
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
    
    try {
      await page.getByRole('textbox').click();
      await page.getByRole('textbox').fill('autotest829');// to search with latest user
    } catch (searchError) {
      console.log("⚠️ Search textbox not found, trying alternative selector");
      try {
        await page.locator('input[type="text"]').first().click();
        await page.locator('input[type="text"]').first().fill('autotest829');// to search with latest user
      } catch (altSearchError) {
        console.log("❌ Search input not found, continuing");
      }
    }
    
    await page.waitForTimeout(1000);
    screenshotPath = await takeScreenshot(page, screenshotsDir, step++, 'user_search_entered');

    // Step 7: Select user from results
    console.log("Step 7: Select user from results");
    
    try {
      await page.getByRole('cell', { name: 'autotest829' }).click();// to search with latest user
    } catch (cellError) {
      console.log("⚠️ User cell not found, trying alternative approach");
      try {
        await page.locator('text=autotest829').click();// to search with latest user
      } catch (altCellError) {
        console.log("❌ User selection failed, continuing");
      }
    }
    
    await page.waitForTimeout(1000);
    screenshotPath = await takeScreenshot(page, screenshotsDir, step++, 'user_selected');

    // Step 8: Navigate to company profile
    console.log("Step 8: Navigate to company profile");
    
    try {
      await page.getByRole('link', { name: 'Autotest' }).click();
    } catch (companyError) {
      console.log("⚠️ Company link not found, trying alternative");
      try {
        await page.locator('text=Autotest').click();
      } catch (altCompanyError) {
        console.log("❌ Company navigation failed, continuing");
      }
    }
    
    await page.waitForTimeout(2000);
    screenshotPath = await takeScreenshot(page, screenshotsDir, step++, 'company_profile_opened');

    // Step 13: Click Preview button
    console.log("Step 13: Click Preview button");
    await page.getByRole('button', { name: 'Preview' }).click();
    await page.waitForTimeout(2000);
    screenshotPath = await takeScreenshot(page, screenshotsDir, step++, 'preview_opened');

    // Step 14: Click document button
    console.log("Step 14: Click document button");
    await page.getByRole('button').filter({ hasText: /^$/ }).click();
    await page.waitForTimeout(1000);
    screenshotPath = await takeScreenshot(page, screenshotsDir, step++, 'document_clicked');

    // ============================================
    // KYC VERIFICATION PHASE
    // ============================================
    console.log("✅ Starting KYC verification process...");

    // Step 15: Set KYC status to Verified
    console.log("Step 15: Set KYC status to Verified");
    await page.getByText('Pending KYC Status').click();
    await page.getByRole('option', { name: 'Verified' }).click();
    await page.waitForTimeout(1000);
    screenshotPath = await takeScreenshot(page, screenshotsDir, step++, 'kyc_status_verified');

    // Step 16: Set Supplier Type
    console.log("Step 16: Set Supplier Type");
    await page.getByRole('combobox').filter({ hasText: 'Supplier Type' }).click();
    await page.getByRole('option', { name: 'Large-sized' }).click();
    await page.waitForTimeout(1000);
    screenshotPath = await takeScreenshot(page, screenshotsDir, step++, 'supplier_type_set');

    // Step 17: Set Contract Type
    console.log("Step 17: Set Contract Type");
    await page.getByRole('combobox').filter({ hasText: 'Contract Type' }).click();
    await page.getByRole('option', { name: 'Contract Farming', exact: true }).click();
    await page.waitForTimeout(1000);
    screenshotPath = await takeScreenshot(page, screenshotsDir, step++, 'contract_type_set');

    // Step 18: Confirm KYC status (final)
    console.log("Step 18: Confirm KYC status (final)");
    await page.getByText('Pending KYC Status').click();
    await page.getByRole('option', { name: 'Verified' }).click();
    await page.waitForTimeout(1000);
    screenshotPath = await takeScreenshot(page, screenshotsDir, step++, 'kyc_status_final');

    // Step 19: Final approval
    console.log("Step 19: Final approval");
    await page.getByText('approve').click();
    await page.waitForTimeout(1000);
    screenshotPath = await takeScreenshot(page, screenshotsDir, step++, 'final_approval');

    // ============================================
    // COMPLETION
    // ============================================
    console.log("✅ Test completed successfully!");
    screenshotPath = await takeScreenshot(page, screenshotsDir, step++, 'test_completed_success');

    // Write PASS results
    const writeSuccess = await writeResultToExcel(
      'WEB_AdminLogin',
      'TC003C',
      'Web_Admin_Email_Company_Approve_SupplierManagement_CompanyDetails_HappyFlow',
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
      'TC003C',
      'Web_Admin_Email_Company_Approve_SupplierManagement_CompanyDetails_HappyFlow',
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