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

  const screenshotDir = path.resolve('./screenshots/Mobile_iOS_TC0017A_QRCodeScan');
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


    await clickWithRetries (driver, 'accessibility id:Requests, tab, 2 of 4');
    // Swipe up using modern performActions method
    console.log("Step: Swipe up to reveal more options");
    await driver.performActions([{
      type: 'pointer',
      id: 'finger1',
      parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x: 199, y: 830 },
        { type: 'pointerDown', button: 0 },
        { type: 'pause', duration: 500 },
        { type: 'pointerMove', duration: 1000, x: 196, y: 455 },
        { type: 'pointerUp', button: 0 }
      ]
    }]);
    // Swipe up using modern performActions method
    console.log("Step: Swipe up to reveal more options");
    await driver.performActions([{
      type: 'pointer',
      id: 'finger1',
      parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x: 199, y: 830 },
        { type: 'pointerDown', button: 0 },
        { type: 'pause', duration: 500 },
        { type: 'pointerMove', duration: 1000, x: 196, y: 455 },
        { type: 'pointerUp', button: 0 }
      ]
    }]);
    // Swipe up using modern performActions method
    console.log("Step: Swipe up to reveal more options");
    await driver.performActions([{
      type: 'pointer',
      id: 'finger1',
      parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x: 199, y: 830 },
        { type: 'pointerDown', button: 0 },
        { type: 'pause', duration: 500 },
        { type: 'pointerMove', duration: 1000, x: 196, y: 455 },
        { type: 'pointerUp', button: 0 }
      ]
    }]);
    // Swipe up using modern performActions method
    console.log("Step: Swipe up to reveal more options");
    await driver.performActions([{
      type: 'pointer',
      id: 'finger1',
      parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x: 199, y: 830 },
        { type: 'pointerDown', button: 0 },
        { type: 'pause', duration: 500 },
        { type: 'pointerMove', duration: 1000, x: 196, y: 455 },
        { type: 'pointerUp', button: 0 }
      ]
    }]);
    // Swipe up using modern performActions method
    console.log("Step: Swipe up to reveal more options");
    await driver.performActions([{
      type: 'pointer',
      id: 'finger1',
      parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x: 199, y: 830 },
        { type: 'pointerDown', button: 0 },
        { type: 'pause', duration: 500 },
        { type: 'pointerMove', duration: 1000, x: 196, y: 455 },
        { type: 'pointerUp', button: 0 }
      ]
    }]);
    // Swipe up using modern performActions method
    console.log("Step: Swipe up to reveal more options");
    await driver.performActions([{
      type: 'pointer',
      id: 'finger1',
      parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x: 199, y: 830 },
        { type: 'pointerDown', button: 0 },
        { type: 'pause', duration: 500 },
        { type: 'pointerMove', duration: 1000, x: 196, y: 455 },
        { type: 'pointerUp', button: 0 }
      ]
    }]);
    // Swipe up using modern performActions method
    console.log("Step: Swipe up to reveal more options");
    await driver.performActions([{
      type: 'pointer',
      id: 'finger1',
      parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x: 199, y: 830 },
        { type: 'pointerDown', button: 0 },
        { type: 'pause', duration: 500 },
        { type: 'pointerMove', duration: 1000, x: 196, y: 455 },
        { type: 'pointerUp', button: 0 }
      ]
    }]);
    // Swipe up using modern performActions method
    console.log("Step: Swipe up to reveal more options");
    await driver.performActions([{
      type: 'pointer',
      id: 'finger1',
      parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x: 199, y: 830 },
        { type: 'pointerDown', button: 0 },
        { type: 'pause', duration: 500 },
        { type: 'pointerMove', duration: 1000, x: 196, y: 455 },
        { type: 'pointerUp', button: 0 }
      ]
    }]);
    // Swipe up using modern performActions method
    console.log("Step: Swipe up to reveal more options");
    await driver.performActions([{
      type: 'pointer',
      id: 'finger1',
      parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x: 199, y: 830 },
        { type: 'pointerDown', button: 0 },
        { type: 'pause', duration: 500 },
        { type: 'pointerMove', duration: 1000, x: 196, y: 455 },
        { type: 'pointerUp', button: 0 }
      ]
    }]);
    // Swipe up using modern performActions method
    console.log("Step: Swipe up to reveal more options");
    await driver.performActions([{
      type: 'pointer',
      id: 'finger1',
      parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x: 199, y: 830 },
        { type: 'pointerDown', button: 0 },
        { type: 'pause', duration: 500 },
        { type: 'pointerMove', duration: 1000, x: 196, y: 455 },
        { type: 'pointerUp', button: 0 }
      ]
    }]);
    
    //await clickWithRetries (driver, 'accessibility id:Driver Collect In Progress 26 July 2025 2.00pm-5.00pm 1565, Jalan Bil 52, Port Dickson, Negeri Sembilan 1 items #PONSN2025-001292 RM 380.00');// to be random click if contain #PO
    await clickWithRetries (driver, '(//XCUIElementTypeOther[contains(@name, "#PO")])');
    await clickWithRetries (driver, 'accessibility id:   View Tracking  ');
    await clickWithRetries (driver, '(//XCUIElementTypeOther[@name="Generate QR Code"])[2]')
    await driver.pause(2000);

    console.log("✅ TC0013 completed successfully!");    
    // Final success screenshot
    screenshotPath = path.join(screenshotDir, `QRCode.png`);
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
      'iOS_QRCodeScan',
      'TC0017A',
      'iOS_QRCodeScan_HappyFlow',
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