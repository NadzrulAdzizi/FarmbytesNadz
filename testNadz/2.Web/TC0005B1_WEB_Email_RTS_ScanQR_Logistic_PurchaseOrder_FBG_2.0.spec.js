import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
// Remove static import for Jimp
import QrCode from 'qrcode-reader';
import { generateUniqueTestData, writeResultToExcel } from './testdata.js';

// Function to scan QR code from image
async function scanQRCodeFromImage(imagePath) {
  const JimpModule = await import('jimp');
  const image = await (JimpModule.Jimp ? JimpModule.Jimp.read(imagePath) : JimpModule.read(imagePath));
  return new Promise((resolve, reject) => {
    const qr = new QrCode();
    qr.callback = (err, value) => {
      if (err) return reject(err);
      resolve(value ? value.result : null);
    };
    qr.decode(image.bitmap);
  });
}

test('Web ScanQR Logistic Test', async ({ page }) => {
  const Data = generateUniqueTestData();
  let testResult = 'PASS';
  let screenshotPath = '';
  
  // Create screenshots directory
  const screenshotsDir = path.resolve('./screenshots/web_ScanQR_Logistic');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  let step = 1;
  
  const timestamp = new Date().toLocaleString();
  console.log(`🕐 Test started at: ${timestamp}`);

  try {
    // Step 1: Navigate to login page
    console.log("Step 1: Navigate to login page");
    await page.goto('https://commandcenter-stg.farmbyte.com/login');
    await page.waitForLoadState('networkidle');
    screenshotPath = path.join(screenshotsDir, `step${step++}_login_page.png`);
    await page.screenshot({ path: screenshotPath });

    // Step 2: Fill email
    console.log("Step 2: Fill email");
    await page.locator('input[type="email"]').click();
    await page.locator('input[type="email"]').fill('superadmin001@gmail.com');
    await page.waitForTimeout(1000);
    screenshotPath = path.join(screenshotsDir, `step${step++}_email_filled.png`);
    await page.screenshot({ path: screenshotPath });

    // Step 3: Fill password
    console.log("Step 3: Fill password");
    await page.locator('input[type="password"]').click();
    await page.locator('input[type="password"]').fill('P@ssw0rd1');
    await page.waitForTimeout(1000);
    screenshotPath = path.join(screenshotsDir, `step${step++}_password_filled.png`);
    await page.screenshot({ path: screenshotPath });

    // Step 4: Click login button
    console.log("Step 4: Click login button");
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForLoadState('networkidle');
    screenshotPath = path.join(screenshotsDir, `step${step++}_after_login.png`);
    await page.screenshot({ path: screenshotPath });

    // Step 7: Scan QR code from image and navigate to the link
    console.log("Step 7: Scan QR code from image and navigate to the link...");
    const qrImagePath = path.resolve('/Users/adlanelias/Documents/Nadz/VSCode/FarmbytesNadz-1/testNadz/3.Mobile_iOS/screenshots/Mobile_iOS_TC0017A_QRCodeScan/QRCode.png');
    try {
      const qrLink = await scanQRCodeFromImage(qrImagePath);
      if (qrLink) {
        console.log('QR Code Link:', qrLink);
        // Navigate to the scanned QR code link
        await page.goto(qrLink);
        await page.waitForLoadState('networkidle');
        screenshotPath = path.join(screenshotsDir, `step${step++}_qr_link_navigated.png`);
        await page.screenshot({ path: screenshotPath });
      } else {
        console.log('No QR code found in the image.');
      }
    } catch (scanErr) {
      console.error('Error scanning QR code:', scanErr);
    }
    await page.waitForTimeout(1000);
    // Final screenshot
    screenshotPath = path.join(screenshotsDir, `step${step++}_test_completed.png`);
    await page.screenshot({ path: screenshotPath });
    

    // Find the index of the "Est. QTY" column
    const headers = await page.locator('table th').allTextContents();
    const estQtyIndex = headers.findIndex(h => h.trim().toLowerCase() === 'est. qty');

    // Loop through all rows and get the Est. QTY value for each
    const rows = await page.locator('table tbody tr').all();
    for (const row of rows) {
    const estQtyValue = await row.locator('td').nth(estQtyIndex).textContent();
    console.log('Est. QTY:', estQtyValue);
    await page.getByRole('spinbutton').click();
    await page.getByRole('spinbutton').fill(estQtyValue);//automated amount must same as Est. QTY
    }
    //await page.locator('div').filter({ hasText: /^Upload or take a photo$/ }).click();
    await page.waitForTimeout(1000);
    screenshotPath = path.join(screenshotsDir, `step${step++}_file_selected.png`);
    await page.screenshot({ path: screenshotPath });
    await page.locator('input[type="file"][accept="image/*"]').setInputFiles('/Users/adlanelias/Downloads/Naz-Pic.jpeg');    
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('textbox', { name: 'Remarks (optional)' }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('textbox', { name: 'Remarks (optional)' }).fill(Data.remarksToDriver);
    await page.waitForTimeout(1000);
    screenshotPath = path.join(screenshotsDir, `step${step++}_remarks_filled.png`);
    await page.screenshot({ path: screenshotPath });
    await page.getByRole('button', { name: 'Submit' }).nth(1).click();
    await page.waitForTimeout(1000);

    console.log("✅ Test completed successfully!");

  } catch (error) {
    testResult = 'FAIL';
    console.error("❌ Error occurred:", error.message);
    
    // Take error screenshot
    if (page) {
      try {
        screenshotPath = path.join(screenshotsDir, `step${step++}_error.png`);
        await page.screenshot({ path: screenshotPath });
        console.log(`📸 Error screenshot saved: ${screenshotPath}`);
      } catch (screenshotError) {
        console.error("❌ Failed to take error screenshot:", screenshotError.message);
      }
    }
    
    throw error; // Re-throw to fail the test
  }
  
  console.log("🎯 Test execution completed!");
  console.log(`📋 Final result: ${testResult}`);

  // Write results to Excel/CSV/JSON/Text
  try {
    const success = await writeResultToExcel(
      'WEB_ScanQR_Logistic',
      'TC0005B1',
      'Web_Email_RTS_ScanQR_Logistic_PurchaseOrder',
      timestamp,
      testResult,
      screenshotPath
    );
    if (success) {
      console.log('✅ Test results written successfully!');
    } else {
      console.log('⚠️ Results written to backup file');
    }
  } catch (writeError) {
    console.error('❌ Error writing test results:', writeError.message);
  }
});