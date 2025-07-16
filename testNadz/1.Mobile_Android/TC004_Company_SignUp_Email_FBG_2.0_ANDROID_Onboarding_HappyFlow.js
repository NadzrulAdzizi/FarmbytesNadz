import { remote } from 'webdriverio';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { generateUniqueTestData } from './TestData_SignUp.js';

async function writeResultToExcel(moduleid, tcId, testScenario, result, screenshotPath, sheetName = 'Email_SignUp_KYC_Company') {
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

  const screenshotDir = path.resolve('./screenshots/Mobile_Android_Email_SignUp_KYC_Company');
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

    // Generate unique test data for both SignUp and KYC
    const testData = generateUniqueTestData();
    console.log("🔄 Auto-generated combined test data:", testData);
    
    // ============================================
    // TC001: SIGN UP FLOW
    // ============================================
    console.log("🚀 Starting TC001: Sign Up Flow");

    // Step 1: Launch app
    console.log("Step 1: Launch app");
    await (await driver.$("accessibility id:FarmByte Grow Staging")).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_launch_app.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 2: Navigate to Sign Up
    console.log("Step 2: Navigate to Sign Up");
    await (await driver.$("android=new UiSelector().text(\"Sign Up\")")).click();
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_signup_page.png`);
    await driver.saveScreenshot(screenshotPath);
    
    await (await driver.$("android=new UiSelector().text(\"Sign up with Email\")")).click();
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_signup_with_email.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 3: Fill sign-up form
    console.log("Step 3: Fill sign-up form");
    
    // Fill username - AUTO-GENERATED!
    await (await driver.$("android=new UiSelector().className(\"android.widget.EditText\").instance(0)")).addValue(testData.username);
    await driver.pause(500);
    screenshotPath = path.join(screenshotDir, `step${step++}_username_filled.png`);
    await driver.saveScreenshot(screenshotPath);
    
    // Fill email - AUTO-GENERATED!
    await (await driver.$("android=new UiSelector().className(\"android.widget.EditText\").instance(1)")).addValue(testData.email);
    await driver.pause(500);
    screenshotPath = path.join(screenshotDir, `step${step++}_email_filled.png`);
    await driver.saveScreenshot(screenshotPath);
    
    // Scroll down
    await driver.action('pointer')
      .move({ duration: 0, x: 759, y: 1199 })
      .down({ button: 0 })
      .move({ duration: 1000, x: 748, y: 509 })
      .up({ button: 0 })
      .perform();
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_after_scroll.png`);
    await driver.saveScreenshot(screenshotPath);
    
    // Fill phone number - AUTO-GENERATED!
    await (await driver.$("android=new UiSelector().text(\"Phone Number\")")).addValue(testData.phoneNumber);
    await driver.pause(500);
    screenshotPath = path.join(screenshotDir, `step${step++}_phone_filled.png`);
    await driver.saveScreenshot(screenshotPath);
    
    // Fill password
    await (await driver.$("android=new UiSelector().className(\"android.widget.EditText\").instance(3)")).addValue(testData.password);
    await driver.pause(500);
    screenshotPath = path.join(screenshotDir, `step${step++}_password_filled.png`);
    await driver.saveScreenshot(screenshotPath);
    
    // Fill confirm password
    await (await driver.$("android=new UiSelector().className(\"android.widget.EditText\").instance(4)")).addValue(testData.confirmPassword);
    await driver.pause(500);
    screenshotPath = path.join(screenshotDir, `step${step++}_confirm_password_filled.png`);
    await driver.saveScreenshot(screenshotPath);
    
    // Click to hide keyboard and continue
    await (await driver.$("android=new UiSelector().text(\"Your password must contain:\")")).click();
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_form_completed.png`);
    await driver.saveScreenshot(screenshotPath);
    
    await (await driver.$("android=new UiSelector().text(\"•••••••••\").instance(0)")).click();
    await (await driver.$("android=new UiSelector().text(\"Password Strength:  Strong\")")).click();
    await (await driver.$("android=new UiSelector().text(\"Your password must contain:\")")).click();
    await (await driver.$("accessibility id:   Continue  ")).click();
    await driver.pause(3000);
    screenshotPath = path.join(screenshotDir, `step${step++}_continue_clicked.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 4: Switch to Discord
    console.log("Step 4: Switch to Discord");
    await driver.execute('mobile: pressKey', { keycode: 3 }); // HOME
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_home_screen.png`);
    await driver.saveScreenshot(screenshotPath);
    
    await (await driver.$("accessibility id:Discord")).click();
    await driver.pause(3000);
    screenshotPath = path.join(screenshotDir, `step${step++}_discord_opened.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 5: Extract OTP from Discord
    console.log("Step 5: Extract OTP from Discord");
    const otpMessageEls = await driver.$$('android=new UiSelector().textContains("Your one-time password is")');
    if (otpMessageEls.length === 0) throw new Error("No OTP message found.");
    const latestOtpMessageEl = otpMessageEls[otpMessageEls.length - 1];
    const fullText = await latestOtpMessageEl.getText();
    const otpMatch = fullText.match(/\b\d{4,6}\b/);
    if (!otpMatch) throw new Error("OTP not found in message.");
    const otpDigits = otpMatch[0].split("");
    console.log("Extracted OTP:", otpDigits.join(""));
    screenshotPath = path.join(screenshotDir, `step${step++}_otp_extracted.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 6: Switch back to app
    console.log("Step 6: Switch back to app");
    await driver.execute('mobile: pressKey', { keycode: 3 }); // HOME
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_home_screen_2.png`);
    await driver.saveScreenshot(screenshotPath);
    
    await (await driver.$("accessibility id:FarmByte Grow Staging")).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_app_reopened.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 7: Fill OTP
    console.log("Step 7: Fill OTP");
    let otpFilled = false;
    
    // Try OTP input stick boxes
    try {
      const otpBoxes = await driver.$$('android=new UiSelector().resourceId("otp-input-stick")');
      if (otpBoxes.length > 0) {
        await otpBoxes[0].click();
        await driver.pause(300);
        await driver.keys(otpDigits.join(""));
        await driver.pause(1000);
        screenshotPath = path.join(screenshotDir, `step${step++}_otp_filled.png`);
        await driver.saveScreenshot(screenshotPath);
        otpFilled = true;
      }
    } catch (e) {
      // Try EditText fields
      const allEditTexts = await driver.$$('android.widget.EditText');
      if (allEditTexts.length > 0) {
        await allEditTexts[0].setValue(otpDigits.join(""));
        await driver.pause(1000);
        screenshotPath = path.join(screenshotDir, `step${step++}_otp_filled_edittext.png`);
        await driver.saveScreenshot(screenshotPath);
        otpFilled = true;
      }
    }

    if (!otpFilled) {
      await driver.keys(otpDigits.join(""));
      await driver.pause(1000);
      screenshotPath = path.join(screenshotDir, `step${step++}_otp_filled_keys.png`);
      await driver.saveScreenshot(screenshotPath);
    }

    // Step 8: Click Verify
    console.log("Step 8: Click Verify");
    await (await driver.$("android=new UiSelector().text(\"   Verify  \")")).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_verify_clicked.png`);
    await driver.saveScreenshot(screenshotPath);

    console.log("✅ TC001 SignUp completed successfully!");

    // ============================================
    // TC002: KYC FLOW (COMPANY)
    // ============================================
    console.log("🚀 Starting TC002: KYC Flow (Company)");

    // Step 9: Proceed to create account
    console.log("Step 9: Proceed to create account");
    await (await driver.$('~   Proceed to create account  ')).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_proceed_to_create_account.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 10: Select Company (FIXED from Java to WebdriverIO)
    console.log("Step 10: Select Company");
    await (await driver.$('~Company')).click();
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_select_company.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 11: Click Next
    console.log("Step 11: Click Next");
    await (await driver.$('android=new UiSelector().text("   Next  ")')).click();
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_click_next.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 12: Fill company name (AUTO-GENERATED)
    console.log("Step 12: Fill company name");
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(0)')).click();
    await driver.pause(500);
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(0)')).setValue(testData.companyName);
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_company_name_filled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 13: Fill SSM number (AUTO-GENERATED)
    console.log("Step 13: Fill SSM number");
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(1)')).click();
    await driver.pause(500);
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(1)')).setValue(testData.ssmNumber);
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_ssm_number_filled.png`);
    await driver.saveScreenshot(screenshotPath);

  // Step 14: Scroll horizontally to continue
    console.log("Step 14: Scroll horizontally to continue");
    await driver.action('pointer')
      .move({ duration: 0, x: 15, y: 1098 })
      .down({ button: 0 })
      .move({ duration: 1000, x: 876, y: 1105 })
      .up({ button: 0 })
      .perform();
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_horizontal_swipe.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 15: Accept terms and conditions
    console.log("Step 15: Accept terms and conditions");
    await (await driver.$('android=new UiSelector().className("android.view.ViewGroup").instance(20)')).click();
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_terms_accepted.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 16: Click Sign Up
    console.log("Step 16: Click Sign Up");
    await (await driver.$('android=new UiSelector().text("   Sign Up  ")')).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_company_signup_clicked.png`);
    await driver.saveScreenshot(screenshotPath);

    
    // Step 17: Proceed to KYC verification
    console.log("Step 17: Proceed to KYC verification");
    await (await driver.$('android=new UiSelector().text("   Proceed to KYC verification  ")')).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_proceed_to_kyc.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 18: Start KYC
    console.log("Step 18: Start KYC");
    await (await driver.$('android=new UiSelector().text("   Start  ")')).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_start_kyc.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 19: Upload front ID document
    console.log("Step 19: Upload front ID document");
    await (await driver.$('android=new UiSelector().text("Upload").instance(0)')).click();
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_upload_front_id.png`);
    await driver.saveScreenshot(screenshotPath);

    await (await driver.$('android=new UiSelector().text("Camera")')).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_camera_opened_front.png`);
    await driver.saveScreenshot(screenshotPath);

    await (await driver.$('~Take photo. Button. Double-tap to take a photo. Double-tap and hold to take burst photos')).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_photo_taken_front.png`);
    await driver.saveScreenshot(screenshotPath);

    await (await driver.$('id=com.android.camera:id/done_button')).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_photo_confirmed_front.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 20: Proceed to next step
    console.log("Step 20: Proceed to next step");
    await (await driver.$('android=new UiSelector().text("   Next  ")')).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_kyc_documents_next.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 21: Fill farm name (AUTO-GENERATED)
    console.log("Step 21: Fill farm name");
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(0)')).click();
    await driver.pause(500);
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(0)')).setValue(testData.farmName);
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_farm_name_filled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 22: Select location
    console.log("Step 22: Select location");
    await (await driver.$('android=new UiSelector().className(\"android.view.View\").instance(1)')).click();
    await driver.pause(2000);
    await (await driver.$('android=new UiSelector().className(\"android.view.View\").instance(1)')).click();
    screenshotPath = path.join(screenshotDir, `step${step++}_location_picker_opened.png`);
    await driver.saveScreenshot(screenshotPath);

    await (await driver.$('~My Location')).click();
    await driver.pause(5000);
    screenshotPath = path.join(screenshotDir, `step${step++}_my_location_clicked.png`);
    await driver.saveScreenshot(screenshotPath);

    await (await driver.$('android=new UiSelector().className(\"android.view.ViewGroup\").instance(18)')).click();
    await driver.pause(5000);
    screenshotPath = path.join(screenshotDir, `step${step++}_location_selected.png`);
    await driver.saveScreenshot(screenshotPath);

    await (await driver.$('android=new UiSelector().text("   Choose This Location  ")')).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_location_chosen.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 23: Set farm size (AUTO-GENERATED)
    console.log("Step 23: Set farm size");
    await (await driver.$('android=new UiSelector().text("0")')).click();
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_farm_size_clicked.png`);
    await driver.saveScreenshot(screenshotPath);

    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(3)')).click();
    await driver.pause(500);
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(3)')).setValue(testData.farmSize);
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_farm_size_filled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 24: Set as default pickup address and save
    console.log("Step 24: Set as default pickup address and save");
    await (await driver.$('android=new UiSelector().text("Set as Default Pickup Address")')).click();
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_default_pickup_set.png`);
    await driver.saveScreenshot(screenshotPath);

    await (await driver.$('android=new UiSelector().text("   Save  ")')).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_farm_info_saved.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 25: Proceed to bank details
    console.log("Step 25: Proceed to bank details");
    await (await driver.$('android=new UiSelector().text("   Next  ")')).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_proceed_to_bank_details.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 26: Select bank
    console.log("Step 26: Select bank");
    await (await driver.$('android=new UiSelector().text("Name of Bank")')).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_bank_selector_opened.png`);
    await driver.saveScreenshot(screenshotPath);

    await (await driver.$(`android=new UiSelector().text("${testData.selectedBank}")`)).click();
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_bank_selected.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 27: Fill bank account name (AUTO-GENERATED)
    console.log("Step 27: Fill bank account name");
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(0)')).click();
    await driver.pause(500);
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(0)')).setValue(testData.bankAccountName);
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_bank_account_name_filled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 28: Fill bank account number (AUTO-GENERATED)
    console.log("Step 28: Fill bank account number");
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(1)')).click();
    await driver.pause(500);
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(1)')).setValue(testData.bankAccountNumber);
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_bank_account_number_filled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 29: Accept terms and submit
    console.log("Step 29: Accept terms and submit");
    await (await driver.$('android=new UiSelector().className("android.view.ViewGroup").instance(11)')).click();
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_terms_accepted_bank.png`);
    await driver.saveScreenshot(screenshotPath);

    await (await driver.$('android=new UiSelector().text("   Submit  ")')).click();
    await driver.pause(3000);
    screenshotPath = path.join(screenshotDir, `step${step++}_kyc_submitted.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 30: Discover Farmbyte
    console.log("Step 30: Discover Farmbyte");
    await (await driver.$('android=new UiSelector().text("   Discover Farmbyte  ")')).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_discover_farmbyte.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 31: Allow permissions
    console.log("Step 31: Allow permissions");
    await (await driver.$('android=new UiSelector().text("   Allow  ")')).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_permissions_allowed.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 32: Final navigation
    console.log("Step 32: Final navigation");
    await (await driver.$('android=new UiSelector().text(\"\")')).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_final_navigation.png`);
    await driver.saveScreenshot(screenshotPath);
    
    // Step 33: Final confirmation
    console.log("Step 33: Final confirmation");
    await (await driver.$('android=new UiSelector().className("android.view.View").instance(15)')).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_user_profile.png`);
    await driver.saveScreenshot(screenshotPath);
    
    console.log("✅ Company Email SignUp + KYC Test completed successfully!");
    
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
      'Android_SignUp_KYC_Email_Company',
      'TC004',
      'Android_SignUp_Company_Email_KYC_HappyFlow',
      testResult,
      screenshotPath, // This will now always contain a valid screenshot path
      'Email_SignUp_KYC_Company'
    );
    
    console.log("🎯 Test execution completed!");
  }
}

main().catch(err => {
  console.error("❌ Main function error:", err);
  process.exit(1);
});