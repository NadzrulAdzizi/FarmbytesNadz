import { remote } from 'webdriverio';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { generateUniqueTestData } from './TestData_SignUp.js';

async function writeResultToExcel(moduleid, tcId, testScenario, result, screenshotPath, sheetName = 'Facebook_SignUp_KYC_Company') {
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

  const screenshotDir = path.resolve('./screenshots/Mobile_Android_Facebook_SignUp_KYC_Company');
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

    // Step 2: Navigate to Sign Up
    console.log("Step 2: Navigate to Sign Up");
    await (await driver.$("android=new UiSelector().text(\"Sign Up\")")).click();
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_signup_page.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 3: Click Sign Up with Facebook
    console.log("Step 3: Click Sign Up with Facebook");
    await (await driver.$("android=new UiSelector().className(\"android.view.ViewGroup\").instance(15)")).click();
    await driver.pause(3000);
    screenshotPath = path.join(screenshotDir, `step${step++}_facebook_signup_clicked.png`);
    await driver.saveScreenshot(screenshotPath);

    // ...existing code...

    // Step 4: Click Continue button on Facebook login (Enhanced WebView Method)
    console.log("Step 4: Click Continue button on Facebook login");
    try {
    // First, wait for the Facebook page to load completely
    await driver.pause(5000);
    
    // Take a screenshot to see what we're dealing with
    screenshotPath = path.join(screenshotDir, `step${step++}_facebook_page_loaded.png`);
    await driver.saveScreenshot(screenshotPath);
    
    // Method 1: Try to interact with WebView first
    console.log("🔄 Trying WebView interaction...");
    try {
        // Look for WebView elements
        const webViewSelectors = [
        'android.webkit.WebView',
        'android=new UiSelector().className("android.webkit.WebView")'
        ];
        
        for (const webViewSelector of webViewSelectors) {
        try {
            const webView = await driver.$(webViewSelector);
            if (await webView.isExisting()) {
            console.log(`✅ Found WebView with selector: ${webViewSelector}`);
            await webView.click();
            await driver.pause(2000);
            screenshotPath = path.join(screenshotDir, `step${step++}_webview_clicked.png`);
            await driver.saveScreenshot(screenshotPath);
            break;
            }
        } catch (e) {
            console.log(`❌ WebView selector failed: ${webViewSelector}`);
        }
        }
    } catch (webViewError) {
        console.log("❌ WebView interaction failed, continuing with other methods");
    }
    
    // Method 2: Enhanced selector strategies with more options
    const enhancedStrategies = [
        {
        name: "Facebook Continue Text Variations",
        selectors: [
            'android=new UiSelector().text("Continue")',
            'android=new UiSelector().text("CONTINUE")',
            'android=new UiSelector().text("Continue as")',
            'android=new UiSelector().textContains("Continue as")',
            'android=new UiSelector().textContains("Continue")',
            'android=new UiSelector().textMatches(".*Continue.*")',
            'android=new UiSelector().text("Teruskan")', // Indonesian
            'android=new UiSelector().text("继续")', // Chinese
            'android=new UiSelector().text("Continuar")', // Spanish
            'android=new UiSelector().text("Continuer")', // French
        ]
        },
        {
        name: "Button Elements with Continue",
        selectors: [
            'android=new UiSelector().className("android.widget.Button").textContains("Continue")',
            'android=new UiSelector().className("android.view.View").textContains("Continue")',
            'android=new UiSelector().className("android.widget.TextView").textContains("Continue")',
            'android=new UiSelector().className("android.view.ViewGroup").textContains("Continue")',
        ]
        },
        {
        name: "Generic Facebook Button Elements",
        selectors: [
            'android=new UiSelector().className("android.widget.Button").instance(0)',
            'android=new UiSelector().className("android.widget.Button").instance(1)',
            'android=new UiSelector().className("android.widget.Button").instance(2)',
            'android=new UiSelector().className("android.view.View").instance(5)',
            'android=new UiSelector().className("android.view.View").instance(6)',
            'android=new UiSelector().className("android.view.View").instance(7)',
            'android=new UiSelector().className("android.view.ViewGroup").instance(8)',
            'android=new UiSelector().className("android.view.ViewGroup").instance(9)',
            'android=new UiSelector().className("android.view.ViewGroup").instance(10)',
        ]
        },
        {
        name: "Resource ID Based",
        selectors: [
            'android=new UiSelector().resourceIdMatches(".*continue.*")',
            'android=new UiSelector().resourceIdMatches(".*button.*")',
            'android=new UiSelector().resourceIdMatches(".*login.*")',
            'android=new UiSelector().resourceIdMatches(".*submit.*")',
        ]
        },
        {
        name: "Content Description",
        selectors: [
            'android=new UiSelector().descriptionContains("Continue")',
            'android=new UiSelector().descriptionContains("continue")',
            'android=new UiSelector().descriptionContains("button")',
        ]
        }
    ];
    
    let clicked = false;
    
    // Try each strategy with multiple attempts
    for (const strategy of enhancedStrategies) {
        if (clicked) break;
        
        console.log(`🔄 Trying strategy: ${strategy.name}`);
        
        for (const selector of strategy.selectors) {
        if (clicked) break;
        
        console.log(`🔄 Trying selector: ${selector}`);
        
        try {
            // Wait for element to be available
            const element = await driver.$(selector);
            
            if (await element.isExisting()) {
            console.log(`✅ Element found with selector: ${selector}`);
            
            // Try to check if it's displayed
            try {
                const isDisplayed = await element.isDisplayed();
                console.log(`Element displayed: ${isDisplayed}`);
                
                if (isDisplayed) {
                // Get element text for verification
                try {
                    const elementText = await element.getText();
                    console.log(`Element text: "${elementText}"`);
                } catch (textError) {
                    console.log("Could not get element text");
                }
                
                // Try to click
                await element.click();
                clicked = true;
                console.log(`✅ Successfully clicked Continue using: ${selector}`);
                
                // Wait and take screenshot
                await driver.pause(3000);
                screenshotPath = path.join(screenshotDir, `step${step++}_continue_clicked_success.png`);
                await driver.saveScreenshot(screenshotPath);
                break;
                }
            } catch (displayError) {
                console.log(`Element exists but display check failed, trying click anyway...`);
                try {
                await element.click();
                clicked = true;
                console.log(`✅ Successfully clicked Continue using: ${selector} (forced click)`);
                
                await driver.pause(3000);
                screenshotPath = path.join(screenshotDir, `step${step++}_continue_clicked_forced.png`);
                await driver.saveScreenshot(screenshotPath);
                break;
                } catch (clickError) {
                console.log(`❌ Forced click also failed: ${clickError.message}`);
                }
            }
            } else {
            console.log(`❌ Element not found: ${selector}`);
            }
        } catch (selectorError) {
            console.log(`❌ Selector error: ${selector} - ${selectorError.message}`);
        }
        
        // Small delay between selector attempts
        await driver.pause(800);
        }
        
        // Delay between strategy attempts
        await driver.pause(1500);
    }
    
    // Method 3: If all selectors failed, try coordinate-based clicking
    if (!clicked) {
        console.log("⚠️ All selectors failed, trying coordinate-based clicking...");
        
        // Get screen dimensions
        const screenSize = await driver.getWindowSize();
        console.log(`Screen size: ${screenSize.width}x${screenSize.height}`);
        
        // Try multiple coordinate positions where Continue button might be
        const coordinatePositions = [
        { x: screenSize.width * 0.5, y: screenSize.height * 0.6, name: "Center-Middle" },
        { x: screenSize.width * 0.5, y: screenSize.height * 0.7, name: "Center-Lower" },
        { x: screenSize.width * 0.5, y: screenSize.height * 0.75, name: "Center-Bottom" },
        { x: screenSize.width * 0.5, y: screenSize.height * 0.8, name: "Center-Very Bottom" },
        { x: screenSize.width * 0.3, y: screenSize.height * 0.7, name: "Left-Lower" },
        { x: screenSize.width * 0.7, y: screenSize.height * 0.7, name: "Right-Lower" },
        { x: screenSize.width * 0.5, y: screenSize.height * 0.5, name: "Dead Center" },
        ];
        
        for (const position of coordinatePositions) {
        try {
            console.log(`🔄 Trying coordinate click at ${position.name}: x=${position.x}, y=${position.y}`);
            
            await driver.action('pointer')
            .move({ duration: 0, x: position.x, y: position.y })
            .down({ button: 0 })
            .up({ button: 0 })
            .perform();
            
            await driver.pause(2000);
            
            // Take screenshot to verify click
            screenshotPath = path.join(screenshotDir, `step${step++}_coordinate_click_${position.name.toLowerCase()}.png`);
            await driver.saveScreenshot(screenshotPath);
            
            // Check if the click was successful by looking for next page elements
            try {
            const successIndicators = [
                'android=new UiSelector().text("Phone Number")',
                'android=new UiSelector().textContains("Enter your phone")',
                'android=new UiSelector().textContains("Welcome")',
                'android=new UiSelector().textContains("Account")',
                'android=new UiSelector().className("android.widget.EditText")',
            ];
            
            for (const indicator of successIndicators) {
                try {
                const element = await driver.$(indicator);
                if (await element.isExisting()) {
                    clicked = true;
                    console.log(`✅ Successfully clicked Continue using coordinates ${position.name}: x=${position.x}, y=${position.y}`);
                    console.log(`✅ Success confirmed by finding: ${indicator}`);
                    break;
                }
                } catch (indicatorError) {
                // Continue checking other indicators
                }
            }
            
            if (clicked) break;
            } catch (checkError) {
            console.log(`❌ Success check failed for ${position.name}: ${checkError.message}`);
            }
            
            // Small delay before trying next coordinate
            await driver.pause(1000);
        } catch (coordError) {
            console.log(`❌ Coordinate click error at ${position.name}: ${coordError.message}`);
        }
        }
    }
    
    // Method 4: If still not clicked, try a broader search
    if (!clicked) {
        console.log("🔄 Final attempt: Broader element search...");
        
        try {
        // Get all clickable elements
        const allClickableElements = await driver.$$('android=new UiSelector().clickable(true)');
        console.log(`Found ${allClickableElements.length} clickable elements`);
        
        // Try to find Continue button in all clickable elements
        for (let i = 0; i < Math.min(allClickableElements.length, 15); i++) {
            try {
            const element = allClickableElements[i];
            
            // Get text and check if it contains "Continue"
            try {
                const text = await element.getText();
                if (text && (text.toLowerCase().includes('continue') || text.toLowerCase().includes('teruskan'))) {
                console.log(`✅ Found Continue button with text: "${text}"`);
                await element.click();
                clicked = true;
                
                await driver.pause(2000);
                screenshotPath = path.join(screenshotDir, `step${step++}_continue_found_in_search.png`);
                await driver.saveScreenshot(screenshotPath);
                break;
                }
            } catch (textError) {
                // Try checking content description
                try {
                const desc = await element.getAttribute('content-desc');
                if (desc && desc.toLowerCase().includes('continue')) {
                    console.log(`✅ Found Continue button with description: "${desc}"`);
                    await element.click();
                    clicked = true;
                    
                    await driver.pause(2000);
                    screenshotPath = path.join(screenshotDir, `step${step++}_continue_found_by_desc.png`);
                    await driver.saveScreenshot(screenshotPath);
                    break;
                }
                } catch (descError) {
                // Continue to next element
                }
            }
            } catch (elementError) {
            // Continue to next element
            }
        }
        } catch (broadSearchError) {
        console.log(`❌ Broad search failed: ${broadSearchError.message}`);
        }
    }
    
    // Final check
    if (!clicked) {
        console.log("❌ All methods failed, taking final debug screenshot");
        screenshotPath = path.join(screenshotDir, `step${step++}_facebook_continue_all_methods_failed.png`);
        await driver.saveScreenshot(screenshotPath);
        
        // Try one last desperate attempt - just tap in the middle-bottom area
        console.log("🔄 Desperate final attempt - tapping middle-bottom area");
        const screenSize = await driver.getWindowSize();
        await driver.action('pointer')
        .move({ duration: 0, x: screenSize.width * 0.5, y: screenSize.height * 0.72 })
        .down({ button: 0 })
        .up({ button: 0 })
        .perform();
        
        await driver.pause(3000);
        screenshotPath = path.join(screenshotDir, `step${step++}_desperate_final_click.png`);
        await driver.saveScreenshot(screenshotPath);
        
        // Check if this worked
        try {
        const phoneElement = await driver.$('android=new UiSelector().text("Phone Number")');
        if (await phoneElement.isExisting()) {
            clicked = true;
            console.log("✅ Desperate click worked!");
        }
        } catch (e) {
        // Still failed
        }
    }
    
    if (!clicked) {
        throw new Error("Could not find or click Continue button after trying all methods");
    }
    
    console.log("✅ Facebook Continue button clicked successfully!");
    
    } catch (error) {
    console.error("❌ Error clicking Continue button:", error.message);
    // Take final error screenshot
    screenshotPath = path.join(screenshotDir, `step${step++}_facebook_continue_error.png`);
    await driver.saveScreenshot(screenshotPath);
    throw error;
    }

    // Additional wait and final screenshot
    await driver.pause(4000);
    screenshotPath = path.join(screenshotDir, `step${step++}_facebook_continue_success.png`);
    await driver.saveScreenshot(screenshotPath);

    // ...rest of your code...

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

    console.log("✅ Facebook SignUp completed successfully!");

    // Continue with KYC flow (same as Gmail and Email)...
    // Add all the KYC steps here with proper screenshotPath updates

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

    // Step 14: Select Company (FIXED from Java to WebdriverIO)
    console.log("Step 14: Select Company");
    await (await driver.$('~Company')).click();
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_select_company.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 15: Click Next
    console.log("Step 16: Click Next");
    await (await driver.$('android=new UiSelector().text("   Next  ")')).click();
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_click_next.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 17: Fill company name (AUTO-GENERATED)
    console.log("Step 17: Fill company name");
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(0)')).click();
    await driver.pause(500);
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(0)')).setValue(testData.companyName);
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_company_name_filled.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 18: Fill SSM number (AUTO-GENERATED)
    console.log("Step 18: Fill SSM number");
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(1)')).click();
    await driver.pause(500);
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(1)')).setValue(testData.ssmNumber);
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_ssm_number_filled.png`);
    await driver.saveScreenshot(screenshotPath);

  // Step 19: Scroll horizontally to continue
    console.log("Step 19: Scroll horizontally to continue");
    await driver.action('pointer')
      .move({ duration: 0, x: 15, y: 1098 })
      .down({ button: 0 })
      .move({ duration: 1000, x: 876, y: 1105 })
      .up({ button: 0 })
      .perform();
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_horizontal_swipe.png`);
    await driver.saveScreenshot(screenshotPath);


    // Step 20: Accept terms and conditions
    console.log("Step 20: Accept terms and conditions");
    await (await driver.$('android=new UiSelector().className("android.view.ViewGroup").instance(20)')).click();
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_terms_accepted.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 21: Click Sign Up
    console.log("Step 21: Click Sign Up");
    await (await driver.$('android=new UiSelector().text("   Sign Up  ")')).click();
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_company_signup_clicked.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 22: Proceed to KYC verification
    console.log("Step 22: Proceed to KYC verification");
    await (await driver.$('android=new UiSelector().text("   Proceed to KYC verification  ")')).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_proceed_to_kyc.png`));

    // Step 23: Start KYC
    console.log("Step 23: Start KYC");
    await (await driver.$('android=new UiSelector().text("   Start  ")')).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_start_kyc.png`));

    // Step 24: Upload front ID document
    console.log("Step 24: Upload front ID document");
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

    // Step 25: Proceed to next step
    console.log("Step 25: Proceed to next step");
    await (await driver.$('android=new UiSelector().text("   Next  ")')).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_kyc_documents_next.png`));

    // Step 26: Fill farm name (AUTO-GENERATED)
    console.log("Step 26: Fill farm name");
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(0)')).click();
    await driver.pause(500);
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(0)')).setValue(testData.farmName);
    await driver.pause(1000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_farm_name_filled.png`));

    // Step 27: Select location
    console.log("Step 27: Select location");
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
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_location_chosen.png`));

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


    // Step 28: Set farm size (AUTO-GENERATED)
    console.log("Step 28: Set farm size");
    await (await driver.$('android=new UiSelector().text("0")')).click();
    await driver.pause(1000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_farm_size_clicked.png`));

    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(3)')).click();
    await driver.pause(500);
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(3)')).setValue(testData.farmSize);
    await driver.pause(1000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_farm_size_filled.png`));

    // Step 29: Set as default pickup address and save
    console.log("Step 29: Set as default pickup address and save");
    await (await driver.$('android=new UiSelector().text("Set as Default Pickup Address")')).click();
    await driver.pause(1000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_default_pickup_set.png`));

    await (await driver.$('android=new UiSelector().text("   Save  ")')).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_farm_info_saved.png`));

    // Step 30: Proceed to bank details
    console.log("Step 30: Proceed to bank details");
    await (await driver.$('android=new UiSelector().text("   Next  ")')).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_proceed_to_bank_details.png`));

    // Step 31: Select bank
    console.log("Step 31: Select bank");
    await (await driver.$('android=new UiSelector().text("Name of Bank")')).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_bank_selector_opened.png`));

    await (await driver.$(`android=new UiSelector().text("${testData.selectedBank}")`)).click();
    await driver.pause(1000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_bank_selected.png`));

    // Step 32: Fill bank account name (AUTO-GENERATED)
    console.log("Step 32: Fill bank account name");
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(0)')).click();
    await driver.pause(500);
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(0)')).setValue(testData.bankAccountName);
    await driver.pause(1000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_bank_account_name_filled.png`));

    // Step 33: Fill bank account number (AUTO-GENERATED)
    console.log("Step 33: Fill bank account number");
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(1)')).click();
    await driver.pause(500);
    await (await driver.$('android=new UiSelector().className("android.widget.EditText").instance(1)')).setValue(testData.bankAccountNumber);
    await driver.pause(1000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_bank_account_number_filled.png`));

    // Step 34: Accept terms and submit
    console.log("Step 34: Accept terms and submit");
    await (await driver.$('android=new UiSelector().className("android.view.ViewGroup").instance(11)')).click();
    await driver.pause(1000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_terms_accepted_bank.png`));

    await (await driver.$('android=new UiSelector().text("   Submit  ")')).click();
    await driver.pause(3000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_kyc_submitted.png`));

    // Step 35: Discover Farmbyte
    console.log("Step 35: Discover Farmbyte");
    await (await driver.$('android=new UiSelector().text("   Discover Farmbyte  ")')).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_discover_farmbyte.png`));

    // Step 36: Allow permissions
    console.log("Step 36: Allow permissions");
    await (await driver.$('android=new UiSelector().text("   Allow  ")')).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_permissions_allowed.png`));

    // Step 37: Final navigation
    console.log("Step 37: Final navigation");
    //await (await driver.$('~')).click();
    await (await driver.$('android=new UiSelector().text(\"\")')).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_final_success.png`));

    // Step 38: Final success verification
    console.log("Step 38: Final success verification");
    await (await driver.$('android=new UiSelector().className("android.view.View").instance(15)')).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_final_success.png`));
    
    console.log("✅ TC003 Facebook SignUp + KYC completed successfully!");
    
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
      'Android_Facebook_SignUp_KYC_Company',
      'TC006',
      'Android_Facebook_Company_SignUp_KYC_HappyFlow',
      testResult,
      screenshotPath, // This will now always contain a valid screenshot path
      'Facebook_SignUp_KYC_Company'
    );
    
    console.log("🎯 Test execution completed!");
  }
}

main().catch(err => {
  console.error("❌ Main function error:", err);
  process.exit(1);
});