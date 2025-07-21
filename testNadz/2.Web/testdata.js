export function generateUniqueTestData() {
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 1000);
  
  return {
    
    //Web Admin Data
    autotestUsername: "autotest829", 

  };
}

export async function getLatestUser(page) {
  console.log("🔍 Searching for latest auto-generated user...");
  
  try {
    // Method 1: Get users from Excel files (both Individual and Company signup tests)
    const excelSources = [
      {
        path: path.join(process.cwd(), 'AutoReg_FBG2.0_Happy_Flow_E2E_Mobile.xlsx'),
        sheet: 'Mobile_Test_Results',
        testCodes: ['TC001', 'TC005'] // Individual and Company signup
      },
      {
        path: path.join(process.cwd(), 'AutoReg_FBG2.0_Happy_Flow_E2E_Web.xlsx'),
        sheet: 'WEB_Test_Results',
        testCodes: ['TC001', 'TC005']
      }
    ];
    
    let latestUsers = [];
    
    for (const source of excelSources) {
      try {
        if (fs.existsSync(source.path)) {
          const workbook = XLSX.readFile(source.path);
          
          if (workbook.Sheets[source.sheet]) {
            const worksheet = workbook.Sheets[source.sheet];
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            console.log(`📊 Reading from ${source.path} - Found ${data.length} rows`);
            
            // Find successful signups from latest to oldest
            for (let i = data.length - 1; i >= 1; i--) {
              const row = data[i];
              
              // Check if this row contains a successful signup test
              if (row[1] && source.testCodes.some(tc => row[1].includes(tc)) && row[4] === 'PASS') {
                
                // Look for email/username in different columns
                for (let col = 0; col < row.length; col++) {
                  const cellValue = row[col];
                  
                  if (cellValue && typeof cellValue === 'string') {
                    // Check for email pattern
                    if (cellValue.includes('@') && cellValue.includes('.')) {
                      const username = cellValue.split('@')[0];
                      console.log(`✅ Found user from Excel: ${username} (from ${source.sheet})`);
                      
                      latestUsers.push({
                        username: username,
                        timestamp: row[3] || new Date(), // Use timestamp column or current date
                        source: source.sheet,
                        testCode: row[1]
                      });
                    }
                    // Check for auto-generated username patterns
                    else if (cellValue.match(/^(auto|test|user)\w*\d+$/i)) {
                      console.log(`✅ Found auto-generated user: ${cellValue} (from ${source.sheet})`);
                      
                      latestUsers.push({
                        username: cellValue,
                        timestamp: row[3] || new Date(),
                        source: source.sheet,
                        testCode: row[1]
                      });
                    }
                  }
                }
              }
            }
          }
        }
      } catch (excelError) {
        console.log(`⚠️ Could not read from ${source.path}: ${excelError.message}`);
      }
    }
    
    // Sort by timestamp and return the most recent
    if (latestUsers.length > 0) {
      latestUsers.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const mostRecent = latestUsers[0];
      console.log(`🎯 Most recent user: ${mostRecent.username} from ${mostRecent.source} (${mostRecent.testCode})`);
      return mostRecent.username;
    }
    
  } catch (excelError) {
    console.log("⚠️ Excel method failed, trying live search on page");
  }
  
  // Method 2: Search for auto-generated patterns on the current page
  try {
    console.log("🔄 Searching for auto-generated users on page...");
    
    // First, try to get all visible users from the page
    await page.goto(page.url()); // Refresh to ensure clean state
    await page.waitForTimeout(2000);
    
    // Search with empty query to see all users
    try {
      const searchBox = await page.getByRole('textbox').first();
      await searchBox.click();
      await searchBox.fill(''); // Clear to show all users
      await page.waitForTimeout(2000);
      
      // Look for table cells or user elements
      const userElements = await page.locator('td, .user-item, [data-testid*="user"]').all();
      
      const foundUsers = [];
      for (const element of userElements) {
        try {
          const text = await element.textContent();
          
          if (text && text.match(/^(auto|test|user)\w*\d+$/i)) {
            foundUsers.push(text.trim());
            console.log(`📱 Found user on page: ${text.trim()}`);
          }
        } catch (elementError) {
          continue;
        }
      }
      
      if (foundUsers.length > 0) {
        // Sort by number suffix to get the latest
        foundUsers.sort((a, b) => {
          const numA = parseInt(a.match(/\d+$/)?.[0] || '0');
          const numB = parseInt(b.match(/\d+$/)?.[0] || '0');
          return numB - numA; // Descending order
        });
        
        console.log(`✅ Found ${foundUsers.length} users on page, latest: ${foundUsers[0]}`);
        return foundUsers[0];
      }
      
    } catch (pageSearchError) {
      console.log(`❌ Page search failed: ${pageSearchError.message}`);
    }
    
  } catch (liveSearchError) {
    console.log("⚠️ Live search failed, trying pattern generation");
  }
  
  // Method 3: Generate based on current patterns and test what exists
  try {
    console.log("🔄 Testing auto-generated patterns...");
    
    const now = new Date();
    const timestamp = now.getTime().toString().slice(-6); // Last 6 digits
    const dateStr = now.toISOString().slice(5, 10).replace('-', ''); // MMDD
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    
    // Generate comprehensive list of possible auto-generated usernames
    const possiblePatterns = [];
    
    // Pattern 1: autotest + numbers
    for (let i = 999; i >= 600; i--) { // Test from high to low numbers
      possiblePatterns.push(`autotest${i}`);
    }
    
    // Pattern 2: test + timestamp variations
    possiblePatterns.push(`test${timestamp}`);
    possiblePatterns.push(`user${timestamp}`);
    possiblePatterns.push(`auto${timestamp}`);
    
    // Pattern 3: Date-based patterns
    possiblePatterns.push(`autotest${dateStr}`);
    possiblePatterns.push(`test${dateStr}`);
    possiblePatterns.push(`user${dateStr}`);
    
    // Pattern 4: Day of year patterns
    possiblePatterns.push(`autotest${dayOfYear}`);
    possiblePatterns.push(`test${dayOfYear}`);
    
    console.log(`🔄 Testing ${Math.min(possiblePatterns.length, 50)} patterns...`);
    
    // Test each pattern by actually searching for it
    for (let i = 0; i < Math.min(possiblePatterns.length, 50); i++) {
      const username = possiblePatterns[i];
      
      try {
        console.log(`🔍 Testing pattern ${i + 1}/50: ${username}`);
        
        const searchBox = await page.getByRole('textbox').first();
        await searchBox.click();
        await searchBox.fill(''); // Clear first
        await searchBox.fill(username);
        await page.waitForTimeout(1000);
        
        // Check if user appears in results
        const userExists = await page.locator(`td:has-text("${username}"), .user-item:has-text("${username}")`).isVisible({ timeout: 2000 });
        
        if (userExists) {
          console.log(`✅ Found existing auto-generated user: ${username}`);
          return username;
        }
        
      } catch (testError) {
        continue;
      }
    }
    
  } catch (patternError) {
    console.log("⚠️ Pattern testing failed");
  }
  
  // Method 4: Ultimate fallback - use most likely current pattern
  const now = new Date();
  const todayNumber = now.getDate() + (now.getMonth() + 1) * 31; // Simple date-based number
  const fallbackUser = `autotest${todayNumber}`;
  
  console.log(`⚠️ All methods failed, using calculated fallback: ${fallbackUser}`);
  return fallbackUser;
}

// Method to verify user exists before proceeding
async function verifyAndSelectUser(page, username) {
  console.log(`🔍 Verifying and selecting user: ${username}`);
  
  try {
    // Search for the user
    const searchBox = await page.getByRole('textbox').first();
    await searchBox.click();
    await searchBox.fill('');
    await searchBox.fill(username);
    await page.waitForTimeout(2000);
    
    // Check if user exists in results
    const userCell = page.locator(`td:has-text("${username}"), .user-item:has-text("${username}")`);
    
    if (await userCell.isVisible({ timeout: 3000 })) {
      console.log(`✅ User ${username} found and visible`);
      await userCell.click();
      return true;
    } else {
      console.log(`❌ User ${username} not found in search results`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Error verifying user ${username}: ${error.message}`);
    return false;
  }
}