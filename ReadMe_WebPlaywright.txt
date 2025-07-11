FarmbyteWebTest.spec.js
This script automates the login, navigation, and logout process for the Farmbyte web application using Playwright. It is designed to run on a Chromium browser.

Prerequisites
Node.js:

Ensure Node.js is installed on your system.
Verify installation:
Playwright:

Install Playwright:
Install the required browsers:
Script Workflow
Launch Browser:

Opens the Chromium browser in non-headless mode.
Navigate to Login Page:

Opens the URL: https://commandcenter-stg.farmbyte.com/login.
Login:

Enters the email: superadmin001@gmail.com.
Enters the password: P@ssw0rd1.
Clicks the "Login" button.
Navigation:

Navigates to the "Supplier Management" section.
Navigates to the "System Administration" section.
Clicks on the "Admin Management" link.
Dropdown Selections:

Selects "Terengganu" and "Johor" in the "States" dropdown.
Selects "create," "baru," and "All" in the "Department" dropdown.
Selects "All" in the "Role" dropdown.
Role Management:

Selects "delete_admin" and "administrator" in the roles dropdown.
Logout:

Clicks the "Logout" button.
Handles multiple logout buttons if applicable.
Returns to the login page.
Close Browser:

Closes the browser context and the browser.
How to Run
Open the terminal in the project directory.
Run the test script using Playwright:
Code Explanation
Browser Launch:
Launches Chromium in non-headless mode for debugging purposes.
Element Locators:
Uses locator, getByRole, and filter to interact with elements.
Actions:
Performs actions like click, fill, and press to interact with the web application.
Dependencies
Node.js
Playwright
Troubleshooting
Playwright Not Installed:

Install Playwright and required browsers:
Element Not Found:

Verify the element locators using Playwright's codegen tool:
Browser Not Launching:

Ensure the Chromium browser is installed:
Authentication Issues:

Verify the email and password credentials are correct.
Contact
For further assistance, contact the developer or refer to the official Playwright documentation.

