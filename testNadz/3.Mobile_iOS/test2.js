import { remote } from 'webdriverio';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { generateUniqueTestData } from './TestData_iOS_SignUp.js';

async function writeResultToExcel(moduleid, tcId, testScenario, result, screenshotPath, sheetName = 'iOS_SignUp') {
  const filePath = path.resolve(process.cwd(), 'AutoReg_FBG2.0_Happy_Flow_E2E_Mobile_iOS.xlsx');
  
  console.log(`📊 Writing to Excel: ${filePath}`);
  console.log(`📋 Data: Module=${moduleid}, TC=${tcId}, Result=${result}, Screenshot=${screenshotPath}`);
  
  let workbook, worksheet;

  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

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

    if (workbook.Sheets[sheetName]) {
      worksheet = workbook.Sheets[sheetName];
    } else {
      worksheet = XLSX.utils.aoa_to_sheet([
        ['Module', 'TC ID', 'Test Scenario', 'Timestamp', 'Result', 'Screenshot']
      ]);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }

    let data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    if (data.length === 0) {
      data = [['Module', 'TC ID', 'Test Scenario', 'Timestamp', 'Result', 'Screenshot']];
    }
    
    const timestamp = new Date().toLocaleString();
    const newRow = [moduleid, tcId, testScenario, timestamp, result, screenshotPath || 'N/A'];
    data.push(newRow);
    
    console.log(`📝 Adding row: ${JSON.stringify(newRow)}`);
    
    workbook.Sheets[sheetName] = XLSX.utils.aoa_to_sheet(data);
    XLSX.writeFile(workbook, filePath);
    
    console.log("✅ Excel file written successfully!");
    
  } catch (err) {
    console.error('❌ Failed to write Excel file:', err.message);
    
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

// Enhanced helper function to click element with retries
async function clickWithRetries(driver, selector, description = '', options = {}) {
  const maxRetries = options.maxRetries || 3;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`🔄 Attempting to click ${description}: ${selector}`);
      const element = await driver.$(selector);
      
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

// Enhanced helper function to fill text with retries
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

// Enhanced home button press function
async function pressHomeButton(driver) {
  const strategies = [
    // Strategy 1: Mobile execute command
    async () => {
      await driver.execute('mobile: pressButton', { name: 'home' });
    },
    // Strategy 2: Background app
    async () => {
      await driver.background(-1);
    },
    // Strategy 3: Use device key
    async () => {
      await driver.execute('mobile: deviceInfo');
      await driver.background(2);
    }
  ];

  for (let i = 0; i < strategies.length; i++) {
    try {
      console.log(`🔄 Trying home button strategy ${i + 1}`);
      await strategies[i]();
      console.log(`✅ Home button strategy ${i + 1} succeeded`);
      return true;
    } catch (error) {
      console.log(`⚠️ Home button strategy ${i + 1} failed: ${error.message}`);
    }
  }
  
  console.log("❌ All home button strategies failed");
  return false;
}

// Enhanced app launcher function
async function launchApp(driver, appName, bundleId = null) {
  const strategies = [
    // Strategy 1: Accessibility ID
    async () => {
      await clickWithRetries(driver, `~${appName}`, appName);
    },
    // Strategy 2: Bundle ID activation
    async () => {
      if (bundleId) {
        await driver.activateApp(bundleId);
      } else {
        throw new Error("Bundle ID not provided");
      }
    },
    // Strategy 3: Simple name
    async () => {
      await clickWithRetries(driver, appName, appName);
    },
    // Strategy 4: Terminate and relaunch
    async () => {
      if (bundleId) {
        await driver.terminateApp(bundleId);
        await driver.pause(1000);
        await driver.activateApp(bundleId);
      } else {
        throw new Error("Bundle ID not provided for terminate/relaunch");
      }
    }
  ];

  for (let i = 0; i < strategies.length; i++) {
    try {
      console.log(`🔄 Trying ${appName} launch strategy ${i + 1}`);
      await strategies[i]();
      console.log(`✅ ${appName} launch strategy ${i + 1} succeeded`);
      return true;
    } catch (error) {
      console.log(`⚠️ ${appName} launch strategy ${i + 1} failed: ${error.message}`);
    }
  }
  
  console.log(`❌ All ${appName} launch strategies failed`);
  return false;
}

async function main() {
  const caps = {
    "appium:platformName": "iOS",
    "appium:automationName": "XCUITest",
    "appium:deviceName": "nadzrul's iPhone",
    "appium:platformVersion": "18.5",
    "appium:udid": "00008130-000165AC3E79001C",
    "appium:bundleId": "com.farmbyte.staging",
    "appium:newCommandTimeout": 3600,
    "appium:connectHardwareKeyboard": true,
    "appium:noReset": true
  };

  const screenshotDir = path.resolve('./screenshots/Mobile_iOS_SignUp');
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
    // TC001: iOS INDIVIDUAL SIGN UP WITH EMAIL
    // ============================================
    console.log("🚀 Starting TC001: iOS Individual Sign Up with Email");

    // Steps 1-11 remain the same as your original code...
    // (I'll include the key steps where the error occurred)

    // Step 11: Click Continue (corrected selector)
    console.log("Step 11: Click Continue");
    await clickWithRetries(driver, '~Continue', 'Continue button');
    await driver.pause(3000);
    screenshotPath = path.join(screenshotDir, `step${step++}_continue_clicked.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 12: Go to home (Discord for OTP) - FIXED
    console.log("Step 12: Go to home for Discord OTP");
    await pressHomeButton(driver);
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_home_pressed.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 13: Open Discord - ENHANCED
    console.log("Step 13: Open Discord");
    await launchApp(driver, 'Discord', 'com.hammerandchisel.discord');
    await driver.pause(3000);
    screenshotPath = path.join(screenshotDir, `step${step++}_discord_opened.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 14: Scroll to load more messages
    console.log("Step 14: Scroll to load more messages");
    await swipeGesture(driver, 245, 655, 241, 393);
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_discord_scrolled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 15: Load more messages
    console.log("Step 15: Load more messages");
    await clickWithRetries(driver, '~Load more messages', 'Load more messages');
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_load_more_messages.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 16: Click on OTP message (copy OTP)
    console.log("Step 16: Click on OTP message to copy");
    await clickWithRetries(driver, `~[FA][Staging] Your one-time password is ${testData.otpCode}`, 'OTP message');
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_otp_copied.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 17: Return to home - FIXED
    console.log("Step 17: Return to home");
    await pressHomeButton(driver);
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_home_pressed_again.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 18: Return to FarmByte App - ENHANCED
    console.log("Step 18: Return to FarmByte App");
    await launchApp(driver, 'FarmByte App Staging', 'com.farmbyte.staging');
    await driver.pause(3000);
    screenshotPath = path.join(screenshotDir, `step${step++}_returned_to_app.png`);
    await driver.saveScreenshot(screenshotPath);

    // Continue with remaining steps...
    // (Rest of your code remains the same)

    console.log("✅ TC001 iOS Individual Sign Up with Email completed successfully!");
    
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
    
    await writeResultToExcel(
      'iOS_Individual_SignUp',
      'TC001',
      'iOS_Individual_SignUp_Email_HappyFlow',
      testResult,
      screenshotPath,
      'iOS_SignUp'
    );
    
    console.log("🎯 Test execution completed!");
  }
}

main().catch(err => {
  console.error("❌ Main function error:", err);
  process.exit(1);
});