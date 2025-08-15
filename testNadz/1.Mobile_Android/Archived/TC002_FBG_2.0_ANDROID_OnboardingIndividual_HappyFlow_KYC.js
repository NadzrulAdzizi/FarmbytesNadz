import { remote } from 'webdriverio';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { generateUniqueKYCTestData } from './TestData_Individual_KYC.js';

async function writeResultToExcel(moduleid, tcId, testScenario, result, screenshotPath, sheetName = 'Mobile_KYC_Onboarding') {
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

  const screenshotDir = path.resolve('./screenshots/Mobile_Android_KYC');
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

    // Use the same test data from SignUp test
    const testData = generateUniqueKYCTestData();
    console.log("🔄 Using KYC test data (follows SignUp):", testData);

    /*
    // Step 1: Proceed to create account
    console.log("Step 1: Proceed to create account");
    await (await driver.$('~   Proceed to create account  ')).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_proceed_to_create_account.png`));

    // Step 2: Select Individual
    console.log("Step 2: Select Individual");
    await (await driver.$('android=new UiSelector().text("Individual")')).click();
    await driver.pause(1000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_select_individual.png`));

    // Step 3: Click Next
    console.log("Step 3: Click Next");
    await (await driver.$('android=new UiSelector().text("   Next  ")')).click();
    await driver.pause(1000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_click_next.png`));

    // Step 4: Fill NRIC - AUTO-GENERATED (same as SignUp)!
    console.log("Step 4: Fill NRIC");
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(1)')).click();
    await driver.pause(500);
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(1)')).setValue(testData.nric);
    await driver.pause(1000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_nric_filled.png`));

    // Step 5: Click checkbox and Sign Up
    console.log("Step 5: Click checkbox and Sign Up");
    await (await driver.$('android=new UiSelector().className("android.view.ViewGroup").instance(11)')).click();
    await driver.pause(500);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_checkbox_clicked.png`));

    await (await driver.$('android=new UiSelector().className("android.view.ViewGroup").instance(18)')).click();
    await driver.pause(500);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_terms_accepted.png`));
    
    await (await driver.$('~   Sign Up  ')).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_signup_clicked.png`));

    // Step 6: Proceed to KYC verification
    console.log("Step 6: Proceed to KYC verification");
    await (await driver.$('android=new UiSelector().text("   Proceed to KYC verification  ")')).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_proceed_to_kyc.png`));
    
    // Step 7: Start KYC
    console.log("Step 7: Start KYC");
    await (await driver.$('android=new UiSelector().text("   Start  ")')).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_start_kyc.png`));

    // Step 8: Upload first document (Front ID)
    console.log("Step 8: Upload first document (Front ID)");
    await (await driver.$('android=new UiSelector().text("Upload").instance(0)')).click();
    await driver.pause(1000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_upload_front_id.png`));

    await (await driver.$('android=new UiSelector().text("Camera")')).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_camera_opened_front.png`));

    await (await driver.$('~Take photo. Button. Double-tap to take a photo. Double-tap and hold to take burst photos')).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_photo_taken_front.png`));

    await (await driver.$('id=com.android.camera:id/done_button')).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_photo_confirmed_front.png`));

    // Step 9: Upload second document (Back ID)
    console.log("Step 9: Upload second document (Back ID)");
    await (await driver.$('android=new UiSelector().text("Upload").instance(1)')).click();
    await driver.pause(1000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_upload_back_id.png`));

    await (await driver.$('android=new UiSelector().text("Camera")')).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_camera_opened_back.png`));

    await (await driver.$('~Take photo. Button. Double-tap to take a photo. Double-tap and hold to take burst photos')).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_photo_taken_back.png`));

    await (await driver.$('id=com.android.camera:id/done_button')).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_photo_confirmed_back.png`));

    // Step 10: Proceed to next step
    console.log("Step 10: Proceed to next step");
    await (await driver.$('android=new UiSelector().text("   Next  ")')).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_kyc_documents_next.png`));

    // Step 11: Fill farm name - AUTO-GENERATED (same as SignUp)!
    console.log("Step 11: Fill farm name");
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(0)')).click();
    await driver.pause(500);
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(0)')).setValue(testData.farmName);
    await driver.pause(1000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_farm_name_filled.png`));

    // Step 12: Select location
    console.log("Step 12: Select location");
    await (await driver.$('android=new UiSelector().className("android.view.ViewGroup").instance(20)')).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_location_picker_opened.png`));

    await (await driver.$('android=new UiSelector().className("android.view.ViewGroup").instance(20)')).click();
    await driver.pause(5000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_location_picker_clicked.png`));

    await (await driver.$('~My Location')).click();
    await driver.pause(5000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_my_location_clicked.png`));

    await (await driver.$('android=new UiSelector().text("   Choose This Location  ")')).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_location_chosen.png`));

    // Step 13: Set farm size
    console.log("Step 13: Set farm size");
    await (await driver.$('android=new UiSelector().text("0")')).click();
    await driver.pause(1000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_farm_size_clicked.png`));

    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(3)')).click();
    await driver.pause(500);
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(3)')).setValue(testData.farmSize);
    await driver.pause(1000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_farm_size_filled.png`));

    // Step 14: Set as default pickup address and save
    console.log("Step 14: Set as default pickup address and save");
    await (await driver.$('android=new UiSelector().text("Set as Default Pickup Address")')).click();
    await driver.pause(1000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_default_pickup_set.png`));

    await (await driver.$('android=new UiSelector().text("   Save  ")')).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_farm_info_saved.png`));
    
    // Step 15: Proceed to bank details
    console.log("Step 15: Proceed to bank details");
    await (await driver.$('android=new UiSelector().text("   Next  ")')).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_proceed_to_bank_details.png`));

    // Step 16: Select bank
    console.log("Step 16: Select bank");
    await driver.pause(5000);
    await (await driver.$('android=new UiSelector().text(\"Name of Bank\")')).click();
    await driver.pause(5000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_bank_selector_opened.png`));

    await (await driver.$(`android=new UiSelector().text("${testData.selectedBank}")`)).click();
    await driver.pause(1000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_bank_selected.png`));

    // Step 17: Fill bank account name - AUTO-GENERATED (same as SignUp)!
    console.log("Step 17: Fill bank account name");
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(0)')).click();
    await driver.pause(500);
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(0)')).setValue(testData.bankAccountName);
    await driver.pause(1000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_bank_account_name_filled.png`));

    // Step 18: Fill bank account number - AUTO-GENERATED (same as SignUp)!
    console.log("Step 18: Fill bank account number");
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(1)')).click();
    await driver.pause(500);
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(1)')).setValue(testData.bankAccountNumber);
    await driver.pause(1000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_bank_account_number_filled.png`));

    // Step 19: Accept terms and submit
    console.log("Step 19: Accept terms and submit");
    await (await driver.$('android=new UiSelector().className("android.view.ViewGroup").instance(11)')).click();
    await driver.pause(1000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_terms_accepted_bank.png`));

    await (await driver.$('android=new UiSelector().text("   Submit  ")')).click();
    await driver.pause(3000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_kyc_submitted.png`));

    // Step 20: Discover Farmbyte
    console.log("Step 20: Discover Farmbyte");
    await (await driver.$('android=new UiSelector().text("   Discover Farmbyte  ")')).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_discover_farmbyte.png`));

    // Step 21: Allow permissions
    console.log("Step 21: Allow permissions");
    await (await driver.$('android=new UiSelector().text("   Allow  ")')).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_permissions_allowed.png`));

    // Step 22: Final navigation
    console.log("Step 22: Final navigation");
    //await (await driver.$('~')).click();
    await (await driver.$('android=new UiSelector().text(\"\")')).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_final_success.png`));
*/
    // Final confirmation
    console.log("Step 23: Final confirmation");
    await (await driver.$('android=new UiSelector().className(\"android.view.View\").instance(15)')).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_UserProfile.png`));


    console.log("✅ KYC Test completed successfully!");

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
      'KYC_Individual',
      'TC002',
      'Mobile_KYC_Individual_HappyFlow',
      testResult,
      screenshotPath,
      'Mobile_KYC_Onboarding'
    );
  }
}

main();