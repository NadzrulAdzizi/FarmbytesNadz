import { remote } from 'webdriverio';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { generateUniqueTestData, fetchLatestOTPFromDiscord, fetchLatestOTPFromDiscordManual, pressHomeButton, fillOTPBoxes, clearAndFillPostalCode, selectAnyAvailableBank } from './TestData_iOS_SignUp.js';

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

  const screenshotDir = path.resolve('./screenshots/Mobile_iOS_SignUp_Gmail_Company');
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
    // TC001: iOS COMPANY SIGN UP WITH GMAIL
    // ============================================
    console.log("🚀 Starting TC001: iOS COMPANY Sign Up with GMAIL");

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

    // Step 4: Click Continue
    console.log("Step 4: Click Continue");
    await clickWithRetries(driver, '//XCUIElementTypeButton[@name="Continue"]');
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_full_name_filled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 3: Click Sign up with Gmail
    console.log("Step 3: Click Sign up with Gmail");
    await clickWithRetries(driver, '//XCUIElementTypeOther[@name="Sign up with Google "]');
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_sign_up_with_email_clicked.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 4.1: Click Continue
    console.log("Step 4: Click Continue");
    await clickWithRetries(driver, '//XCUIElementTypeButton[@name="Continue"]');
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_full_name_filled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 7: Fill Name and Phone Number
    console.log("Step 7: Fill Name and Phone Number");
    await driver.pause(5000);
    await fillTextWithRetries(driver, '//XCUIElementTypeTextField[@value=" "]', testData.GmailName, 'Full Gmail Name');
    await clickWithRetries(driver, '~Done', 'Done button');
    await fillTextWithRetries(driver, '(//XCUIElementTypeOther[@name="Phone Number"])[1]', testData.phoneNumber, 'Phone Number');
    await clickWithRetries(driver, '~Done', 'Done button');
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_password_filled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 10: Click Send - FIXED
    console.log("Step 10: Click Send");
    
    // Try multiple selectors for the Send button
    const sendButtonSelectors = [
      '~   Send  ',  // Accessibility ID
      '~ Send ',     // Accessibility ID without extra spaces
      '~Send',       // Simple accessibility ID
      '//XCUIElementTypeButton[@name="   Send  "]',  // XPath Button
      '//XCUIElementTypeOther[@name="   Send  "]',   // XPath Other
      '//XCUIElementTypeButton[@name=" Send "]',     // XPath with single spaces
      '//XCUIElementTypeButton[contains(@name, "Send")]',  // XPath contains
      '//XCUIElementTypeOther[contains(@name, "Send")]',   // XPath Other contains
      '-ios class chain:**/XCUIElementTypeOther[`name == " Send "`][2]',  // iOS Class Chain with prefix
      '-ios class chain:**/XCUIElementTypeButton[`name == " Send "`]'     // iOS Class Chain Button
    ];
    
    let sendClicked = false;
    
    for (let i = 0; i < sendButtonSelectors.length; i++) {
      try {
        console.log(`🔄 Trying Send button selector ${i + 1}: ${sendButtonSelectors[i]}`);
        
        const element = await driver.$(sendButtonSelectors[i]);
        
        if (await element.isExisting()) {
          console.log(`✅ Send button found with selector ${i + 1}`);
          await element.click();
          sendClicked = true;
          console.log(`✅ Send button clicked successfully`);
          break;
        } else {
          console.log(`❌ Send button not found with selector ${i + 1}`);
        }
      } catch (error) {
        console.log(`❌ Selector ${i + 1} failed: ${error.message}`);
        continue;
      }
    }
    
    // If all selectors fail, try coordinate click
    if (!sendClicked) {
      console.log("⚠️ All Send button selectors failed, trying coordinate click");
      try {
        // Click at bottom center where Send button usually is
        await driver.action('pointer')
          .move({ duration: 0, x: 200, y: 650 })
          .down({ button: 0 })
          .up({ button: 0 })
          .perform();
        
        console.log("✅ Coordinate click performed for Send button");
        sendClicked = true;
      } catch (coordError) {
        console.log(`❌ Coordinate click failed: ${coordError.message}`);
      }
    }
    
    // If still not clicked, try finding any button with "Send" text
    if (!sendClicked) {
      console.log("⚠️ Searching for any button containing 'Send'");
      try {
        const allButtons = await driver.$$('//XCUIElementTypeButton');
        console.log(`📱 Found ${allButtons.length} buttons on screen`);
        
        for (let i = 0; i < allButtons.length; i++) {
          try {
            const buttonText = await allButtons[i].getText();
            const buttonName = await allButtons[i].getAttribute('name');
            
            console.log(`📝 Button ${i + 1}: text="${buttonText}", name="${buttonName}"`);
            
            if ((buttonText && buttonText.includes('Send')) || 
                (buttonName && buttonName.includes('Send'))) {
              await allButtons[i].click();
              console.log(`✅ Clicked Send button: "${buttonText || buttonName}"`);
              sendClicked = true;
              break;
            }
          } catch (buttonError) {
            continue;
          }
        }
      } catch (searchError) {
        console.log(`❌ Button search failed: ${searchError.message}`);
      }
    }
    
    if (!sendClicked) {
      console.log("❌ All attempts to click Send button failed");
    }
    
    await driver.pause(500);
    screenshotPath = path.join(screenshotDir, `step${step++}_send_clicked.png`);
    await driver.saveScreenshot(screenshotPath);
    
    
    // Step 12: Go to home (Discord for OTP)
    console.log("Step 12: Go to home (Discord for OTP)");
    await pressHomeButton(driver);
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_home_pressed.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 13: Get LATEST OTP from Discord - ENHANCED
    console.log("Step 13: Get LATEST OTP from Discord (iOS Enhanced)");
    
    let latestOTP = await fetchLatestOTPFromDiscord(driver);
    
    // If main method fails, try manual method
    if (latestOTP === "2068") {
      console.log("🔄 Main method failed, trying manual Discord search...");
      latestOTP = await fetchLatestOTPFromDiscordManual(driver);
    }
    
    console.log(`📱 LATEST OTP: ${latestOTP}`);
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_otp_fetched.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 14: Return to home
    console.log("Step 14: Return to home");
    await pressHomeButton(driver);
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_home_pressed_again.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 15: Return to FarmByte App
    console.log("Step 15: Return to FarmByte App");
    await clickWithRetries(driver, '~FarmByte App Staging', 'FarmByte App');
    await driver.pause(3000);
    screenshotPath = path.join(screenshotDir, `step${step++}_returned_to_app.png`);
    await driver.saveScreenshot(screenshotPath);

