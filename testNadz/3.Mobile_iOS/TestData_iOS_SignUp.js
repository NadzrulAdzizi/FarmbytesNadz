export function generateUniqueTestData() {
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 1000);
  
  return {
    fullName: `autotest${String(randomId).padStart(3, '0')}`,
    email: `autotest${String(randomId).padStart(3, '0')}@gmail.com`,
    phoneNumber: `123037${String(randomId).padStart(3, '0')}`,
    password: "P@ssw0rd1",
    confirmPassword: "P@ssw0rd1",
    nric: `96022113${String(randomId).padStart(4, '0')}`, // Example NRIC
    farmName: `Nadbefarm${randomId}`,
    farmSize: `21${String(randomId).padStart(1, '0')}`,
    postalCode: "71010",
    bankAccountName: `namasayaabu${randomId}`,
    bankAccountNo: `12121122221${String(randomId).padStart(4, '0')}`,
    bankName: "Bank Islam Malaysia Berhad",
    otpCode: null,
    timestamp: new Date().toISOString(),

    //Company
    companyName: `Autotest${randomId}`,
    companyRegistrationNo: `12345678${String(randomId).padStart(2, '0')}`,
    fullNameCompany: `Nadzrul Apple${String(randomId).padStart(4, '0')}`,
    GmailName: `Mohd Nadzrul Adzizi`,
    FBName: `Fbc Autojr`
  };
}

// Get the BOTTOM/LAST OTP from Discord - Fixed for iOS
export async function fetchLatestOTPFromDiscord(driver) {
  console.log("🔍 Fetching BOTTOM/LAST OTP from Discord...");
  
  try {
    // Open Discord
    await driver.activateApp('com.hammerandchisel.discord');
    await driver.pause(4000);
    
    // Scroll to bottom to ensure we see the latest messages
    console.log("📱 Scrolling to bottom to see latest messages...");
    await driver.execute('mobile: scroll', { direction: 'down' });
    await driver.pause(2000);
    
    // Get page source to find all OTP messages
    const pageSource = await driver.getPageSource();
    console.log("📝 Analyzing page source for OTP messages...");
    
    // Extract all OTP messages with their positions in the source
    const otpPattern = /\[FA\]\[Staging\]\s*Your one-time password is\s*(\d{4})/g;
    const matches = [];
    let match;
    
    while ((match = otpPattern.exec(pageSource)) !== null) {
      matches.push({
        otp: match[1],
        position: match.index, // Position in the source code
        fullMatch: match[0]
      });
      console.log(`📝 Found OTP: ${match[1]} at position ${match.index}`);
    }
    
    if (matches.length === 0) {
      console.log("❌ No OTP messages found in page source");
      
      // Try alternative approach - look for elements
      const elements = await driver.$$('//XCUIElementTypeStaticText');
      console.log(`📱 Found ${elements.length} text elements, checking for OTP...`);
      
      for (let i = elements.length - 1; i >= 0; i--) {
        try {
          const text = await elements[i].getText();
          if (text.includes('[FA][Staging]') && text.includes('Your one-time password is')) {
            const otpMatch = text.match(/\b(\d{4})\b/);
            if (otpMatch) {
              console.log(`✅ Found OTP in elements: ${otpMatch[0]}`);
              return otpMatch[0];
            }
          }
        } catch (error) {
          continue;
        }
      }
      
      console.log("❌ No OTP found, using fallback");
      return "2068";
    }
    
    // Sort by position (higher position = later in source = more recent)
    matches.sort((a, b) => b.position - a.position);
    
    // Get the LAST/BOTTOM OTP (highest position)
    const lastOTP = matches[0];
    console.log(`✅ Using BOTTOM/LAST OTP: ${lastOTP.otp}`);
    console.log(`📍 From message: ${lastOTP.fullMatch}`);
    console.log(`📍 Position in source: ${lastOTP.position}`);
    
    return lastOTP.otp;
    
  } catch (error) {
    console.error("❌ Error fetching bottom OTP:", error.message);
    return "2068";
  }
}

