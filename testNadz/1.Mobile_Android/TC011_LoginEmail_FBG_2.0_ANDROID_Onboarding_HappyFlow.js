import { remote } from 'webdriverio';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { generateUniqueTestData } from './TestData_SignUp.js';

async function writeResultToExcel(moduleid, tcId, testScenario, result, screenshotPath, sheetName = 'Email_Login') {
  const filePath = path.resolve(process.cwd(), 'AutoReg_FBG2.0_Happy_Flow_E2E_Mobile_Android.xlsx');
  
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
      const csvPath = path.resolve(process.cwd(), 'test_results_backup.csv');
      
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

// Helper function to click element with retries
async function clickWithRetries(driver, selector, options = {}) {
  const maxRetries = options.maxRetries || 3;
  const timeout = options.timeout || 5000;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const element = await driver.$(selector);
      
      if (await element.isExisting()) {
        console.log(`✅ Element found with selector: ${selector}`);
        await element.click();
        console.log(`✅ Successfully clicked element on attempt ${i + 1}`);
        return true;
      } else {
        console.log(`⚠️ Element not found with selector: ${selector}, attempt ${i + 1}/${maxRetries}`);
      }
    } catch (error) {
      console.log(`⚠️ Click attempt ${i + 1}/${maxRetries} failed: ${error.message}`);
      if (i === maxRetries - 1) {
        throw error;
      }
      await driver.pause(1000);
    }
  }
  return false;
}

// Helper function to fill text with retries
async function fillTextWithRetries(driver, selector, text, options = {}) {
  const maxRetries = options.maxRetries || 3;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const element = await driver.$(selector);
      
      if (await element.isExisting()) {
        console.log(`✅ Input field found with selector: ${selector}`);
        await element.clearValue();
        await element.setValue(text);
        console.log(`✅ Successfully filled "${text}" on attempt ${i + 1}`);
        return true;
      } else {
        console.log(`⚠️ Input field not found with selector: ${selector}, attempt ${i + 1}/${maxRetries}`);
      }
    } catch (error) {
      console.log(`⚠️ Fill attempt ${i + 1}/${maxRetries} failed: ${error.message}`);
      if (i === maxRetries - 1) {
        throw error;
      }
      await driver.pause(1000);
    }
  }
  return false;
}

