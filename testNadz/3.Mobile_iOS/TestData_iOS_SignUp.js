export function generateUniqueTestData() {
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 1000);
  
  return {
    fullName: `autotest${String(randomId).padStart(3, '0')}`,
    email: `autotest${String(randomId).padStart(3, '0')}@gmail.com`,
    phoneNumber: `12213${String(randomId).padStart(4, '0')}`,
    password: "P@ssw0rd1",
    confirmPassword: "P@ssw0rd1",
    nric: "960231234433",
    farmName: `Nadbefarm${randomId}`,
    farmSize: "212",
    postalCode: "71010",
    bankAccountName: `namasayaabu${randomId}`,
    bankAccountNo: "121211222212121",
    bankName: "Bank Islam Malaysia Berhad",
    otpCode: "2068", // This should be dynamically fetched in real scenario
    timestamp: new Date().toISOString()
  };
}