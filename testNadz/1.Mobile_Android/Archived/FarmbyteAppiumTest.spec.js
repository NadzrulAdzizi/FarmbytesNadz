// Import WebdriverIO for remote automation
import {remote} from 'webdriverio';

async function main () {
  // Define capabilities for the Android device and Appium setup
  const caps = {
    "appium:automationName": "UiAutomator2", // Use UiAutomator2 for Android automation
    "appium:platformName": "Android", // Target Android platform
    "appium:platformVersion": "10", // Specify Android version
    "appium:deviceName": "3ST0219125002726", // Device ID for the target Android device
    "appium:newCommandTimeout": 3600, // Timeout for new commands
    "appium:connectHardwareKeyboard": true // Enable hardware keyboard connection
  };

  // Create a remote WebDriver session with the specified capabilities
  const driver = await remote({
    protocol: "http",
    hostname: "127.0.0.1", // Appium server hostname
    port: 4723, // Appium server port
    path: "/", // Appium server path
    capabilities: caps
  });

  // Launch Chrome browser on the Android device
  const el5 = await driver.$("accessibility id:Chrome");
  await el5.click();

  // Click on the Chrome URL bar
  const el6 = await driver.$("id:com.android.chrome:id/url_bar");
  await el6.click();

  // Enter the target URL in the Chrome URL bar
  await el6.addValue("https://commandcenter-stg.farmbyte.com/login");

  // Click to navigate to the entered URL
  const el7 = await driver.$("id:com.android.chrome:id/line_2");
  await el7.click();

  // Enter the email in the first input field
  const el8 = await driver.$("-android uiautomator:new UiSelector().className(\"android.widget.EditText\").instance(0)");
  await el8.click();
  await el8.addValue("superadmin001@gmail.com");

  // Enter the password in the second input field
  const el9 = await driver.$("-android uiautomator:new UiSelector().className(\"android.widget.EditText\").instance(1)");
  await el9.click();
  await el9.addValue("P@ssw0rd1");

  // Click the "Login" button
  const el10 = await driver.$("-android uiautomator:new UiSelector().text(\"Login\")");
  await el10.click();

  // Click the "Logout" button
  const el11 = await driver.$("-android uiautomator:new UiSelector().text(\"Logout\")");
  await el11.click();

  // Click the second "Logout" button (if applicable)
  const el12 = await driver.$("-android uiautomator:new UiSelector().text(\"Logout\").instance(0)");
  await el12.click();

  // Click the "Login" button again
  const el13 = await driver.$("accessibility id:Login");
  await el13.click();

  // End the WebDriver session
  await driver.deleteSession();
}

// Execute the main function and log any errors
main().catch(console.log);