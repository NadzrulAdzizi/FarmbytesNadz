import { remote } from 'webdriverio';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

async function writeResultToExcel(moduleid, tcId, testScenario, result, screenshotPath, sheetName = 'Mobile_Delete_User') {
  const filePath = path.resolve(process.cwd(), 'AutoReg_FBG2.0_Happy_Flow_E2E_Mobile_Android.xlsx');
  let workbook, worksheet;

  try {
    workbook = XLSX.readFile(filePath);
    worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      worksheet = XLSX.utils.aoa_to_sheet([['Module','TC ID', 'Test Scenario', 'Timestamp', 'Result', 'Screenshot']]);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }
  } catch {
    workbook = XLSX.utils.book_new();
    worksheet = XLSX.utils.aoa_to_sheet([['Module','TC ID', 'Test Scenario', 'Timestamp', 'Result', 'Screenshot']]);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  }

  let data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  if (data.length === 0 || (data.length === 1 && data[0][0] !== 'Module')) {
    data = [['Module','TC ID', 'Test Scenario', 'Timestamp', 'Result', 'Screenshot']];
  }
  const timestamp = new Date().toLocaleString();
  data.push([moduleid, tcId, testScenario, timestamp, result, screenshotPath]);
  workbook.Sheets[sheetName] = XLSX.utils.aoa_to_sheet(data);

  try {
    XLSX.writeFile(workbook, filePath);
  } catch (err) {
    console.error('Failed to write Excel file:', err);
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

  const screenshotDir = path.resolve('./screenshots/Mobile_Android_DeleteUser_Gmail');
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

    console.log("🔄 Starting Delete User Test...");
    
    // Step 1: Launch app
    console.log("Step 1: Launch app");
    await (await driver.$("accessibility id:FarmByte Grow Staging")).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_launch_app.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 2: Navigate to Login with Gmail
    console.log("Step 2: Navigate to Login with Gmail");
    await (await driver.$('android=new UiSelector().description("Log in with Google ")')).click();
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_signup_page.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 4: Select Gmail account
    console.log("Step 4: Select Gmail account");
    await (await driver.$("android=new UiSelector().text(\"nadzruladzizi03@gmail.com\")")).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_gmail_account_selected.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 1: Navigate to User Profile
    console.log("Step 1: Navigate to User Profile");
    await (await driver.$('android=new UiSelector().className("android.view.View").instance(15)')).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_UserProfile.png`));

    // Step 2: Click on profile/settings icon
    console.log("Step 2: Click on profile/settings icon");
    await (await driver.$('android=new UiSelector().className("android.widget.ImageView").instance(1)')).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_profile_icon_clicked.png`));

    // Step 3: Click Delete Account
    console.log("Step 3: Click Delete Account");
    await (await driver.$('android=new UiSelector().text("Delete Account")')).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_delete_account_clicked.png`));

    // Step 4: Confirm deletion
    console.log("Step 4: Confirm deletion");
    await (await driver.$('android=new UiSelector().text("   Delete  ")')).click();
    await driver.pause(3000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_delete_confirmed.png`));

    // Step 5: Verify deletion success (optional - check for confirmation message)
    console.log("Step 5: Verify deletion process");
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_deletion_complete.png`));

    console.log("✅ Delete User Test completed successfully!");

    // Step 2: Navigate to Login with Gmail
    console.log("Step 2: Navigate to Login with Gmail");
    await (await driver.$('android=new UiSelector().description("Log in with Google ")')).click();
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_signup_page.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 4: Select Gmail account
    console.log("Step 4: Select Gmail account");
    await (await driver.$("android=new UiSelector().text(\"nadzruladzizi03@gmail.com\")")).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_gmail_account_selected.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 5: Verify deletion success (optional - check for confirmation message)
    console.log("Step 5: Verify deletion process");
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_deletion_complete.png`));


  } catch (err) {
    testResult = 'FAIL';
    console.error("❌ Error occurred:", err.message);
    if (driver) {
      screenshotPath = path.join(screenshotDir, `step${step++}_error.png`);
      await driver.saveScreenshot(screenshotPath);
    }
  } finally {
    if (driver) await driver.deleteSession();
    await writeResultToExcel(
      'Delete_User_Gmail',
      'TC003',
      'Mobile_Delete_User_Gmail_NegativeScenario',
      testResult,
      screenshotPath,
      'Mobile_Delete_User'
    );
  }
}

main();