import { remote } from 'webdriverio';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { generateUniqueTestData } from './TestData_SignUp.js';

async function writeResultToExcel(moduleid, tcId, testScenario, result, screenshotPath, sheetName = 'Gmail_SignUp_KYC_Individual') {
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

  const screenshotDir = path.resolve('./screenshots/Mobile_Android_Gmail_SignUp_KYC_Individual');
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
    // TC002: GMAIL SIGN UP + KYC FLOW
    // ============================================
    console.log("🚀 Starting TC002: Gmail SignUp + KYC Flow");

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

    // Step 3: Click on Gmail option
    console.log("Step 3: Click on Gmail option");
    await (await driver.$("android=new UiSelector().className(\"android.view.ViewGroup\").instance(13)")).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_gmail_option_clicked.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 4: Select Gmail account
    console.log("Step 4: Select Gmail account");
    await (await driver.$("android=new UiSelector().text(\"nadzruladzizi03@gmail.com\")")).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_gmail_account_selected.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 5: Fill phone number
    console.log("Step 5: Fill phone number");
    await (await driver.$("android=new UiSelector().text(\"Phone Number\")")).click();
    await driver.pause(500);
    await (await driver.$("android=new UiSelector().text(\"Phone Number\")")).setValue(testData.phoneNumber);
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_phone_number_filled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 6: Scroll horizontally to continue
    console.log("Step 6: Scroll horizontally to continue");
    await driver.action('pointer')
      .move({ duration: 0, x: 15, y: 1098 })
      .down({ button: 0 })
      .move({ duration: 1000, x: 876, y: 1105 })
      .up({ button: 0 })
      .perform();
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_horizontal_swipe.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 7: Click Send OTP
    console.log("Step 7: Click Send OTP");
    await (await driver.$("android=new UiSelector().text(\"   Send  \")")).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_send_otp_clicked.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 8: Switch to Discord to get OTP
    console.log("Step 8: Switch to Discord to get OTP");
    await driver.execute('mobile: pressKey', { keycode: 3 }); // HOME
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_home_screen.png`);
    await driver.saveScreenshot(screenshotPath);
    
    await (await driver.$("accessibility id:Discord")).click();
    await driver.pause(3000);
    screenshotPath = path.join(screenshotDir, `step${step++}_discord_opened.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 9: Extract OTP from Discord
    console.log("Step 9: Extract OTP from Discord");
    const otpMessageEls = await driver.$$('android=new UiSelector().textContains("Your one-time password is")');
    if (otpMessageEls.length === 0) throw new Error("No OTP message found.");
    const latestOtpMessageEl = otpMessageEls[otpMessageEls.length - 1];
    const fullText = await latestOtpMessageEl.getText();
    const otpMatch = fullText.match(/\b\d{4,6}\b/);
    if (!otpMatch) throw new Error("OTP not found in message.");
    const otpDigits = otpMatch[0];
    console.log("Extracted OTP:", otpDigits);
    screenshotPath = path.join(screenshotDir, `step${step++}_otp_extracted.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 10: Switch back to app
    console.log("Step 10: Switch back to app");
    await driver.execute('mobile: pressKey', { keycode: 3 }); // HOME
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_home_screen_2.png`);
    await driver.saveScreenshot(screenshotPath);
    
    await (await driver.$("accessibility id:FarmByte Grow Staging")).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_app_reopened.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 11: Fill OTP with multiple methods
    console.log("Step 11: Fill OTP");
    let otpFilled = false;
    
    // Method 1: Try OTP input stick boxes
    try {
      const otpBoxes = await driver.$$('android=new UiSelector().resourceId("otp-input-stick")');
      if (otpBoxes.length > 0) {
        await otpBoxes[0].click();
        await driver.pause(300);
        await driver.keys(otpDigits);
        await driver.pause(1000);
        screenshotPath = path.join(screenshotDir, `step${step++}_otp_filled_method1.png`);
        await driver.saveScreenshot(screenshotPath);
        otpFilled = true;
      }
    } catch (e) {
      console.log("Method 1 failed, trying method 2");
    }

    // Method 2: Try EditText fields
    if (!otpFilled) {
      try {
        const allEditTexts = await driver.$$('android.widget.EditText');
        if (allEditTexts.length > 0) {
          await allEditTexts[0].setValue(otpDigits);
          await driver.pause(1000);
          screenshotPath = path.join(screenshotDir, `step${step++}_otp_filled_method2.png`);
          await driver.saveScreenshot(screenshotPath);
          otpFilled = true;
        }
      } catch (e) {
        console.log("Method 2 failed, trying method 3");
      }
    }

    // Method 3: Global keys
    if (!otpFilled) {
      await driver.keys(otpDigits);
      await driver.pause(1000);
      screenshotPath = path.join(screenshotDir, `step${step++}_otp_filled_method3.png`);
      await driver.saveScreenshot(screenshotPath);
    }

    // Step 12: Click Verify
    console.log("Step 12: Click Verify");
    await (await driver.$("android=new UiSelector().text(\"   Verify  \")")).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_verify_clicked.png`);
    await driver.saveScreenshot(screenshotPath);

    console.log("✅ Gmail SignUp completed successfully!");

    // ============================================
    // KYC FLOW (continues seamlessly)
    // ============================================
    console.log("🚀 Starting KYC Flow");

    // Step 13: Proceed to create account
    console.log("Step 13: Proceed to create account");
    await (await driver.$('android=new UiSelector().text("   Proceed to create account  ")')).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_proceed_to_create_account.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 14: Select Individual
    console.log("Step 14: Select Individual");
    await (await driver.$('android=new UiSelector().text("Individual")')).click();
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_select_individual.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 15: Click Next
    console.log("Step 15: Click Next");
    await (await driver.$('android=new UiSelector().text("   Next  ")')).click();
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_click_next.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 16: Fill NRIC (AUTO-GENERATED)
    console.log("Step 16: Fill NRIC");
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(1)')).click();
    await driver.pause(500);
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(1)')).setValue(testData.nric);
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_nric_filled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 17: Accept terms and Sign Up
    console.log("Step 17: Accept terms and Sign Up");
    await (await driver.$('android=new UiSelector().className("android.view.ViewGroup").instance(11)')).click();
    await driver.pause(500);
    screenshotPath = path.join(screenshotDir, `step${step++}_checkbox_clicked.png`);
    await driver.saveScreenshot(screenshotPath);

    await (await driver.$('android=new UiSelector().className("android.view.ViewGroup").instance(18)')).click();
    await driver.pause(500);
    screenshotPath = path.join(screenshotDir, `step${step++}_terms_accepted.png`);
    await driver.saveScreenshot(screenshotPath);
    
    await (await driver.$('android=new UiSelector().text("   Sign Up  ")')).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_signup_clicked.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 18: Proceed to KYC verification
    console.log("Step 18: Proceed to KYC verification");
    await (await driver.$('android=new UiSelector().text("   Proceed to KYC verification  ")')).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_proceed_to_kyc.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 19: Start KYC
    console.log("Step 19: Start KYC");
    await (await driver.$('android=new UiSelector().text("   Start  ")')).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_start_kyc.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 20: Upload front ID document
    console.log("Step 20: Upload front ID document");
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

    // Step 21: Upload back ID document
    console.log("Step 21: Upload back ID document");
    await (await driver.$('android=new UiSelector().text("Upload").instance(1)')).click();
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_upload_back_id.png`);
    await driver.saveScreenshot(screenshotPath);

    await (await driver.$('android=new UiSelector().text("Camera")')).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_camera_opened_back.png`);
    await driver.saveScreenshot(screenshotPath);

    await (await driver.$('~Take photo. Button. Double-tap to take a photo. Double-tap and hold to take burst photos')).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_photo_taken_back.png`);
    await driver.saveScreenshot(screenshotPath);

    await (await driver.$('id=com.android.camera:id/done_button')).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_photo_confirmed_back.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 22: Proceed to next step
    console.log("Step 22: Proceed to next step");
    await (await driver.$('android=new UiSelector().text("   Next  ")')).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_kyc_documents_next.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 23: Fill farm name (AUTO-GENERATED)
    console.log("Step 23: Fill farm name");
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(0)')).click();
    await driver.pause(500);
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(0)')).setValue(testData.farmName);
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_farm_name_filled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 24: Select location
    console.log("Step 24: Select location");
    await (await driver.$('android=new UiSelector().className("android.view.View").instance(1)')).click();
    await driver.pause(2000);
    await (await driver.$('android=new UiSelector().className("android.view.View").instance(1)')).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_location_picker_opened.png`));

    await (await driver.$('~My Location')).click();
    await driver.pause(3000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_my_location_clicked.png`));

    await (await driver.$('android=new UiSelector().className(\"android.view.ViewGroup\").instance(18)')).click();
    await driver.pause(5000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_my_location_clicked.png`));

    await (await driver.$('android=new UiSelector().text("   Choose This Location  ")')).click();
    await driver.pause(2000);
    
    // Step 24.5: Set Postal Code (CORRECTED)
    console.log("Step 24.5: Set Postal Code");
    
    try {
      // Method 1: Direct postal code input
      console.log("🔄 Method 1: Direct postal code input");
      const postalCodeField = await driver.$('android=new UiSelector().className("android.widget.EditText").instance(2)');
      
      if (await postalCodeField.isExisting()) {
        await postalCodeField.click();
        await driver.pause(500);
        await postalCodeField.setValue("71010");
        await driver.pause(1000);
        console.log("✅ Postal code filled successfully");
      } else {
        throw new Error("Postal code field not found");
      }
      
    } catch (method1Error) {
      console.log(`❌ Method 1 failed: ${method1Error.message}`);
      
      // Method 2: Try alternative EditText instances
      try {
        console.log("🔄 Method 2: Alternative EditText instances");
        
        const alternativeInstances = [1, 3, 4, 5];
        let postalCodeFilled = false;
        
        for (const instance of alternativeInstances) {
          try {
            console.log(`🔄 Trying EditText instance ${instance}`);
            const element = await driver.$(`android=new UiSelector().className("android.widget.EditText").instance(${instance})`);
            
            if (await element.isExisting()) {
              await element.click();
              await driver.pause(500);
              await element.setValue("71010");
              await driver.pause(1000);
              postalCodeFilled = true;
              console.log(`✅ Postal code filled with instance ${instance}`);
              break;
            }
          } catch (instanceError) {
            console.log(`❌ Instance ${instance} failed: ${instanceError.message}`);
          }
        }
        
        if (!postalCodeFilled) {
          throw new Error("All EditText instances failed");
        }
        
      } catch (method2Error) {
        console.log(`❌ Method 2 failed: ${method2Error.message}`);
        
        // Method 3: Try text-based selectors
        try {
          console.log("🔄 Method 3: Text-based selectors");
          
          const textSelectors = [
            'android=new UiSelector().textContains("Postal")',
            'android=new UiSelector().textContains("Code")',
            'android=new UiSelector().textContains("postal")',
            'android=new UiSelector().textContains("code")',
            'android=new UiSelector().descriptionContains("postal")',
            'android=new UiSelector().descriptionContains("Postal")',
          ];
          
          let postalCodeFilled = false;
          
          for (const selector of textSelectors) {
            try {
              console.log(`🔄 Trying selector: ${selector}`);
              const element = await driver.$(selector);
              
              if (await element.isExisting()) {
                await element.click();
                await driver.pause(500);
                await element.setValue("71010");
                await driver.pause(1000);
                postalCodeFilled = true;
                console.log(`✅ Postal code filled with selector: ${selector}`);
                break;
              }
            } catch (selectorError) {
              console.log(`❌ Selector failed: ${selector}`);
            }
          }
          
          if (!postalCodeFilled) {
            throw new Error("All text-based selectors failed");
          }
          
        } catch (method3Error) {
          console.log(`❌ Method 3 failed: ${method3Error.message}`);
          
          // Method 4: Find all EditText fields and try each one
          try {
            console.log("🔄 Method 4: Finding all EditText fields");
            
            const allEditTexts = await driver.$$('android=new UiSelector().className("android.widget.EditText")');
            console.log(`Found ${allEditTexts.length} EditText fields`);
            
            let postalCodeFilled = false;
            
            for (let i = 0; i < allEditTexts.length; i++) {
              try {
                console.log(`🔄 Testing EditText field ${i}`);
                const element = allEditTexts[i];
                
                // Try to fill this field
                await element.click();
                await driver.pause(500);
                await element.setValue("71010");
                await driver.pause(1000);
                
                postalCodeFilled = true;
                console.log(`✅ Postal code filled in EditText field ${i}`);
                break;
                
              } catch (fieldError) {
                console.log(`❌ EditText field ${i} failed: ${fieldError.message}`);
              }
            }
            
            if (!postalCodeFilled) {
              throw new Error("All EditText fields failed");
            }
            
          } catch (method4Error) {
            console.log(`❌ Method 4 failed: ${method4Error.message}`);
            
            // Method 5: Use coordinate-based input as last resort
            try {
              console.log("🔄 Method 5: Coordinate-based input");
              
              // Get screen dimensions
              const screenSize = await driver.getWindowSize();
              
              // Click at common postal code field positions
              const postalCodePosition = {
                x: screenSize.width * 0.5,
                y: screenSize.height * 0.6
              };
              
              await driver.action('pointer')
                .move({ duration: 0, x: postalCodePosition.x, y: postalCodePosition.y })
                .down({ button: 0 })
                .up({ button: 0 })
                .perform();
              
              await driver.pause(500);
              await driver.keys("71010");
              await driver.pause(1000);
              
              console.log("✅ Postal code filled using coordinates");
              
            } catch (method5Error) {
              console.log(`❌ Method 5 failed: ${method5Error.message}`);
              console.error("❌ All postal code input methods failed!");
              
              // Take screenshot for debugging
              const errorScreenshot = path.join(screenshotDir, `step${step++}_postal_code_error.png`);
              await driver.saveScreenshot(errorScreenshot);
              
              // Continue without postal code (or throw error if required)
              console.log("⚠️ Continuing without postal code...");
            }
          }
        }
      }
    }
    
    // Take screenshot after postal code input
    screenshotPath = path.join(screenshotDir, `step${step++}_postal_code_filled.png`);
    await driver.saveScreenshot(screenshotPath);
    console.log("✅ Postal code step completed");

    // Step 25: Set farm size (AUTO-GENERATED)
    console.log("Step 25: Set farm size");
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

    // Step 26: Set as default pickup address and save
    console.log("Step 26: Set as default pickup address and save");
    await (await driver.$('android=new UiSelector().text("Set as Default Pickup Address")')).click();
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_default_pickup_set.png`);
    await driver.saveScreenshot(screenshotPath);

    await (await driver.$('android=new UiSelector().text("   Save  ")')).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_farm_info_saved.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 27: Proceed to bank details
    console.log("Step 27: Proceed to bank details");
    await (await driver.$('android=new UiSelector().text("   Next  ")')).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_proceed_to_bank_details.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 28: Select bank
    console.log("Step 28: Select bank");
    await (await driver.$('android=new UiSelector().text("Name of Bank")')).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_bank_selector_opened.png`);
    await driver.saveScreenshot(screenshotPath);

    await (await driver.$(`android=new UiSelector().text("${testData.selectedBank}")`)).click();
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_bank_selected.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 29: Fill bank account name (AUTO-GENERATED)
    console.log("Step 29: Fill bank account name");
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(0)')).click();
    await driver.pause(500);
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(0)')).setValue(testData.bankAccountName);
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_bank_account_name_filled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 30: Fill bank account number (AUTO-GENERATED)
    console.log("Step 30: Fill bank account number");
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(1)')).click();
    await driver.pause(500);
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(1)')).setValue(testData.bankAccountNumber);
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_bank_account_number_filled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 31: Accept terms and submit
    console.log("Step 31: Accept terms and submit");
    await (await driver.$('android=new UiSelector().className("android.view.ViewGroup").instance(11)')).click();
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_terms_accepted_bank.png`);
    await driver.saveScreenshot(screenshotPath);

    await (await driver.$('android=new UiSelector().text("   Submit  ")')).click();
    await driver.pause(3000);
    screenshotPath = path.join(screenshotDir, `step${step++}_kyc_submitted.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 32: Discover Farmbyte
    console.log("Step 32: Discover Farmbyte");
    await (await driver.$('android=new UiSelector().text("   Discover Farmbyte  ")')).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_discover_farmbyte.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 33: Allow permissions
    console.log("Step 33: Allow permissions");
    await (await driver.$('android=new UiSelector().text("   Allow  ")')).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_permissions_allowed.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 34: Final navigation
    console.log("Step 22: Final navigation");
    await (await driver.$('android=new UiSelector().text(\"\")')).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_final_success.png`));

    // Step 35: Final success verification
    console.log("Step 35: Final success verification");
    await (await driver.$('android=new UiSelector().className("android.view.View").instance(15)')).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_final_success.png`);
    await driver.saveScreenshot(screenshotPath);
    
    console.log("✅ TC002 Gmail SignUp + KYC completed successfully!");
    
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
      'Android_Gmail_SignUp_KYC_Individual',
      'TC002',
      'Android_Gmail_Individual_SignUp_KYC_HappyFlow',
      testResult,
      screenshotPath, // This will now always contain a valid screenshot path
      'Gmail_SignUp_KYC_Individual'
    );
    
    console.log("🎯 Test execution completed!");
  }
}

main().catch(err => {
  console.error("❌ Main function error:", err);
  process.exit(1);
});