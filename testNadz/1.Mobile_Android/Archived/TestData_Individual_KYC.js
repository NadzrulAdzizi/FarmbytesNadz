import { generateUniqueTestData, getCurrentTestData } from './TestData_Shared.js';

export function generateUniqueKYCTestData() {
  // Use existing test data if available, otherwise generate new
  const sharedData = getCurrentTestData() || generateUniqueTestData();
  
  return {
    nric: sharedData.nric,
    farmName: sharedData.farmName,
    farmSize: sharedData.farmSize,
    bankAccountName: sharedData.bankAccountName,
    bankAccountNumber: sharedData.bankAccountNumber,
    selectedBank: sharedData.selectedBank
  };
}

// Optional: Static test data for specific scenarios
export const staticKYCTestData = {
  nric: "912322122225",
  farmName: "FBG Auto999",
  farmSize: "223",
  bankAccountName: "AUTOTEST999",
  bankAccountNumber: "1234567890123456",
  selectedBank: "Bank Islam Malaysia Berhad"
};