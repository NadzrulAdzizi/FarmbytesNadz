import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test('Scan Quotation Status for Pending', async ({ page }) => {
  let screenshotPath = '';
  const screenshotsDir = path.resolve('./screenshots/quotation_status_scan');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  let step = 1;
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
  await page.locator('input[type="email"]').press('Tab');
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
  // Navigate to Purchase Orders > Quotation
  console.log("Step 5: Navigate to Purchase Orders > Quotation");
  await page.waitForTimeout(3000);
  await page.locator('div').filter({ hasText: /^Purchase Orders$/ }).first().click();
  await page.waitForTimeout(1000);
  await page.getByRole('link', { name: 'Quotation' }).click();
  await page.waitForTimeout(1000);
  screenshotPath = path.join(screenshotsDir, `step${step++}_quotation_page_loaded.png`);
  await page.screenshot({ path: screenshotPath });
  // Select Quotation Pending filter
  await page.getByRole('combobox').filter({ hasText: 'Quotation Status' }).click();
  await page.getByRole('option', { name: 'Quotation Pending' }).click();
  await page.waitForTimeout(1000);
  let pageNum = 1;
  let passCount = 0;
  while (true) {
    console.log(`Scanning page ${pageNum}...`);
    // Only count visible rows
    const rows = await page.locator('table tbody tr:visible').all();
    for (const row of rows) {
      const status = await row.locator('td').nth(2).textContent(); // Adjust index if needed
      if (status && status.trim().toLowerCase() === 'quotation pending') {
        console.log(`Quotation Status: Quotation Pending - PASS`);
        passCount++;
      }
    }
    // Pagination: always try to go to next page until disabled
    try {
      const nextBtn = page.locator('button[aria-label="Go to next page"], button:has-text(">")');
      const prevBtn = page.locator('button[aria-label="Go to previous page"], button:has-text("<")');
      if (await nextBtn.count() === 0) {
        console.log('Next page button not found.');
        break;
      }
      if (await nextBtn.isVisible() && await nextBtn.isEnabled()) {
        await nextBtn.click();
        await page.waitForTimeout(70);
        pageNum++;
        // After clicking, check if nextBtn is now disabled (last page)
        if (await nextBtn.isVisible() && (await prevBtn.isEnabled())) {
          await nextBtn.count();
          await page.waitForTimeout(90);
          pageNum++;
        }
      } else {
        console.log('Next page button is not enabled or not visible.');
        break;
      }
    } catch (err) {
      console.error('Error navigating to next page:', err);
      break;
    }
  }
  console.log(`Total PASS (Quotation Pending): ${passCount}`);
  }
);
