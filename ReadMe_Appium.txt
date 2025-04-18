FarmbyteAppiumTest.spec.js
This script automates the login and logout process for the Farmbyte application using WebdriverIO and Appium. It is designed to run on an Android device with the Chrome browser.

Prerequisites
Node.js:

Ensure Node.js is installed on your system.
Verify installation:
Appium:

Install Appium globally:
Start the Appium server:
Android Device:

Connect an Android device via USB or use an emulator.
Ensure the device is in developer mode and USB debugging is enabled.
Verify the device is connected:
Chrome Browser:

Ensure the Chrome browser is installed on the Android device.
WebdriverIO:

Install WebdriverIO:
Capabilities
The script uses the following capabilities to configure the Appium session:

Automation Name: UiAutomator2
Platform Name: Android
Platform Version: 10
Device Name: 3ST0219125002726
New Command Timeout: 3600
Hardware Keyboard: Enabled
Script Workflow
Launch Chrome:

Opens the Chrome browser on the Android device.
Navigate to Login Page:

Enters the URL: https://commandcenter-stg.farmbyte.com/login.
Login:

Enters the email: superadmin001@gmail.com.
Enters the password: P@ssw0rd1.
Clicks the "Login" button.
Logout:

Clicks the "Logout" button.
Handles multiple logout buttons if applicable.
Re-login:

Clicks the "Login" button again.
End Session:

Closes the WebDriver session.
How to Run
Start the Appium server:

Run the script using Node.js:

Code Explanation
Capabilities:
Configures the Android device and Appium session.
Element Locators:
Uses accessibility id, id, and UiSelector to locate elements.
Actions:
Performs actions like click, addValue, and deleteSession.
Dependencies
Node.js
Appium
WebdriverIO
Troubleshooting
Device Not Found:

Ensure the device is connected and recognized by ADB:
Appium Server Not Running:

Start the Appium server:
Element Not Found:

Verify the element locators using Appium Inspector or UIAutomatorViewer.
ChromeDriver Version Mismatch:

Ensure the ChromeDriver version matches the Chrome browser version on the device.
Contact
For further assistance, contact the developer or refer to the official documentation for WebdriverIO and Appium.

