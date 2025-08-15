import { remote } from 'webdriverio';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { generateUniqueTestData, fetchLatestOTPFromDiscord, fetchLatestOTPFromDiscordManual, pressHomeButton, fillOTPBoxes, clearAndFillPostalCode, selectAnyAvailableBank } from './TestData_iOS_SignUp.js';

async function writeResultToExcel(moduleid, tcId, testScenario, result, screenshotPath, sheetName = 'iOS_SignIn') {
  const filePath = path.resolve(process.cwd(), 'AutoReg_FBG2.0_Happy_Flow_E2E_Mobile_iOS.xlsx');
  
  console.log(`📊 Writing to Excel: ${filePath}`);
  console.log(`📋 Data: Module=${moduleid}, TC=${tcId}, Result=${result}, Screenshot=${screenshotPath}`);
  
  let workbook, worksheet;

  try {
    // Create directory if it doesn't exist
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Check if file exists and read it
    if (fs.existsSync(filePath)) {
      try {
        workbook = XLSX.readFile(filePath);
      } catch (readErr) {
        console.log("❌ Error reading existing file, creating new one");
        workbook = XLSX.utils.book_new();
      }
    } else {
      workbook = XLSX.utils.book_new();
    }

    // Check if sheet exists
    if (workbook.Sheets[sheetName]) {
      worksheet = workbook.Sheets[sheetName];
    } else {
      worksheet = XLSX.utils.aoa_to_sheet([
        ['Module', 'TC ID', 'Test Scenario', 'Timestamp', 'Result', 'Screenshot']
      ]);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }

    // Get existing data and add new row
    let data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    if (data.length === 0) {
      data = [['Module', 'TC ID', 'Test Scenario', 'Timestamp', 'Result', 'Screenshot']];
    }
    
    const timestamp = new Date().toLocaleString();
    const newRow = [moduleid, tcId, testScenario, timestamp, result, screenshotPath || 'N/A'];
    data.push(newRow);
    
    console.log(`📝 Adding row: ${JSON.stringify(newRow)}`);
    
    // Update worksheet and write file
    workbook.Sheets[sheetName] = XLSX.utils.aoa_to_sheet(data);
    XLSX.writeFile(workbook, filePath);
    
    console.log("✅ Excel file written successfully!");
    
  } catch (err) {
    console.error('❌ Failed to write Excel file:', err.message);
    
    // Create CSV backup
    try {
      const csvData = `${moduleid},${tcId},${testScenario},${new Date().toLocaleString()},${result},${screenshotPath || 'N/A'}\n`;
      const csvPath = path.resolve(process.cwd(), 'test_results_backup_ios.csv');
      
      if (!fs.existsSync(csvPath)) {
        fs.writeFileSync(csvPath, 'Module,TC ID,Test Scenario,Timestamp,Result,Screenshot\n');
      }
      
      fs.appendFileSync(csvPath, csvData);
      console.log(`📋 Backup written to: ${csvPath}`);
    } catch (backupErr) {
      console.error('❌ Backup also failed:', backupErr.message);
    }
  }
}

// Helper function to click element with retries - ENHANCED
async function clickWithRetries(driver, selector, description = '', options = {}) {
  const maxRetries = options.maxRetries || 3;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`🔄 Attempting to click ${description}: ${selector}`);
      
      let element;
      
      // Handle different selector types properly
      if (selector.startsWith('**/')) {
        // iOS Class Chain without prefix - add the prefix
        element = await driver.$(`-ios class chain:${selector}`);
      } else if (selector.startsWith('-ios class chain:')) {
        // iOS Class Chain with prefix
        element = await driver.$(selector);
      } else if (selector.startsWith('~')) {
        // Accessibility ID selector
        element = await driver.$(selector);
      } else if (selector.startsWith('//')) {
        // XPath selector
        element = await driver.$(selector);
      } else {
        // Default to regular selector
        element = await driver.$(selector);
      }
      
      if (await element.isExisting()) {
        await element.click();
        console.log(`✅ Successfully clicked ${description} on attempt ${i + 1}`);
        return true;
      } else {
        console.log(`⚠️ Element not found: ${description}, attempt ${i + 1}/${maxRetries}`);
      }
    } catch (error) {
      console.log(`⚠️ Click attempt ${i + 1}/${maxRetries} failed for ${description}: ${error.message}`);
      if (i === maxRetries - 1) {
        throw error;
      }
      await driver.pause(1000);
    }
  }
  return false;
}

// Helper function to fill text with retries
async function fillTextWithRetries(driver, selector, text, description = '', options = {}) {
  const maxRetries = options.maxRetries || 3;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`🔄 Attempting to fill ${description}: ${selector}`);
      const element = await driver.$(selector);
      
      if (await element.isExisting()) {
        await element.click();
        await driver.pause(500);
        await element.setValue(text);
        console.log(`✅ Successfully filled ${description} with "${text}" on attempt ${i + 1}`);
        return true;
      } else {
        console.log(`⚠️ Input field not found: ${description}, attempt ${i + 1}/${maxRetries}`);
      }
    } catch (error) {
      console.log(`⚠️ Fill attempt ${i + 1}/${maxRetries} failed for ${description}: ${error.message}`);
      if (i === maxRetries - 1) {
        throw error;
      }
      await driver.pause(1000);
    }
  }
  return false;
}