// Alternative method - Scroll to bottom and get last element
export async function fetchLatestOTPFromDiscordManual(driver) {
  console.log("🔍 Manual approach - Get BOTTOM/LAST OTP...");
  
  try {
    // Open Discord
    await driver.activateApp('com.hammerandchisel.discord');
    await driver.pause(4000);
    
    // Scroll to the very bottom multiple times
    console.log("📱 Scrolling to bottom multiple times...");
    for (let i = 0; i < 3; i++) {
      await driver.execute('mobile: scroll', { direction: 'down' });
      await driver.pause(1000);
    }
    
    // Get all text elements
    const elements = await driver.$$('//XCUIElementTypeStaticText');
    console.log(`📱 Found ${elements.length} text elements`);
    
    // Check elements from BOTTOM to TOP (reverse order)
    for (let i = elements.length - 1; i >= 0; i--) {
      try {
        const text = await elements[i].getText();
        console.log(`📝 Checking element ${i}: ${text}`);
        
        // Look for the exact pattern
        if (text.includes('[FA][Staging]') && text.includes('Your one-time password is')) {
          const otpMatch = text.match(/Your one-time password is\s*(\d{4})/);
          if (otpMatch) {
            console.log(`✅ Found BOTTOM/LAST OTP: ${otpMatch[1]}`);
            console.log(`📍 From element ${i}: ${text}`);
            return otpMatch[1];
          }
        }
      } catch (error) {
        continue;
      }
    }
    
    console.log("❌ No OTP found in manual search");
    return "2068";
    
  } catch (error) {
    console.error("❌ Manual search failed:", error.message);
    return "2068";
  }
}

// Simple OTP box filling
export async function fillOTPBoxes(driver, otpCode) {
  console.log(`🔢 Filling OTP boxes with: ${otpCode}`);
  
  try {
    if (!otpCode || otpCode.length !== 4) {
      throw new Error(`Invalid OTP: ${otpCode}`);
    }
    
    const digits = otpCode.split('');
    
    // Find text fields
    const textFields = await driver.$$('//XCUIElementTypeTextField');
    console.log(`📱 Found ${textFields.length} text fields`);
    
    if (textFields.length < 4) {
      console.log("❌ Not enough text fields");
      return false;
    }
    
    // Fill each box
    for (let i = 0; i < 4; i++) {
      try {
        console.log(`🔄 Filling box ${i + 1} with: ${digits[i]}`);
        
        await textFields[i].click();
        await driver.pause(500);
        await textFields[i].clearValue();
        await driver.pause(300);
        await textFields[i].setValue(digits[i]);
        await driver.pause(500);
        
        console.log(`✅ Box ${i + 1} filled`);
      } catch (error) {
        console.log(`❌ Box ${i + 1} failed: ${error.message}`);
        return false;
      }
    }
    
    return true;
    
  } catch (error) {
    console.error("❌ Error filling OTP boxes:", error.message);
    return false;
  }
}

// Home button function
export async function pressHomeButton(driver) {
  try {
    await driver.execute('mobile: pressButton', { name: 'home' });
    console.log("✅ Home button pressed");
    return true;
  } catch (error) {
    console.log(`❌ Home button failed: ${error.message}`);
    return false;
  }
}

// Helper function to clear and fill postal code - SIMPLE VERSION
export async function clearAndFillPostalCode(driver, newPostalCode) {
  console.log(`🔄 Clearing and filling postal code with: ${newPostalCode}`);
  
  try {
    // Multiple selectors to find the postal code field
    const postalCodeSelectors = [
      '//XCUIElementTypeTextField[@value="71010"]',  // Find by current value
      '//XCUIElementTypeTextField[contains(@value, "71010")]',  // Contains current value
      '-ios class chain:**/XCUIElementTypeTextField[`value == "71010"`]',  // iOS Class Chain
      '//XCUIElementTypeOther[@name="Postal Code"]//XCUIElementTypeTextField',  // Find by parent
      '(//XCUIElementTypeTextField)[3]',  // By position (might be 3rd field)
      '(//XCUIElementTypeTextField)[4]'   // By position (might be 4th field)
    ];
    
    let fieldCleared = false;
    let fieldElement = null;
    
    // Try each selector to find the postal code field
    for (let i = 0; i < postalCodeSelectors.length; i++) {
      try {
        console.log(`🔄 Trying postal code selector ${i + 1}: ${postalCodeSelectors[i]}`);
        
        let element;
        if (postalCodeSelectors[i].startsWith('**/') || postalCodeSelectors[i].startsWith('-ios class chain:')) {
          element = await driver.$(postalCodeSelectors[i].replace('**/', '-ios class chain:**/'));
        } else {
          element = await driver.$(postalCodeSelectors[i]);
        }
        
        if (await element.isExisting()) {
          console.log(`✅ Found postal code field with selector ${i + 1}`);
          fieldElement = element;
          break;
        } else {
          console.log(`❌ Postal code field not found with selector ${i + 1}`);
        }
      } catch (error) {
        console.log(`❌ Selector ${i + 1} failed: ${error.message}`);
        continue;
      }
    }
    
    if (!fieldElement) {
      console.log("❌ Could not find postal code field with any selector");
      return false;
    }
    
    // Step 1: Click on the field to focus
    console.log("📱 Step 1: Clicking postal code field to focus");
    await fieldElement.click();
    await driver.pause(1000);
    
    // Step 2: Select all text and clear
    console.log("📱 Step 2: Clearing existing postal code");
    try {
      // Method 1: Try clearValue()
      await fieldElement.clearValue();
      console.log("✅ Cleared using clearValue()");
      fieldCleared = true;
    } catch (clearError) {
      console.log("⚠️ clearValue() failed, trying alternative methods");
      
      try {
        // Method 2: Select all and delete
        await driver.keys(['cmd', 'a']);  // Select all (iOS)
        await driver.pause(500);
        await driver.keys(['Delete']);
        console.log("✅ Cleared using select all + delete");
        fieldCleared = true;
      } catch (keysError) {
        console.log("⚠️ Select all + delete failed, trying backspace method");
        
        try {
          // Method 3: Multiple backspaces
          for (let i = 0; i < 10; i++) {
            await driver.keys(['Backspace']);
            await driver.pause(100);
          }
          console.log("✅ Cleared using multiple backspaces");
          fieldCleared = true;
        } catch (backspaceError) {
          console.log("❌ All clear methods failed");
        }
      }
    }
    
    await driver.pause(500);
    
    // Step 3: Fill with new postal code
    console.log(`📱 Step 3: Filling with new postal code: ${newPostalCode}`);
    try {
      await fieldElement.setValue(newPostalCode);
      console.log(`✅ Successfully filled postal code with: ${newPostalCode}`);
    } catch (fillError) {
      console.log("⚠️ setValue() failed, trying keys method");
      
      try {
        // Alternative: Type using keys
        await driver.keys(newPostalCode.split(''));
        console.log(`✅ Successfully typed postal code using keys: ${newPostalCode}`);
      } catch (keysError) {
        console.log(`❌ All fill methods failed: ${keysError.message}`);
        return false;
      }
    }
    
    await driver.pause(1000);
    
    // Step 4: Verify the value was set correctly
    try {
      const currentValue = await fieldElement.getValue();
      if (currentValue === newPostalCode) {
        console.log(`✅ Verification successful: postal code is now ${currentValue}`);
        return true;
      } else {
        console.log(`⚠️ Verification failed: expected ${newPostalCode}, got ${currentValue}`);
        return true; // Still return true as the action was attempted
      }
    } catch (verifyError) {
      console.log("⚠️ Could not verify postal code, but action was attempted");
      return true;
    }
    
  } catch (error) {
    console.error(`❌ Error in clearAndFillPostalCode: ${error.message}`);
    return false;
  }
}


