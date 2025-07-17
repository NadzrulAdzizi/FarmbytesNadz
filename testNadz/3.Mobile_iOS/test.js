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

// Helper function to click element with retries
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

    // Step 1: Launch FarmByte App (corrected selector)
    console.log("Step 1: Launch FarmByte App");
    await clickWithRetries(driver, '~FarmByte App Staging', 'FarmByte App');
    await driver.pause(3000);
    screenshotPath = path.join(screenshotDir, `step${step++}_app_launched.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 2: Click Sign Up
    console.log("Step 2: Click Sign Up");
    await clickWithRetries(driver, '~Sign Up', 'Sign Up button');
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_sign_up_clicked.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 3: Click Sign up with Email
    console.log("Step 3: Click Sign up with Email");
    await clickWithRetries(driver, '~Sign up with Email', 'Sign up with Email button');
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_sign_up_with_email_clicked.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 4: Fill Full Name (corrected selector)
    console.log("Step 4: Fill Full Name");
    await fillTextWithRetries(driver, '-ios class chain:**/XCUIElementTypeOther[`name == "Full name (as per NRIC)"`]/XCUIElementTypeOther/XCUIElementTypeOther[1]/XCUIElementTypeOther[2]/XCUIElementTypeTextField', testData.fullName, 'Full Name');
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_full_name_filled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 5: Fill Email (corrected selector)
    console.log("Step 5: Fill Email");
    await fillTextWithRetries(driver, '-ios class chain:**/XCUIElementTypeOther[`name == "Email"`]/XCUIElementTypeOther/XCUIElementTypeOther[1]/XCUIElementTypeOther[2]/XCUIElementTypeTextField', testData.email, 'Email');
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_email_filled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 6: Fill Phone Number (corrected selector)
    console.log("Step 6: Fill Phone Number");
    await fillTextWithRetries(driver, '-ios class chain:**/XCUIElementTypeTextField[`value == "Phone Number"`]', testData.phoneNumber, 'Phone Number');
    await clickWithRetries(driver, '~Done', 'Done button');
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_phone_number_filled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 7: Fill Password (corrected selector)
    console.log("Step 7: Fill Password");
    await fillTextWithRetries(driver, '-ios class chain:**/XCUIElementTypeOther[`name == \"\"`][1]/XCUIElementTypeOther[1]/XCUIElementTypeOther[2]', testData.password, 'Password');
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_password_filled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 8: Scroll down to see confirm password field
    console.log("Step 8: Scroll down to see confirm password field");
    await swipeGesture(driver, 226, 528, 219, 139);
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_scrolled_down.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 9: Fill Confirm Password (corrected selector)
    console.log("Step 9: Fill Confirm Password");
    await fillTextWithRetries(driver, '(//XCUIElementTypeOther[@name=\"\"])[3]/XCUIElementTypeOther[1]/XCUIElementTypeOther[2]', testData.confirmPassword, 'Confirm Password');
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_confirm_password_filled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 10: Click Password Strength indicator (corrected selector)
    console.log("Step 10: Click Password Strength indicator");
    await clickWithRetries(driver, '-ios class chain:**/XCUIElementTypeStaticText[`name == "Password Strength:  Strong"`]', 'Password Strength indicator');
    await driver.pause(500);
    screenshotPath = path.join(screenshotDir, `step${step++}_password_strength_clicked.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 11: Click Continue (corrected selector)
    console.log("Step 11: Click Continue");
    await clickWithRetries(driver, '-ios class chain:**/XCUIElementTypeOther[`name == "   Continue  "`][2]', 'Continue button');
    await driver.pause(3000);
    screenshotPath = path.join(screenshotDir, `step${step++}_continue_clicked.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 12: Go to home (Discord for OTP)
    console.log("Step 12: Go to home for Discord OTP");
    await driver.executeScript('mobile:pressButton', { name: 'home' });
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_home_pressed.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 13: Open Discord (corrected selector)
    console.log("Step 13: Open Discord");
    await clickWithRetries(driver, '~Discord', 'Discord App');
    await driver.pause(3000);
    screenshotPath = path.join(screenshotDir, `step${step++}_discord_opened.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 14: Scroll to load more messages
    console.log("Step 14: Scroll to load more messages");
    await swipeGesture(driver, 245, 655, 241, 393);
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_discord_scrolled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 15: Load more messages (corrected selector)
    console.log("Step 15: Load more messages");
    await clickWithRetries(driver, '-ios class chain:**/XCUIElementTypeButton[`name == "Load more messages"`]', 'Load more messages');
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_load_more_messages.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 16: Click on OTP message (copy OTP)
    console.log("Step 16: Click on OTP message to copy");
    await clickWithRetries(driver, `~[FA][Staging] Your one-time password is ${testData.otpCode}`, 'OTP message');
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_otp_copied.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 17: Return to home
    console.log("Step 17: Return to home");
    await driver.executeScript('mobile:pressButton', { name: 'home' });
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_home_pressed_again.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 18: Return to FarmByte App
    console.log("Step 18: Return to FarmByte App");
    await clickWithRetries(driver, '~FarmByte App Staging', 'FarmByte App');
    await driver.pause(3000);
    screenshotPath = path.join(screenshotDir, `step${step++}_returned_to_app.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 19: Click Verify (OTP should be auto-filled)
    console.log("Step 19: Click Verify");
    await clickWithRetries(driver, '~   Verify  ', 'Verify button');
    await driver.pause(3000);
    screenshotPath = path.join(screenshotDir, `step${step++}_verify_clicked.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 20: Proceed to create account
    console.log("Step 20: Proceed to create account");
    await clickWithRetries(driver, '~   Proceed to create account  ', 'Proceed to create account');
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_proceed_to_create_account.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 21: Select Individual (corrected selector)
    console.log("Step 21: Select Individual");
    await clickWithRetries(driver, '-ios class chain:**/XCUIElementTypeOther[`name == "Individual"`][2]', 'Individual option');
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_individual_selected.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 22: Click Next (corrected selector)
    console.log("Step 22: Click Next");
    await clickWithRetries(driver, '-ios class chain:**/XCUIElementTypeOther[`name == "   Next  "`][2]', 'Next button');
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_next_clicked.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 23: Fill NRIC (corrected selector)
    console.log("Step 23: Fill NRIC");
    await fillTextWithRetries(driver, '-ios class chain:**/XCUIElementTypeOther[`name == "NRIC"`]/XCUIElementTypeOther/XCUIElementTypeOther[1]/XCUIElementTypeOther[2]/XCUIElementTypeTextField', testData.nric, 'NRIC');
    await clickWithRetries(driver, '~Done', 'Done button');
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_nric_filled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 24: Accept Terms and Conditions (corrected selector)
    console.log("Step 24: Accept Terms and Conditions");
    await clickWithRetries(driver, '-ios class chain:**/XCUIElementTypeOther[`name == "By signing up, you agree to FarmByte\'s Terms of Use  and  Privacy Policy. ."`]/XCUIElementTypeOther[1]', 'Terms and Conditions');
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_terms_accepted.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 25: Click Sign Up
    console.log("Step 25: Click Sign Up");
    await clickWithRetries(driver, '~   Sign Up  ', 'Sign Up button');
    await driver.pause(3000);
    screenshotPath = path.join(screenshotDir, `step${step++}_sign_up_final_clicked.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 26: Proceed to KYC verification
    console.log("Step 26: Proceed to KYC verification");
    await clickWithRetries(driver, '~   Proceed to KYC verification  ', 'Proceed to KYC verification');
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_kyc_verification_clicked.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 27: Start KYC
    console.log("Step 27: Start KYC");
    await clickWithRetries(driver, '~   Start  ', 'Start KYC');
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_kyc_started.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 28: Upload first document
    console.log("Step 28: Upload first document");
    await clickWithRetries(driver, '**/XCUIElementTypeOther[`name == "Upload"`][1]', 'Upload button 1');
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_upload_1_clicked.png`);
    await driver.saveScreenshot(screenshotPath);

    await clickWithRetries(driver, '~Camera', 'Camera option');
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_camera_opened_1.png`);
    await driver.saveScreenshot(screenshotPath);

    await clickWithRetries(driver, '~PhotoCapture', 'Photo Capture');
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_photo_captured_1.png`);
    await driver.saveScreenshot(screenshotPath);

    await clickWithRetries(driver, '~Use Photo', 'Use Photo');
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_photo_used_1.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 29: Upload second document
    console.log("Step 29: Upload second document");
    await clickWithRetries(driver, '**/XCUIElementTypeOther[`name == "Upload"`][2]', 'Upload button 2');
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_upload_2_clicked.png`);
    await driver.saveScreenshot(screenshotPath);

    await clickWithRetries(driver, '~Camera', 'Camera option');
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_camera_opened_2.png`);
    await driver.saveScreenshot(screenshotPath);

    await clickWithRetries(driver, '~PhotoCapture', 'Photo Capture');
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_photo_captured_2.png`);
    await driver.saveScreenshot(screenshotPath);

    await clickWithRetries(driver, '~Use Photo', 'Use Photo');
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_photo_used_2.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 30: Click Next after documents
    console.log("Step 30: Click Next after documents");
    await clickWithRetries(driver, '**/XCUIElementTypeOther[`name == "   Next  "`][2]', 'Next button');
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_documents_next_clicked.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 31: Fill Farm Name
    console.log("Step 31: Fill Farm Name");
    await fillTextWithRetries(driver, '**/XCUIElementTypeOther[`name == "Farm Name"`]/XCUIElementTypeOther/XCUIElementTypeOther[1]/XCUIElementTypeOther[2]/XCUIElementTypeTextField', testData.farmName, 'Farm Name');
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_farm_name_filled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 32: Click on address field
    console.log("Step 32: Click on address field");
    await clickWithRetries(driver, '**/XCUIElementTypeOther[`name == "Unit No., Building No., Street name"`]/XCUIElementTypeOther/XCUIElementTypeOther[2]/XCUIElementTypeOther', 'Address field');
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_address_field_clicked.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 33: Click address field again
    console.log("Step 33: Click address field again");
    await clickWithRetries(driver, '**/XCUIElementTypeOther[`name == "Unit No., Building No., Street name"`]/XCUIElementTypeOther/XCUIElementTypeOther[2]/XCUIElementTypeOther', 'Address field again');
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_address_field_clicked_again.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 34: Use My Location
    console.log("Step 34: Use My Location");
    await clickWithRetries(driver, '~my_location', 'My Location');
    await driver.pause(3000);
    screenshotPath = path.join(screenshotDir, `step${step++}_my_location_clicked.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 35: Choose location from list
    console.log("Step 35: Choose location from list");
    await clickWithRetries(driver, '**/XCUIElementTypeOther[`name == "1565, Jalan Bil 52, Port Dickson, Negeri Sembilan 1565, Jalan Bil 52, Port Dickson, Negeri Sembilan Vertical scroll bar, 1 page Horizontal scroll bar, 1 page"`][2]/XCUIElementTypeScrollView', 'Location from list');
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_location_selected.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 36: Choose This Location
    console.log("Step 36: Choose This Location");
    await clickWithRetries(driver, '**/XCUIElementTypeOther[`name == "   Choose This Location  "`][2]', 'Choose This Location');
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_location_chosen.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 37: Clear postal code field
    console.log("Step 37: Clear postal code field");
    await clickWithRetries(driver, '**/XCUIElementTypeTextField[`value == "71010"`]', 'Postal code field to clear');
    await driver.pause(500);
    screenshotPath = path.join(screenshotDir, `step${step++}_postal_code_cleared.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 38: Fill postal code
    console.log("Step 38: Fill postal code");
    await fillTextWithRetries(driver, '**/XCUIElementTypeOther[`name == "Postal Code"`]/XCUIElementTypeOther/XCUIElementTypeOther[1]/XCUIElementTypeOther[2]/XCUIElementTypeTextField', testData.postalCode, 'Postal Code');
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_postal_code_filled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 39: Fill farm size
    console.log("Step 39: Fill farm size");
    await fillTextWithRetries(driver, '**/XCUIElementTypeTextField[`value == "0"`]', testData.farmSize, 'Farm Size');
    await clickWithRetries(driver, '~Done', 'Done button');
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_farm_size_filled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 40: Save farm information
    console.log("Step 40: Save farm information");
    await clickWithRetries(driver, '~   Save  ', 'Save button');
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_farm_info_saved.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 41: Click Next to banking
    console.log("Step 41: Click Next to banking");
    await clickWithRetries(driver, '~   Next  ', 'Next button');
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_proceed_to_banking.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 42: Select Bank
    console.log("Step 42: Select Bank");
    await clickWithRetries(driver, '~Name of Bank ', 'Bank selection');
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_bank_dropdown_opened.png`);
    await driver.saveScreenshot(screenshotPath);

    await clickWithRetries(driver, `~Name of Bank ${testData.bankName} `, 'Bank selection');
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_bank_selected.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 43: Fill Bank Account Name
    console.log("Step 43: Fill Bank Account Name");
    await fillTextWithRetries(driver, '**/XCUIElementTypeOther[`name == "Bank Account Name"`]/XCUIElementTypeOther/XCUIElementTypeOther[1]/XCUIElementTypeOther[2]/XCUIElementTypeTextField', testData.bankAccountName, 'Bank Account Name');
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_bank_account_name_filled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 44: Fill Bank Account Number
    console.log("Step 44: Fill Bank Account Number");
    await fillTextWithRetries(driver, '**/XCUIElementTypeOther[`name == "Bank Account No"`]/XCUIElementTypeOther/XCUIElementTypeOther[1]/XCUIElementTypeOther[2]/XCUIElementTypeTextField', testData.bankAccountNo, 'Bank Account Number');
    await clickWithRetries(driver, '~Done', 'Done button');
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_bank_account_number_filled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 45: Submit banking information
    console.log("Step 45: Submit banking information");
    await clickWithRetries(driver, '**/XCUIElementTypeOther[`name == "   Submit  "`][2]', 'Submit button');
    await driver.pause(3000);
    screenshotPath = path.join(screenshotDir, `step${step++}_banking_submitted.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 46: Discover Farmbyte
    console.log("Step 46: Discover Farmbyte");
    await clickWithRetries(driver, '~   Discover Farmbyte  ', 'Discover Farmbyte');
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_discover_farmbyte.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 47: Allow notifications
    console.log("Step 47: Allow notifications");
    await clickWithRetries(driver, '~   Allow  ', 'Allow notifications');
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_notifications_allowed.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 48: Navigate to dashboard
    console.log("Step 48: Navigate to dashboard");
    await clickWithRetries(driver, '**/XCUIElementTypeOther[`name == ""`][2]', 'Dashboard navigation');
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_dashboard_navigated.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 49: Go to Profile
    console.log("Step 49: Go to Profile");
    await clickWithRetries(driver, '~Profile, tab, 4 of 4', 'Profile tab');
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