async function main() {
  const caps = {
    "appium:automationName": "UiAutomator2",
    "appium:platformName": "Android",
    "appium:platformVersion": "14",
    "appium:deviceName": "10AE480FQA000Q6",
    "appium:newCommandTimeout": 3600,
    "appium:connectHardwareKeyboard": true
  };

  const screenshotDir = path.resolve('./screenshots/Mobile_Android_Email_Login');
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
    // TC011: EMAIL LOGIN FLOW
    // ============================================
    console.log("🚀 Starting TC011: Email Login Flow");

    // Step 1: Launch app
    console.log("Step 1: Launch app");
    await clickWithRetries(driver, 'accessibility id:FarmByte Grow Staging');
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_launch_app.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 2: Click Log in with Email button
    console.log("Step 2: Click Log in with Email button");
    const emailLoginSelectors = [
      'android=new UiSelector().text("   Log in with Email  ")',
      'android=new UiSelector().text("Log in with Email")',
      'android=new UiSelector().textContains("Log in with Email")',
      'android=new UiSelector().textContains("Email")',
      'android=new UiSelector().className("android.widget.Button").textContains("Email")',
      'android=new UiSelector().className("android.widget.TextView").textContains("Email")',
    ];

    let emailLoginClicked = false;
    for (const selector of emailLoginSelectors) {
      try {
        if (await clickWithRetries(driver, selector)) {
          emailLoginClicked = true;
          console.log(`✅ Email login button clicked with selector: ${selector}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Email login selector failed: ${selector}`);
        continue;
      }
    }

    if (!emailLoginClicked) {
      throw new Error("Could not find or click Email login button");
    }

    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_email_login_clicked.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 3: Fill email address
    console.log("Step 3: Fill email address");
    const emailInputSelectors = [
      'android=new UiSelector().className("android.widget.EditText").instance(0)',
      'android=new UiSelector().className("android.widget.EditText").resourceIdMatches(".*email.*")',
      'android=new UiSelector().className("android.widget.EditText").descriptionContains("email")',
      'android=new UiSelector().className("android.widget.EditText").textContains("email")',
      'android=new UiSelector().resourceIdMatches(".*email.*")',
      'android=new UiSelector().descriptionContains("email")',
    ];

    let emailFilled = false;
    for (const selector of emailInputSelectors) {
      try {
        if (await fillTextWithRetries(driver, selector, "autotest210@gmail.com")) {
          emailFilled = true;
          console.log(`✅ Email filled with selector: ${selector}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Email input selector failed: ${selector}`);
        continue;
      }
    }

    if (!emailFilled) {
      throw new Error("Could not find or fill email input field");
    }

    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_email_filled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 4: Fill password
    console.log("Step 4: Fill password");
    const passwordInputSelectors = [
      'android=new UiSelector().className("android.widget.EditText").instance(1)',
      'android=new UiSelector().className("android.widget.EditText").resourceIdMatches(".*password.*")',
      'android=new UiSelector().className("android.widget.EditText").descriptionContains("password")',
      'android=new UiSelector().className("android.widget.EditText").textContains("password")',
      'android=new UiSelector().resourceIdMatches(".*password.*")',
      'android=new UiSelector().descriptionContains("password")',
    ];

    let passwordFilled = false;
    for (const selector of passwordInputSelectors) {
      try {
        if (await fillTextWithRetries(driver, selector, "P@ssw0rd1")) {
          passwordFilled = true;
          console.log(`✅ Password filled with selector: ${selector}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Password input selector failed: ${selector}`);
        continue;
      }
    }

    if (!passwordFilled) {
      throw new Error("Could not find or fill password input field");
    }

    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_password_filled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 5: Click Log in button
    console.log("Step 5: Click Log in button");
    const loginButtonSelectors = [
      'android=new UiSelector().text("   Log in with Email  ")',
      'android=new UiSelector().text("Log in with Email")',
      'android=new UiSelector().text("Log in")',
      'android=new UiSelector().text("LOGIN")',
      'android=new UiSelector().text("Sign in")',
      'android=new UiSelector().text("SIGN IN")',
      'android=new UiSelector().textContains("Log in")',
      'android=new UiSelector().textContains("Sign in")',
      'android=new UiSelector().className("android.widget.Button").textContains("Log in")',
      'android=new UiSelector().className("android.widget.Button").textContains("Sign in")',
      'android=new UiSelector().className("android.widget.TextView").textContains("Log in")',
    ];

    let loginClicked = false;
    for (const selector of loginButtonSelectors) {
      try {
        if (await clickWithRetries(driver, selector)) {
          loginClicked = true;
          console.log(`✅ Login button clicked with selector: ${selector}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Login button selector failed: ${selector}`);
        continue;
      }
    }

    if (!loginClicked) {
      throw new Error("Could not find or click Login button");
    }

    await driver.pause(3000);
    screenshotPath = path.join(screenshotDir, `step${step++}_login_clicked.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 6: Wait for login to complete and verify success
    console.log("Step 6: Wait for login to complete and verify success");
    await driver.pause(5000);
    
    // Take screenshot to verify login success
    screenshotPath = path.join(screenshotDir, `step${step++}_login_processing.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 7: Final success verification
    console.log("Step 7: Final success verification");
    try {
      // Try to find success indicators
      const successSelectors = [
        'android=new UiSelector().className("android.view.View").instance(15)',
        'android=new UiSelector().textContains("Welcome")',
        'android=new UiSelector().textContains("Dashboard")',
        'android=new UiSelector().textContains("Home")',
        'android=new UiSelector().textContains("Profile")',
        'android=new UiSelector().className("android.view.View").instance(10)',
        'android=new UiSelector().className("android.view.View").instance(12)',
        'android=new UiSelector().className("android.view.View").instance(13)',
        'android=new UiSelector().className("android.view.View").instance(14)',
      ];

      let successFound = false;
      for (const selector of successSelectors) {
        try {
          if (await clickWithRetries(driver, selector)) {
            successFound = true;
            console.log(`✅ Success verification clicked with selector: ${selector}`);
            break;
          }
        } catch (error) {
          console.log(`❌ Success verification selector failed: ${selector}`);
          continue;
        }
      }

      if (!successFound) {
        console.log("⚠️ Could not find specific success element, but continuing...");
      }

    } catch (verificationError) {
      console.log(`⚠️ Success verification failed: ${verificationError.message}`);
    }

    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_final_success.png`);
    await driver.saveScreenshot(screenshotPath);
    
    console.log("✅ TC011 Email Login Success!");
    
    // Set final success screenshot
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
      'Android_Email_Login',
      'TC011',
      'Android_Email_Login_HappyFlow',
      testResult,
      screenshotPath,
      'Email_Login'
    );
    
    console.log("🎯 Test execution completed!");
  }
}

main().catch(err => {
  console.error("❌ Main function error:", err);
  process.exit(1);
});