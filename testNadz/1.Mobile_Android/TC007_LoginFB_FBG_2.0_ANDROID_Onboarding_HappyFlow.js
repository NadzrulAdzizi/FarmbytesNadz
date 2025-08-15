import { remote } from 'webdriverio';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { generateUniqueTestData } from './TestData_SignUp.js';

async function writeResultToExcel(moduleid, tcId, testScenario, result, screenshotPath, sheetName = 'Facebook_Login') {
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

  const screenshotDir = path.resolve('./screenshots/Mobile_Android_Facebook_Login');
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

    // Step 2: Navigate to Login with Facebook
    console.log("Step 2: Navigate to Login with Facebook");
    await (await driver.$("android=new UiSelector().text(\"Log in with Facebook \")")).click();
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_signup_page.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 3: Click Continue button on Facebook login (Enhanced WebView Method)
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

    // Step 4: Final success verification
    console.log("Step 4: Final success verification");
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
      'Android_Facebook_Login',
      'TC007',
      'Android_Facebook_Login_HappyFlow',
      testResult,
      screenshotPath, // This will now always contain a valid screenshot path
      'Facebook_Login',
    );
    
    console.log("🎯 Test execution completed!");
  }
}

main().catch(err => {
  console.error("❌ Main function error:", err);
  process.exit(1);
});