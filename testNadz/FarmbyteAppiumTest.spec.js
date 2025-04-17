// Import WebdriverIO for remote automation
import {remote} from 'webdriverio';
import { LoginPage } from './pages/LoginPage.js';

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

  try {
    // Create an instance of the LoginPage
    const loginPage = new LoginPage(driver);

    // Perform login
    await loginPage.login(
      "https://commandcenter-stg.farmbyte.com/login",
      "superadmin001@gmail.com",
      "P@ssw0rd1"
    );

    console.log("Login successful!");
  } catch (error) {
    console.error("An error occurred:", error.message);
  } finally {

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