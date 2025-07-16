import { remote } from 'webdriverio';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { generateUniqueSignUpTestData } from './TestData_Individual_SignUp.js';

async function writeResultToExcel(moduleid, tcId, testScenario, result, screenshotPath, sheetName = 'Mobile_User_Onboarding') {
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

  const screenshotDir = path.resolve('./screenshots/Mobile_Android_SignUp');
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

    // Generate unique test data automatically - this will be shared across tests
    const testData = generateUniqueSignUpTestData();
    console.log("🔄 Auto-generated SignUp test data:", testData);

    // Step 1: Launch app
    console.log("Step 1: Launch app");
    await (await driver.$("accessibility id:FarmByte Grow Staging")).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_launch_app.png`));

    // Step 2: Sign Up → Sign up with Email
    console.log("Step 2: Navigate to Sign Up");
    await (await driver.$("-android uiautomator:new UiSelector().text(\"Sign Up\")")).click();
    await driver.pause(1000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_signup_page.png`));
    
    await (await driver.$("-android uiautomator:new UiSelector().text(\"Sign up with Email\")")).click();
    await driver.pause(1000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_signup_with_email.png`));

    // Step 3: Fill sign-up form with auto-generated data
    console.log("Step 3: Fill sign-up form");
    
    // Fill username - AUTO-GENERATED!
    await (await driver.$("-android uiautomator:new UiSelector().className(\"android.widget.EditText\").instance(0)")).addValue(testData.username);
    await driver.pause(500);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_username_filled.png`));
    
    // Fill email - AUTO-GENERATED!
    await (await driver.$("-android uiautomator:new UiSelector().className(\"android.widget.EditText\").instance(1)")).addValue(testData.email);
    await driver.pause(500);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_email_filled.png`));
    
    // Scroll down
    await driver.action('pointer')
      .move({ duration: 0, x: 759, y: 1199 })
      .down({ button: 0 })
      .move({ duration: 1000, x: 748, y: 509 })
      .up({ button: 0 })
      .perform();
    await driver.pause(1000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_after_scroll.png`));
    
    // Fill phone number - AUTO-GENERATED!
    await (await driver.$("-android uiautomator:new UiSelector().text(\"Phone Number\")")).addValue(testData.phoneNumber);
    await driver.pause(500);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_phone_filled.png`));
    
    // Fill password
    await (await driver.$("-android uiautomator:new UiSelector().className(\"android.widget.EditText\").instance(3)")).addValue(testData.password);
    await driver.pause(500);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_password_filled.png`));
    
    // Fill confirm password
    await (await driver.$("-android uiautomator:new UiSelector().className(\"android.widget.EditText\").instance(4)")).addValue(testData.confirmPassword);
    await driver.pause(500);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_confirm_password_filled.png`));
    
    // Click to hide keyboard and continue
    await (await driver.$("-android uiautomator:new UiSelector().text(\"Your password must contain:\")")).click();
    await driver.pause(1000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_form_completed.png`));
    
    await (await driver.$("-android uiautomator:new UiSelector().text(\"•••••••••\").instance(0)")).click();
    await (await driver.$("-android uiautomator:new UiSelector().text(\"Password Strength:  Strong\")")).click();
    await (await driver.$("-android uiautomator:new UiSelector().text(\"Your password must contain:\")")).click();
    await (await driver.$("accessibility id:   Continue  ")).click();
    await driver.pause(3000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_continue_clicked.png`));

    // Step 4: Switch to Discord
    console.log("Step 4: Switch to Discord");
    await driver.execute('mobile: pressKey', { keycode: 3 }); // HOME
    await driver.pause(1000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_home_screen.png`));
    
    await (await driver.$("accessibility id:Discord")).click();
    await driver.pause(3000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_discord_opened.png`));

    // Step 5: Extract latest OTP robustly
    console.log("Step 5: Extract OTP from Discord");
    const otpMessageEls = await driver.$$('android=new UiSelector().textContains("Your one-time password is")');
    if (otpMessageEls.length === 0) throw new Error("No OTP message found.");
    const latestOtpMessageEl = otpMessageEls[otpMessageEls.length - 1];
    const fullText = await latestOtpMessageEl.getText();
    const otpMatch = fullText.match(/\b\d{4,6}\b/);
    if (!otpMatch) throw new Error("OTP not found in message.");
    const otpDigits = otpMatch[0].split("");
    console.log("Extracted OTP:", otpDigits.join(""));
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_otp_extracted.png`));

    // Step 6: Switch back to your app
    console.log("Step 6: Switch back to app");
    await driver.execute('mobile: pressKey', { keycode: 3 }); // HOME
    await driver.pause(1000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_home_screen_2.png`));
    
    await (await driver.$("accessibility id:FarmByte Grow Staging")).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_app_reopened.png`));

    // Step 7: Try to fill OTP by tapping first box and sending all digits
    console.log("Step 7: Fill OTP");
    const otpBoxes = await driver.$$('android=new UiSelector().resourceId("otp-input-stick")');
    console.log(`Found ${otpBoxes.length} otp-input-stick boxes`);
    let filled = false;
    if (otpBoxes.length > 0) {
      await otpBoxes[0].click();
      await driver.pause(300);
      await driver.keys(otpDigits.join(""));
      await driver.pause(1000);
      await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_otp_filled.png`));
      console.log("✅ OTP entered by tapping first box and sending all digits.");
      filled = true;
    }

    // If not filled, try EditText
    if (!filled) {
      const allEditTexts = await driver.$$('android.widget.EditText');
      console.log(`Found ${allEditTexts.length} EditText fields`);
      if (allEditTexts.length > 0) {
        await allEditTexts[0].setValue(otpDigits.join(""));
        await driver.pause(1000);
        await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_otp_filled_edittext.png`));
        console.log("✅ OTP entered in the main EditText.");
        filled = true;
      }
    }

    // If still not filled, try sending the whole OTP globally
    if (!filled) {
      await driver.keys(otpDigits.join(""));
      await driver.pause(1000);
      await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_otp_filled_keys.png`));
      console.log("✅ OTP sent using driver.keys.");
    }

    // If still not filled, debug all elements
    if (!filled) {
      const allElements = await driver.$$('//*');
      console.log(`Found ${allElements.length} elements on screen`);
      for (let i = 0; i < allElements.length; i++) {
        try {
          const className = await allElements[i].getAttribute('class');
          const resourceId = await allElements[i].getAttribute('resource-id');
          console.log(`Element ${i}: class=${className}, resource-id=${resourceId}`);
        } catch (e) {}
      }
      throw new Error("No OTP input method worked. See above for possible input classes.");
    }

    // Step 8: Click Verify
    console.log("Step 8: Click Verify");
    await (await driver.$("-android uiautomator:new UiSelector().text(\"   Verify  \")")).click();
    await driver.pause(2000);
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_verify_clicked.png`));

    console.log("✅ Test completed successfully!");
    await driver.saveScreenshot(path.join(screenshotDir, `step${step++}_final_success.png`));

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
      'Sign_Up_Individual',
      'TC001',
      'Mobile_SignUp_Individual_PositiveFlow',
      testResult,
      screenshotPath,
      'Mobile_User_Onboarding'
    );
  }
}

main();