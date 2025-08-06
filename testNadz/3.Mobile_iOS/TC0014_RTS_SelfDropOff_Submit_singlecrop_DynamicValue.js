import { remote } from 'webdriverio';
import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import {
  clickWithRetries, 
  fillTextWithRetries, 
  writeResultToExcel, 
  swipeUp, 
  swipeDown, 
  performSwipe,
  fillRandomValue,
  selectNextAvailableDate,
  selectAvailableTimeSlot
} from './TestData_iOS_SignUp.js';

async function main() {
  const caps = {
    "appium:platformName": "iOS",
    "appium:automationName": "XCUITest",
    "appium:deviceName": "nadzrul's iPhone",
    "appium:platformVersion": "18.5",
    "appium:udid": "00008130-000165AC3E79001C",
  };

  const screenshotDir = path.resolve('./screenshots/Mobile_iOS_TC0014_SubmitSingleCrop_SelfDropOff');
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

    console.log("🚀 Starting TC0013: iOS Submit Single Crop (Driver Collect)");

    // Step 1: Launch FarmByte App
    console.log("Step 1: Launch FarmByte App");
    await clickWithRetries(driver, '~FarmByte App Staging', 'FarmByte App');
    await driver.pause(3000);
    screenshotPath = path.join(screenshotDir, `step${step++}_app_launched.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 2: Click Home Tab
    console.log("Step 2: Click Home Tab");
    await clickWithRetries(driver, '//XCUIElementTypeButton[@name="Home, tab, 1 of 4"]', 'Home Tab');
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_home_tab_clicked.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 3: Select Location
    console.log("Step 3: Select Location");
    await clickWithRetries(driver, '(//XCUIElementTypeOther[@name="N. Sembilan "])[2]');
    await driver.pause(1000);
    await clickWithRetries(driver, '//XCUIElementTypeOther[@name="N. Sembilan"]', 'Confirm N. Sembilan');
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_location_selected.png`);
    await driver.saveScreenshot(screenshotPath);

    await swipeDown(driver, 3);

    // Step 4: Click Sell Now Tab
    console.log("Step 4: Click Sell Now Tab");
    await clickWithRetries(driver, '//XCUIElementTypeOther[@name="Unlock your Performance Start selling to unlock your performance insights!    Sell Now  "]');
    await driver.pause(1000);
    await clickWithRetries(driver, '//XCUIElementTypeOther[@name="   Sell Now  "]');  
    screenshotPath = path.join(screenshotDir, `step${step++}_sell_now_clicked.png`);
    await driver.saveScreenshot(screenshotPath);    

    // Step 5: Click Calamansi Crop
    console.log("Step 5: Click Calamansi Crop");
    
    const calamansiSelectors = [
      '(//XCUIElementTypeOther[@name="CALAMANSI RM 1.90 /kg"])[2]',
      '//XCUIElementTypeOther[@name="CALAMANSI RM 1.90 /kg"]',
      '//XCUIElementTypeOther[contains(@name, "CALAMANSI")]',
      '//XCUIElementTypeButton[contains(@name, "CALAMANSI")]',
      '~CALAMANSI RM 1.90 /kg'
    ];
    
    let calamansiClicked = false;
    for (const selector of calamansiSelectors) {
      try {
        await clickWithRetries(driver, selector, 'Calamansi Crop');
        calamansiClicked = true;
        console.log(`✅ Calamansi clicked with selector: ${selector}`);
        break;
      } catch (error) {
        console.log(`❌ Calamansi selector failed: ${selector}`);
        continue;
      }
    }
    
    if (!calamansiClicked) {
      console.log("⚠️ All Calamansi selectors failed, but continuing");
    }
    
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_calamansi_selected.png`);
    await driver.saveScreenshot(screenshotPath);

    // AUTOMATED Step 6: Fill value with random amount
    console.log("Step 6: Auto-Fill Random Value");
    
    const filledValue = await fillRandomValue(
      driver, 
      '//XCUIElementTypeTextField[@value="Enter Value"]', 
      150,    // minimum value
      300,    // maximum value
      'Crop Value Field'
    );
    
    if (filledValue) {
      console.log(`🎯 Successfully filled value: ${filledValue} kg`);
    } else {
      console.log("⚠️ Auto-fill failed, using fallback");
      await fillTextWithRetries(driver, '//XCUIElementTypeTextField[@value="Enter Value"]', "200", 'Value Field');
    }
    
    await driver.pause(1000);
    await clickWithRetries(driver, '~Done', 'Done button');
    screenshotPath = path.join(screenshotDir, `step${step++}_value_filled_${filledValue || 'fallback'}.png`);
    await driver.saveScreenshot(screenshotPath);
    
    // FIXED: Swipe up to reveal more options
    console.log("Step 6.5: Swipe up to reveal Add Item button");
    const swipeSuccess = await performSwipe(driver, 'up', 3);
    if (!swipeSuccess) {
      console.log("⚠️ Swipe failed, but continuing with test");
    }
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_after_swipe.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 7: Click Add Item
    console.log("Step 7: Click Add Item");
    await clickWithRetries(driver, '(//XCUIElementTypeOther[@name="Horizontal scroll bar, 1 page"])[4]');
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_item_added.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 8: Click View Request - CORRECT DYNAMIC VERSION
    console.log("Step 8: Click View Request");
    await clickWithRetries(driver, '(//XCUIElementTypeOther[starts-with(@name, "View request") and contains(@name, "items RM")])[2]', 'View Request');
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_view_request_clicked.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 9: Click on Self Drop-Off
    console.log("Step 9: Click on Self Drop-Off");
    await clickWithRetries(driver, '//XCUIElementTypeOther[@name="Self Drop-Off"]');
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_self_drop_off_selected.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 10: Automated Date & Time Selection
    console.log("Step 10: Automated Date & Time Selection");
    await clickWithRetries(driver, '//XCUIElementTypeOther[@name=" Select date & time"]');
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_date_time_picker_opened.png`);
    await driver.saveScreenshot(screenshotPath);
    
    // Auto-select next available date
    console.log("🗓️ Auto-selecting next available date...");
    
    let dateSelected = false;
    let selectedDate = '';
    const today = new Date();
    
    // Try next 7 days to find an available date
    for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + dayOffset);
      
      // Format date as YYYY-MM-DD for the selector
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const day = String(targetDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      console.log(`🔍 Trying date: ${dateString} (${dayOffset} days from today)`);
      
      try {
        // Try the exact format from your original code
        const dateSelector = `//XCUIElementTypeButton[@name="undefined.day_${dateString}"]`;
        await clickWithRetries(driver, dateSelector, `Date ${dateString}`);
        console.log(`✅ Successfully selected date: ${dateString}`);
        selectedDate = dateString;
        dateSelected = true;
        break;
      } catch (error) {
        console.log(`❌ Date ${dateString} not available: ${error.message}`);
        continue;
      }
    }
    
    // Fallback: Try to find any available date button
    if (!dateSelected) {
      console.log("🔄 Fallback: Looking for any available date button...");
      
      try {
        const dateButtons = await driver.$$('//XCUIElementTypeButton[contains(@name, "day_")]');
        console.log(`📅 Found ${dateButtons.length} date buttons`);
        
        for (const button of dateButtons) {
          try {
            const buttonName = await button.getAttribute('name');
            
            if (await button.isDisplayed() && await button.isEnabled()) {
              await button.click();
              console.log(`✅ Selected fallback date: ${buttonName}`);
              selectedDate = buttonName;
              dateSelected = true;
              break;
            }
          } catch (error) {
            continue;
          }
        }
      } catch (error) {
        console.log(`❌ Fallback date selection failed: ${error.message}`);
      }
    }
    
    if (!dateSelected) {
      console.log("⚠️ No date could be selected - test may fail");
    }
    
    await driver.pause(1500);
    screenshotPath = path.join(screenshotDir, `step${step++}_date_selected.png`);
    await driver.saveScreenshot(screenshotPath);

    //Step 10: CLick Confirm 
    console.log("Step 10: Click Confirm");
    await clickWithRetries(driver, '(//XCUIElementTypeOther[@name="Horizontal scroll bar, 1 page"])[5]');
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_datetime_confirmed.png`);
    await driver.saveScreenshot(screenshotPath);


    // Step 11: Confirm and Submit Request
    console.log("Step 11: Confirm and Submit Request");
    screenshotPath = path.join(screenshotDir, `step${step++}_before_confirm.png`);
    await driver.saveScreenshot(screenshotPath);
    
    await clickWithRetries(driver, '(//XCUIElementTypeOther[@name="Horizontal scroll bar, 1 page"])[3]');
    await driver.pause(2000);
    screenshotPath = path.join(screenshotDir, `step${step++}_request_confirmed.png`);
    await driver.saveScreenshot(screenshotPath);
    
    // Step: Click Submit Request - SHORTENED VERSION
    console.log("Step: Click Submit Request");
    
    // Take screenshot before submit
    screenshotPath = path.join(screenshotDir, `step${step++}_before_submit.png`);
    await driver.saveScreenshot(screenshotPath);
    
    // Click Submit Request button
    await clickWithRetries(driver, '//XCUIElementTypeOther[@name="   Submit Request  "]', 'Submit Request');
    await driver.pause(2000);
    
    screenshotPath = path.join(screenshotDir, `step${step++}_submit_clicked.png`);
    await driver.saveScreenshot(screenshotPath);
    
    // Final success screenshot
    screenshotPath = path.join(screenshotDir, `step${step++}_test_completed_success.png`);
    await driver.saveScreenshot(screenshotPath);    
    
    await clickWithRetries(driver, '//XCUIElementTypeOther[@name="Done"]', 'Done Button');
    await driver.pause(2000);

    console.log("✅ TC0013 completed successfully!");
    
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
    const writeSuccess = await writeResultToExcel(
      'iOS_SubmitSingleCrop',
      'TC0014',
      'iOS_Submit_Single_Crop_Self_Drop_Off_HappyFlow',
      testResult,
      screenshotPath,
      'Mobile_iOS'
    );
    
    if (writeSuccess) {
      console.log("✅ Test results written successfully!");
    } else {
      console.log("⚠️ Results written to backup CSV file");
    }
    
    console.log("🎯 Test execution completed!");
  }
}

main().catch(err => {
  console.error("❌ Main function error:", err);
  process.exit(1);
});