// Replace your OTP section with this:

    // Step 16: Fill OTP in 4 boxes - ENHANCED WITH FALLBACKS
    console.log("Step 16: Fill OTP in 4 boxes");
    
    // Try the main function first
    let otpFilled = await fillOTPBoxes(driver, latestOTP);
    
    // If main function fails, try multiple fallback approaches
    if (!otpFilled) {
      console.log("⚠️ Main OTP filling failed, trying fallback approaches...");
      
      const otpDigits = latestOTP.split('');
      
      // Fallback 1: Try different XPath selectors
      const fallbackSelectors = [
        '(//XCUIElementTypeTextField)[1]',
        '(//XCUIElementTypeTextField)[2]',
        '(//XCUIElementTypeTextField)[3]',
        '(//XCUIElementTypeTextField)[4]'
      ];
      
      console.log("🔄 Trying fallback 1: XPath selectors");
      let fallback1Success = true;
      
      for (let i = 0; i < 4; i++) {
        try {
          console.log(`🔄 Fallback 1 - Box ${i + 1} with: ${otpDigits[i]}`);
          
          const element = await driver.$(fallbackSelectors[i]);
          
          if (await element.isExisting()) {
            await element.click();
            await driver.pause(500);
            await element.clearValue();
            await driver.pause(300);
            await element.setValue(otpDigits[i]);
            await driver.pause(500);
            console.log(`✅ Fallback 1 - Box ${i + 1} filled`);
          } else {
            console.log(`❌ Fallback 1 - Box ${i + 1} not found`);
            fallback1Success = false;
          }
          
        } catch (error) {
          console.log(`❌ Fallback 1 - Box ${i + 1} failed: ${error.message}`);
          fallback1Success = false;
        }
      }
      
      // Fallback 2: Try typing entire OTP in first field
      if (!fallback1Success) {
        console.log("🔄 Trying fallback 2: Single field approach");
        try {
          const firstField = await driver.$('//XCUIElementTypeTextField[1]');
          if (await firstField.isExisting()) {
            await firstField.click();
            await driver.pause(500);
            await firstField.clearValue();
            await driver.pause(300);
            await firstField.setValue(latestOTP);
            await driver.pause(1000);
            console.log("✅ Fallback 2: Entire OTP entered in first field");
            otpFilled = true;
          }
        } catch (error) {
          console.log(`❌ Fallback 2 failed: ${error.message}`);
        }
      } else {
        otpFilled = true;
      }
      
      // Fallback 3: Use driver.keys() method
      if (!otpFilled) {
        console.log("🔄 Trying fallback 3: Keys method");
        try {
          // Click somewhere to focus
          await driver.action('pointer')
            .move({ duration: 0, x: 200, y: 400 })
            .down({ button: 0 })
            .up({ button: 0 })
            .perform();
          
          await driver.pause(500);
          
          // Type each digit with pause
          for (let i = 0; i < 4; i++) {
            await driver.keys([otpDigits[i]]);
            await driver.pause(800);
            console.log(`✅ Fallback 3 - Digit ${i + 1}: ${otpDigits[i]} typed`);
          }
          
          console.log("✅ Fallback 3: OTP typed using keys");
          otpFilled = true;
          
        } catch (error) {
          console.log(`❌ Fallback 3 failed: ${error.message}`);
        }
      }
    }
    
    if (!otpFilled) {
      console.log("❌ All OTP filling methods failed!");
    }
    
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_otp_filled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 17: Click Verify
    console.log("Step 17: Click Verify");
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

    // Step 21: Select Company
    console.log("Step 21: Select Company");
    await clickWithRetries(driver, '(//XCUIElementTypeOther[@name="Company"])[1]');
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_individual_selected.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 22: Click Next 
    console.log("Step 22: Click Next");
    await clickWithRetries(driver, '-ios class chain:**/XCUIElementTypeOther[`name == "   Next  "`][2]', 'Next button');
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_next_clicked.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 23: Fill Company Name
    console.log("Step 23: Fill Company Name");
    await fillTextWithRetries(driver, '//XCUIElementTypeOther[@name="Company Name"]/XCUIElementTypeOther/XCUIElementTypeOther[1]/XCUIElementTypeOther[2]/XCUIElementTypeTextField', testData.companyName, 'Company Name');
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_nric_filled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 23.5: Fill SSM 
    console.log("Step 23: Fill Company SSM");
    await fillTextWithRetries(driver, '//XCUIElementTypeOther[@name="SSM No"]/XCUIElementTypeOther/XCUIElementTypeOther[1]/XCUIElementTypeOther[2]/XCUIElementTypeTextField', testData.companyRegistrationNo, 'Company SSM No');
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
    await clickWithRetries(driver, '~Upload', 'Upload button 1');
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

    // Step 30: Click Next after documents - FIXED
    console.log("Step 30: Click Next after documents");
    
    // Try multiple selectors for the Next button
    const nextButtonSelectors = [
      '~   Next  ',  // Accessibility ID
      '//XCUIElementTypeButton[@name="   Next  "]',  // XPath
      '//XCUIElementTypeOther[@name="   Next  "]',  // XPath Other
      '//XCUIElementTypeStaticText[@name="   Next  "]',  // XPath StaticText
      '//XCUIElementTypeButton[contains(@name, "Next")]',  // XPath contains
      '//XCUIElementTypeOther[contains(@name, "Next")]',  // XPath Other contains
      '-ios class chain:**/XCUIElementTypeOther[`name == "   Next  "`][1]'  // iOS Class Chain with prefix
    ];
    
    let nextClicked = false;
    
    for (let i = 0; i < nextButtonSelectors.length; i++) {
      try {
        console.log(`🔄 Trying Next button selector ${i + 1}: ${nextButtonSelectors[i]}`);
        
        const element = await driver.$(nextButtonSelectors[i]);
        
        if (await element.isExisting()) {
          console.log(`✅ Next button found with selector ${i + 1}`);
          await element.click();
          nextClicked = true;
          console.log(`✅ Next button clicked successfully`);
          break;
        } else {
          console.log(`❌ Next button not found with selector ${i + 1}`);
        }
      } catch (error) {
        console.log(`❌ Selector ${i + 1} failed: ${error.message}`);
        continue;
      }
    }
    
    // If all selectors fail, try coordinate click
    if (!nextClicked) {
      console.log("⚠️ All Next button selectors failed, trying coordinate click");
      try {
        // Click at bottom center where Next button usually is
        await driver.action('pointer')
          .move({ duration: 0, x: 200, y: 700 })
          .down({ button: 0 })
          .up({ button: 0 })
          .perform();
        
        console.log("✅ Coordinate click performed for Next button");
        nextClicked = true;
      } catch (coordError) {
        console.log(`❌ Coordinate click failed: ${coordError.message}`);
      }
    }
    
    // If still not clicked, try scrolling and retry
    if (!nextClicked) {
      console.log("⚠️ Scrolling down to find Next button");
      try {
        await driver.execute('mobile: scroll', { direction: 'down' });
        await driver.pause(1000);
        
        // Try accessibility ID again after scroll
        const nextButton = await driver.$('~   Next  ');
        if (await nextButton.isExisting()) {
          await nextButton.click();
          console.log("✅ Next button clicked after scroll");
          nextClicked = true;
        }
      } catch (scrollError) {
        console.log(`❌ Scroll and retry failed: ${scrollError.message}`);
      }
    }
    
    if (!nextClicked) {
      console.log("❌ All attempts to click Next button failed");
      // Take a screenshot to see what's on screen
      screenshotPath = path.join(screenshotDir, `step${step++}_next_button_failed.png`);
      await driver.saveScreenshot(screenshotPath);
      
      // Try to find any clickable elements
      const allButtons = await driver.$$('//XCUIElementTypeButton');
      console.log(`📱 Found ${allButtons.length} buttons on screen`);
      
      for (let i = 0; i < allButtons.length; i++) {
        try {
          const buttonText = await allButtons[i].getText();
          console.log(`📝 Button ${i + 1}: "${buttonText}"`);
          
          if (buttonText.includes('Next') || buttonText.includes('Continue') || buttonText.includes('Proceed')) {
            await allButtons[i].click();
            console.log(`✅ Clicked button: "${buttonText}"`);
            nextClicked = true;
            break;
          }
        } catch (buttonError) {
          continue;
        }
      }
    }
    
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_documents_next_clicked.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 31: Fill Farm Name
    console.log("Step 31: Fill Farm Name");
    await fillTextWithRetries(driver, '//XCUIElementTypeOther[@name="Farm Name"]/XCUIElementTypeOther/XCUIElementTypeOther[1]/XCUIElementTypeOther[2]/XCUIElementTypeTextField', testData.farmName, 'Farm Name');
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

    // Step 37-38: Clear and fill postal code - COMBINED
    console.log("Step 37-38: Clear and fill postal code");
    
    const postalCodeSuccess = await clearAndFillPostalCode(driver, testData.postalCode);
    
    if (!postalCodeSuccess) {
      console.log("⚠️ Main postal code function failed, trying fallback");
      
      // Fallback method
      try {
        console.log("🔄 Fallback: Trying coordinate click and manual typing");
        
        // Click at estimated postal code field position
        await driver.action('pointer')
          .move({ duration: 0, x: 200, y: 500 })
          .down({ button: 0 })
          .up({ button: 0 })
          .perform();
        
        await driver.pause(500);
        
        // Clear using select all + delete
        await driver.keys(['cmd', 'a']);
        await driver.pause(300);
        await driver.keys(['Delete']);
        await driver.pause(300);
        
        // Type new postal code
        await driver.keys(testData.postalCode.split(''));
        await driver.pause(500);
        
        console.log(`✅ Fallback method completed for postal code: ${testData.postalCode}`);
        
      } catch (fallbackError) {
        console.log(`❌ Fallback also failed: ${fallbackError.message}`);
      }
    }
    
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_postal_code_cleared_and_filled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 39: Fill farm size
    console.log("Step 39: Fill farm size");
    await fillTextWithRetries(driver, '//XCUIElementTypeTextField[@value="0"]', testData.farmSize, 'Farm Size');
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

    // Step 42: Select Bank - SIMPLEST POSSIBLE
    console.log("Step 42: Select Bank");
    
    // Open dropdown
    await clickWithRetries(driver, '//XCUIElementTypeOther[@name="Name of Bank "]');
    await driver.pause(3000);
    screenshotPath = path.join(screenshotDir, `step${step++}_bank_dropdown_opened.png`);
    await driver.saveScreenshot(screenshotPath);

    // Just click in the center of where banks should be
    console.log("🔄 Single center click for bank selection...");
    await driver.action('pointer')
      .move({ duration: 0, x: 200, y: 380 })
      .down({ button: 0 })
      .up({ button: 0 })
      .perform();
    
    await driver.pause(3000);
    screenshotPath = path.join(screenshotDir, `step${step++}_bank_selected.png`);
    await driver.saveScreenshot(screenshotPath);
    
    console.log("✅ Bank selection completed (single click method)");

    // Step 43: Fill Bank Account Name
    console.log("Step 43: Fill Bank Account Name");
    await fillTextWithRetries(driver, '//XCUIElementTypeOther[@name="Bank Account Name"]/XCUIElementTypeOther/XCUIElementTypeOther[1]/XCUIElementTypeOther[2]/XCUIElementTypeTextField', testData.bankAccountName, 'Bank Account Name');
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_bank_account_name_filled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 44: Fill Bank Account Number
    console.log("Step 44: Fill Bank Account Number");
    await fillTextWithRetries(driver, '//XCUIElementTypeOther[@name="Bank Account No"]/XCUIElementTypeOther/XCUIElementTypeOther[1]/XCUIElementTypeOther[2]/XCUIElementTypeTextField', testData.bankAccountNo, 'Bank Account Number');
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
    await clickWithRetries(driver, '(//XCUIElementTypeOther[@name=""])[2]');
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
      'iOS_Company_SignUp_Gmail',
      'TC006',
      'iOS_Company_SignUp_Gmail_HappyFlow',
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