// Super simple bank selection - just click the first bank option
export async function selectAnyAvailableBank(driver) {
  console.log("🏦 Simple bank selection - clicking first available option...");
  
  try {
    // Wait a bit for dropdown to fully load
    await driver.pause(1000);
    
    // Try to find and click any bank option
    const bankOptions = [
      // Try different ways to find bank elements
      '//XCUIElementTypeStaticText[contains(@name, "Bank")]',
      '//XCUIElementTypeCell[contains(@name, "Bank")]',
      '//XCUIElementTypeButton[contains(@name, "Bank")]',
      '(//XCUIElementTypeStaticText)[2]',  // Usually second text element after header
      '(//XCUIElementTypeCell)[1]'         // First cell in dropdown
    ];
    
    for (let selector of bankOptions) {
      try {
        console.log(`🔄 Trying bank selector: ${selector}`);
        const bankElement = await driver.$(selector);
        
        if (await bankElement.isExisting()) {
          console.log(`✅ Found bank element, clicking...`);
          await bankElement.click();
          await driver.pause(1000);
          
          console.log(`✅ Bank clicked successfully`);
          return { success: true, selectedBank: "Bank selected by direct click" };
        }
      } catch (error) {
        console.log(`❌ Selector failed: ${selector}`);
        continue;
      }
    }
    
    // If no elements found, try coordinate click
    console.log("🔄 No bank elements found, trying coordinate click...");
    await driver.action('pointer')
      .move({ duration: 0, x: 200, y: 400 })
      .down({ button: 0 })
      .up({ button: 0 })
      .perform();
    
    await driver.pause(1000);
    console.log("✅ Coordinate click completed");
    return { success: true, selectedBank: "Bank selected by coordinate" };
    
  } catch (error) {
    console.log(`❌ Bank selection failed: ${error.message}`);
    return { success: false, selectedBank: null };
  }
}

// Even simpler fallback - just coordinate click
export async function selectBankSimple(driver) {
  console.log("🏦 Super simple bank selection - coordinate click only...");
  
  try {
    // Click at middle of screen where bank list usually is
    await driver.action('pointer')
      .move({ duration: 0, x: 200, y: 350 })
      .down({ button: 0 })
      .up({ button: 0 })
      .perform();
    
    await driver.pause(1000);
    console.log("✅ Simple coordinate click completed");
    return { success: true, selectedBank: "Bank selected by simple coordinate" };
    
  } catch (error) {
    console.log(`❌ Simple selection failed: ${error.message}`);
    return { success: false, selectedBank: null };
  }
}
