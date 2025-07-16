import { remote } from 'webdriverio';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

async function writeResultToExcel(moduleid, tcId, testScenario, result, screenshotPath, sheetName = 'Mobile_User_Onboarding') {
  // Use absolute path to avoid issues with npx/node working directory
  const filePath = path.resolve(process.cwd(), 'AutoReg_FBG2.0_Happy_Flow_E2E_Mobile_iOS.xlsx');
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

  // Read existing data and append new row
  let data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  // Ensure header exists only once
  if (data.length === 0 || (data.length === 1 && data[0][0] !== 'Module')) {
    data = [['Module','TC ID', 'Test Scenario', 'Timestamp', 'Result', 'Screenshot']];
  }
  const now = new Date();
  const timestamp = now.toLocaleString();
  data.push([moduleid, tcId, testScenario, timestamp, result, screenshotPath]);
  const newSheet = XLSX.utils.aoa_to_sheet(data);
  workbook.Sheets[sheetName] = newSheet;

  // Log the file path for debugging
  console.log('Writing results to:', filePath);

  try {
    XLSX.writeFile(workbook, filePath);
  } catch (err) {
    console.error('Failed to write Excel file:', err);
  }
}

async function main () {
  const caps = {
    "appium:automationName": "UiAutomator2",
    "appium:platformName": "Android",
    "appium:platformVersion": "14",
    "appium:deviceName": "10AE480FQA000Q6",
    "appium:newCommandTimeout": 3600,
    "appium:connectHardwareKeyboard": true
  };

  let driver;
  let testResult = 'PASS';
  let screenshotPath = '';
  const screenshotDir = path.resolve('./screenshots/Mobile_iOS');
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir);
  let step = 1;

  try {
    driver = await remote({
      protocol: "http",
      hostname: "127.0.0.1",
      port: 4723,
      path: "/",
      capabilities: caps
    });

    // Step 1: Launch app
    const el2 = await driver.$("accessibility id:FarmByte Grow Staging");
    await el2.click();
    await driver.saveScreenshot(path.join(screenshotDir, `TC001_step${step++}_${Date.now()}.png`));

    // Step 2: Sign Up
    const el3 = await driver.$("-android uiautomator:new UiSelector().text(\"Sign Up\")");
    await el3.click();
    await driver.saveScreenshot(path.join(screenshotDir, `TC001_step${step++}_${Date.now()}.png`));

    // Step 3: Sign up with Email
    const el4 = await driver.$("-android uiautomator:new UiSelector().text(\"Sign up with Email\")");
    await el4.click();
    await driver.saveScreenshot(path.join(screenshotDir, `TC001_step${step++}_${Date.now()}.png`));

    // Step 4: Enter Username
    const el5 = await driver.$("-android uiautomator:new UiSelector().className(\"android.widget.EditText\").instance(0)");
    await el5.click();
    await el5.addValue("AUTOTEST001");
    await driver.saveScreenshot(path.join(screenshotDir, `TC001_step${step++}_${Date.now()}.png`));

    // Step 5: Enter Email
    const el6 = await driver.$("-android uiautomator:new UiSelector().className(\"android.widget.EditText\").instance(1)");
    await el6.click();
    await el6.addValue("autotest001@gmail.com");
    await driver.saveScreenshot(path.join(screenshotDir, `TC001_step${step++}_${Date.now()}.png`));

    // Step 6: Scroll or perform pointer action
    await driver.action('pointer')
        .move({ duration: 0, x: 759, y: 1199 })
        .down({ button: 0 })
        .move({ duration: 1000, x: 748, y: 509 })
        .up({ button: 0 })
        .perform();
    await driver.saveScreenshot(path.join(screenshotDir, `TC001_step${step++}_${Date.now()}.png`));

    // Step 7: Enter Phone Number
    const el7 = await driver.$("-android uiautomator:new UiSelector().text(\"Phone Number\")");
    await el7.click();
    await el7.addValue("111111001");
    await driver.saveScreenshot(path.join(screenshotDir, `TC001_step${step++}_${Date.now()}.png`));

    // Step 8: Enter Password
    const el9 = await driver.$("-android uiautomator:new UiSelector().className(\"android.widget.EditText\").instance(3)");
    await el9.click();
    await el9.addValue("P@ssw0rd1");
    await driver.saveScreenshot(path.join(screenshotDir, `TC001_step${step++}_${Date.now()}.png`));

    // Step 9: Confirm Password
    const el10 = await driver.$("-android uiautomator:new UiSelector().className(\"android.widget.EditText\").instance(4)");
    await el10.click();
    await el10.addValue("P@ssw0rd1");
    await driver.saveScreenshot(path.join(screenshotDir, `TC001_step${step++}_${Date.now()}.png`));

    // Step 10: Password requirements
    const el11 = await driver.$("-android uiautomator:new UiSelector().text(\"Your password must contain:\")");
    await el11.click();
    await driver.saveScreenshot(path.join(screenshotDir, `TC001_step${step++}_${Date.now()}.png`));

    // Step 11: Continue
    const el12 = await driver.$("accessibility id:   Continue  ");
    await el12.click();
    await driver.pause(2000); // Wait for the next screen to load
    await driver.saveScreenshot(path.join(screenshotDir, `TC001_step${step++}_${Date.now()}.png`));

    // Step 12: Password requirements again
    const el13 = await driver.$("-android uiautomator:new UiSelector().text(\"Your password must contain:\")");
    await el13.click();
    screenshotPath = path.join(screenshotDir, `TC001_step${step++}_${Date.now()}.png`);
    await driver.saveScreenshot(screenshotPath);

  } catch (error) {
    testResult = 'FAIL';
    // Optionally capture screenshot on error
    if (driver) {
      screenshotPath = path.join(screenshotDir, `TC001_step${step++}_${Date.now()}_fail.png`);
      await driver.saveScreenshot(screenshotPath);
    }
    throw error;
  } finally {
    if (driver) await driver.deleteSession();
    await writeResultToExcel(
      'Sign_Up_Individual',
      'TC002',
      'Mobile_SignUp_Individual_NegativeFlow_InvalidPhone',
      testResult,
      screenshotPath,
      'Mobile_User_Onboarding'
    );
  }
}

main().catch(console.log);