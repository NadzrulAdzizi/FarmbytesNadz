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
  performSwipe
} from './TestData_iOS_SignUp.js';

async function main() {
  const caps = {
    "appium:platformName": "iOS",
    "appium:automationName": "XCUITest",
    "appium:deviceName": "nadzrul's iPhone",
    "appium:platformVersion": "18.5",
    "appium:udid": "00008130-000165AC3E79001C",
  };

  const screenshotDir = path.resolve('./screenshots/Mobile_iOS_TC0013_SubmitSingleCrop');
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

    // Step 6: Fill value
    console.log("Step 6: Fill Value");
    await fillTextWithRetries(driver, '//XCUIElementTypeTextField[@value="Enter Value"]', "200", 'Value Field');// to automatically fill the value
    await driver.pause(1000);
    await clickWithRetries(driver, '~Done', 'Done button');
    screenshotPath = path.join(screenshotDir, `step${step++}_value_filled.png`);
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

    // Step 8: Click View Request
    console.log("Step 8: Click View Request");
    await clickWithRetries(driver, '(//XCUIElementTypeOther[@name="View request  1 items RM 380.00"])[2]');
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_view_request_clicked.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 9: Click on Driver Collect
    console.log("Step 9: Click on Driver Collect");
    await clickWithRetries(driver, '//XCUIElementTypeOther[@name="Driver Collect"]', 'Driver Collect Option');
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_driver_collect_selected.png`);
    await driver.saveScreenshot(screenshotPath);

    // Step 10: Click on Select Date & Time
    console.log("Step 10: Select Date & Time");
    await clickWithRetries(driver, '//XCUIElementTypeOther[@name=" Select date & time"]');
    await driver.pause(1000);
    await clickWithRetries(driver, '//XCUIElementTypeButton[@name="undefined.day_2025-07-26"]', 'Select Date');// Select next available date automatically
    await driver.pause(1000);
    await clickWithRetries(driver, '//XCUIElementTypeOther[@name="02:00PM - 05:00PM"]', 'Select Time Slot');
    await driver.pause(1000);
    screenshotPath = path.join(screenshotDir, `step${step++}_datetime_selected.png`);
    await driver.saveScreenshot(screenshotPath);
    
    await clickWithRetries(driver, '(//XCUIElementTypeOther[@name="Horizontal scroll bar, 1 page"])[5]');
    await driver.pause(2000);

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
      'TC0013',
      'iOS_Submit_Single_Crop_Driver_Collect_HappyFlow',
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