// Helper function for swipe gestures
async function swipeGesture(driver, startX, startY, endX, endY, duration = 1000) {
  await driver.action('pointer')
    .move({ duration: 0, x: startX, y: startY })
    .down({ button: 0 })
    .move({ duration: duration, x: endX, y: endY })
    .up({ button: 0 })
    .perform();
}

async function main() {
  const caps = {
    "appium:platformName": "iOS",
    "appium:automationName": "XCUITest",
    "appium:deviceName": "nadzrul's iPhone",
    "appium:platformVersion": "18.5",
    "appium:udid": "00008130-000165AC3E79001C",
  };

  const screenshotDir = path.resolve('./screenshots/Mobile_iOS_SignIn_AppleId');
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

  let driver;
  let testResult = 'PASS';
  let screenshotPath = '';
  let step = 1;

  try {
    driver = await remote({
      protocol: "http",
      hostname: "127.0.0.1",
      port: 4723,
      path: "/",
      capabilities: caps
    });

    // Generate unique test data
    const testData = generateUniqueTestData();
    console.log("🔄 Auto-generated test data:", testData);

    // ============================================
    // TC001: iOS INDIVIDUAL SIGN IN WITH APPLE ID
    // ============================================
    console.log("🚀 Starting TC001: iOS Individual Sign Up with Email");

    // Step 1: Launch FarmByte App (corrected selector)
    console.log("Step 1: Launch FarmByte App");
    await clickWithRetries(driver, '~FarmByte App Staging', 'FarmByte App');
    await driver.pause(3000);
    screenshotPath = path.join(screenshotDir, `step${step++}_app_launched.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 2: Click Sign In with Apple ID
    console.log("Step 2: Click Sign In with Apple ID");
    await clickWithRetries(driver, '(//XCUIElementTypeOther[@name="Log in with Apple"])[2]');
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_sign_up_clicked.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 4.1: Click Continue
    console.log("Step 4: Click Continue");
    await clickWithRetries(driver, '//XCUIElementTypeButton[@name="Continue"]');
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_full_name_filled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 5: Sign in with Passcode
    console.log("Step 5: Sign in with Passcode");
    await clickWithRetries(driver, '//XCUIElementTypeOther[@name="AUTHORIZE_BUTTON_TITLE"]/XCUIElementTypeOther');
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_email_filled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 6: Click 9 six times
    console.log("Step 6: Click 9 six times");
    await clickWithRetries(driver, '//XCUIElementTypeButton[@name="9"]');
    await clickWithRetries(driver, '//XCUIElementTypeButton[@name="9"]');
    await clickWithRetries(driver, '//XCUIElementTypeButton[@name="9"]');
    await clickWithRetries(driver, '//XCUIElementTypeButton[@name="9"]');
    await clickWithRetries(driver, '//XCUIElementTypeButton[@name="9"]');
    await clickWithRetries(driver, '//XCUIElementTypeButton[@name="9"]');
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_phone_number_filled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 48: Navigate to dashboard
    console.log("Step 48: Navigate to dashboard");
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_dashboard_navigated.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 49: Go to Profile
    console.log("Step 49: Go to Profile");
    await clickWithRetries(driver, '//XCUIElementTypeButton[@name="Profile, tab, 4 of 4"]');
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_profile_opened.png`);
    await driver.saveScreenshot(screenshotPath);

    console.log("✅ TC001 iOS Individual Sign Up with Email completed successfully!");
    
    // Final success screenshot
    screenshotPath = path.join(screenshotDir, `step${step++}_test_completed_success.png`);
    await driver.saveScreenshot(screenshotPath);

  } catch (err) {
    testResult = 'FAIL';
    console.error("❌ Error occurred:", err.message);
    console.error("Stack trace:", err.stack);
    if (driver) {
      screenshotPath = path.join(screenshotDir, `step${step++}_error.png`);
      await driver.saveScreenshot(screenshotPath);
    }
  } finally {
    if (driver) {
      try {
        await driver.deleteSession();
      } catch (e) {
        console.error("Error closing driver:", e.message);
      }
    }
    
    // Write results to Excel
    console.log("📊 Writing results to Excel...");
    await writeResultToExcel(
      'iOS_SignIn_AppleId',
      'TC009',
      'iOS_SignIn_AppleId_HappyFlow',
      testResult,
      screenshotPath,
      'iOS_SignIn'
    );
    
    console.log("🎯 Test execution completed!");
  }
}

main().catch(err => {
  console.error("❌ Main function error:", err);
  process.exit(1);
});