let currentTestData = null;

export function generateUniqueTestData() {
  if (!currentTestData) {
    const timestamp = Date.now().toString().slice(-4);
    const randomNum = Math.floor(Math.random() * 100);
    
    currentTestData = {
      // SignUp data
      username: `AUTOTEST${timestamp}`,
      email: `autotest${timestamp}@gmail.com`,
      phoneNumber: `111111${timestamp.slice(-4)}`,
      password: "P@ssw0rd1",
      confirmPassword: "P@ssw0rd1",
      
      // KYC data (uses same timestamp for consistency)
      nric: `91232212${timestamp.slice(-4)}`,
      farmName: `FBG Auto${timestamp}`,
      farmSize: "223",
      bankAccountName: `AUTOTEST${timestamp}`,
      bankAccountNumber: `12345678901234${timestamp.slice(-2)}`,
      selectedBank: "Bank Islam Malaysia Berhad",

      // Make sure your TestData_SignUp.js includes these fields:
      companyName: `Company${timestamp}`,
      ssmNumber: `SSM${timestamp}`,
        };
  }
  return currentTestData;
}

// Reset function for new test cycle
export function resetTestData() {
  currentTestData = null;
}

// Get current test data without generating new one
export function getCurrentTestData() {
  return currentTestData;
}