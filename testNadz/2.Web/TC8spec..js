/*
    // Click on Bulk Payment button
    await page.locator('div').filter({ hasText: /^Search by Purchase Order ID \/ Supplier Name$/ }).getByRole('textbox').click();
    await page.locator('div').filter({ hasText: /^Search by Purchase Order ID \/ Supplier Name$/ }).getByRole('textbox').fill('autotest');
    await page.waitForTimeout(100);
    await page.getByRole('button', { name: 'Bulk Payment' }).click();
    await page.waitForTimeout(100);
    await page.getByRole('row', { name: 'PONSN2025-001292 25-07-2025,' }).getByRole('checkbox').check();
    await page.waitForTimeout(100);
    await page.getByRole('button', { name: 'Create Batch' }).click();
    await page.waitForTimeout(100);
    await page.getByRole('button', { name: 'Generate' }).click();

*/

/*
    // Step 6c: Find rows with Batch Status "Pending"
      const pendingRowsLocator = page.locator('tr:has-text("Pending")');
      const pendingRowsCount = await pendingRowsLocator.count();
      console.log(`📋 Found ${pendingRowsCount} quotations with "Batch Pending" status`);

      if (pendingRowsCount > 0) {
    // Get the first pending batch approval for payment row dynamically
    const firstPendingRow = pendingRowsLocator.first();

    // Extract Batch ID from the first column (the link text)
    const batchIdLink = firstPendingRow.locator('td:first-child a').first();
    const batchId = await batchIdLink.textContent();

    console.log(`🎯 Found first pending Batch ID: ${batchId}`);

    // Click on the Batch ID link to open details
    await batchIdLink.click();
    console.log(`✅ Clicked on Batch ID link for pending batch: ${batchId}`);
    await page.waitForTimeout(1000);

        // Get the full "Supplier Name" text from the popup
        const supplierName = await page.locator('text=autotest').textContent();

        // Extract the Batch ID using regex (works for any batch)
        const batchIdMatch = supplierName.match(/autotest\s*(\S+)/);
        if (batchIdMatch) {
          const supplierId = batchIdMatch[1];
          console.log('Supplier ID:', supplierId); // e.g., "autotest666"
        }
      }
      else {
        console.log("No pending batches found.");
      }
*/




          /* // Dynamic approach - Find first pending batch approval for payment
    console.log("Step 6: Finding first pending batch approval for payment dynamically...");

    try {
      // Step 6a: Clear search and filter by supplier name
      console.log("🔍 Filtering by supplier name...");
      
      await page.getByRole('button', { name: 'Reset' }).first().click();
  
      // Clear existing search
      await page.locator('div').filter({ hasText: /^Search by Purchase Order ID \/ Supplier Name$/ }).getByRole('textbox').clear();
      
      // Search for autotest (supplier name filter)
      await page.locator('div').filter({ hasText: /^Search by Purchase Order ID \/ Supplier Name$/ }).getByRole('textbox').fill('autotest');
      await page.waitForTimeout(1000); // Wait for search results to load
      
      screenshotPath = path.join(screenshotsDir, `step${step++}_supplier_filtered.png`);
      await page.screenshot({ path: screenshotPath });
      
      // Step 6b: Wait for table to load with filtered results
      await page.waitForSelector('table tbody tr', { timeout: 10000 });

      // Step 6c: Find rows with "Batch Pending"
      const pendingRows = await page.locator('tr:has-text("Batch Pending")').all();
      console.log(`📋 Found ${pendingRows.length} quotations with "Batch Pending" status`);

      if (pendingRows.length > 0) {
        // Get the first pending batch approval for payment row
        const firstPendingRow = pendingRows[0];

        // Extract PO ID from the first column (assuming it's a link)
        const poIdLink = firstPendingRow.locator('td:first-child a').first();
        const poId = await poIdLink.textContent();

        // Click on Bulk Payment button
        console.log(`✅ Clicked on batch pending approval for payment: ${poId}`);
        await page.getByRole('button', { name: 'Bulk Payment' }).click();
        await page.waitForTimeout(100);
        await page.getByRole('row', { name: poId }).getByRole('checkbox').check();
        await page.waitForTimeout(100);
        await page.getByRole('button', { name: 'Create Batch' }).click();
        await page.waitForTimeout(1000);

        // Get the full "Generating: Batch ..." text from the popup
        const batchText = await page.locator('text=Generating: Batch').textContent();

        // Extract the Batch ID using regex (works for any batch)
        const batchIdMatch = batchText.match(/Generating: Batch\s*(\S+)/);
        if (batchIdMatch) {
          const batchId = batchIdMatch[1];
          console.log('Batch ID:', batchId); // e.g., "POBI000086"
          // Use batchId for further steps
          screenshotPath = path.join(screenshotsDir, `step${step++}_pending_batch_approval_opened.png`);
          await page.screenshot({ path: screenshotPath });
          await page.getByRole('button', { name: 'Generate' }).click();
          await page.waitForTimeout(150);
  
          await page.getByRole('link', { name: 'Bulk Payments Batches' }).click();
          await page.locator('div').filter({ hasText: /^Search by Batch ID$/ }).getByRole('textbox').click();
          await page.locator('div').filter({ hasText: /^Search by Batch ID$/ }).getByRole('textbox').fill(batchId);
          await page.waitForTimeout(10000);
  
          // Find rows with "Pending"
          const pendingRows2 = await page.locator('tr:has-text("Pending")').all();
          console.log(`📋 Found ${pendingRows2.length} quotations with "Pending" status`);
  
          if (pendingRows2.length > 0) {
          // Get the first pending batch approval for payment row
          const firstPendingRow = pendingRows2[0];
  
          // Extract PO ID from the first column (assuming it's a link)
          const poIdLink2 = firstPendingRow.locator('td:first-child a').first();
          const poId = await poIdLink2.textContent();
  
          await poIdLink2.click();
          await page.waitForTimeout(1000);
          await page.getByRole('textbox').nth(3).click();
          await page.getByRole('textbox').nth(3).fill(testData.remarksToDriver);
          await page.waitForTimeout(1000);
          screenshotPath = path.join(screenshotsDir, `step${step++}_remarks_filled.png`);
          await page.screenshot({ path: screenshotPath });
          await page.getByRole('button', { name: 'Complete Batch' }).click();
          }
        }

      } else {
        // Simple fallback - use hardcoded search if no pending found
        console.log("⚠️ No pending batch approval for payment found, using search fallback...");
        
        await page.locator('div').filter({ hasText: /^Search by Purchase Order ID \/ Supplier Name$/ }).getByRole('textbox').click();
        await page.locator('div').filter({ hasText: /^Search by Purchase Order ID \/ Supplier Name$/ }).getByRole('textbox').fill('autotest');
        await page.waitForTimeout(1000);

        // Click first available approval for payment after search
        const firstLink = page.locator('td:first-child a').first();
        const poId = await firstLink.textContent();
        
        // Click on Bulk Payment button
        console.log(`✅ Clicked on batch pending approval for payment: ${poId}`);
        await page.getByRole('button', { name: 'Bulk Payment' }).click();
        await page.waitForTimeout(100);
        await page.getByRole('row', { name: poId }).getByRole('checkbox').check();
        await page.waitForTimeout(100);
        await page.getByRole('button', { name: 'Create Batch' }).click();
        await page.waitForTimeout(1000);
        // Get the full "Generating: Batch ..." text from the popup
        const batchText = await page.locator('text=Generating: Batch').textContent();

        // Extract the Batch ID using regex (works for any batch)
        const batchIdMatch = batchText.match(/Generating: Batch\s*(\S+)/);
        if (batchIdMatch) {
          const batchId = batchIdMatch[1];
          console.log('Batch ID:', batchId); // e.g., "POBI000086"
          // Use batchId for further steps
        }

        screenshotPath = path.join(screenshotsDir, `step${step++}_pending_batch_approval_opened.png`);
        await page.screenshot({ path: screenshotPath });
        await page.getByRole('button', { name: 'Generate' }).click();
        await page.waitForTimeout(150);
      }
      
    } catch (error) {
      console.error("❌ Error finding batch approval for payment:", error.message);
      throw new Error(`Failed to find and open batch approval for payment: ${error.message}`);
    }*/
