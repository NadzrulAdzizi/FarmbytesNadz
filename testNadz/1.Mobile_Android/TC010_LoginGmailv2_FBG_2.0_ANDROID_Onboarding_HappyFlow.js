import { remote } from 'webdriverio';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { generateUniqueTestData } from './TestData_SignUp.js';

async function writeResultToExcel(moduleid, tcId, testScenario, result, screenshotPath, sheetName = 'Gmail_Loginv2') {
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

async function main() {
  const caps = {
    "appium:automationName": "UiAutomator2",
    "appium:platformName": "Android",
    "appium:platformVersion": "14",
    "appium:deviceName": "10AE480FQA000Q6",
    "appium:newCommandTimeout": 3600,
    "appium:connectHardwareKeyboard": true
  };

  const screenshotDir = path.resolve('./screenshots/Mobile_Android_Gmail_Loginv2');
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

  let driver;
  let testResult = 'PASS';
  let screenshotPath = ''; // Will be updated throughout the test
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
    // TC003: FACEBOOK SIGN UP + KYC FLOW
    // ============================================
    console.log("🚀 Starting TC003: Facebook SignUp + KYC Flow");

    // Step 1: Launch app
    console.log("Step 1: Launch app");
    await (await driver.$("accessibility id:FarmByte Grow Staging")).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_launch_app.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 5: Final success verification
    console.log("Step 5: Final success verification");
    await (await driver.$('android=new UiSelector().className("android.view.View").instance(15)')).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_final_success.png`));
    
    console.log("✅ TC007 Facebook Login Success !");
    
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
      'Android_Gmail_Loginv2',
      'TC010',
      'Android_Gmail_Loginv2_HappyFlow',
      testResult,
      screenshotPath, // This will now always contain a valid screenshot path
      'Gmail_Loginv2',
    );
    
    console.log("🎯 Test execution completed!");
  }
}

main().catch(err => {
  console.error("❌ Main function error:", err);
  process.exit(1);
});