import { generateUniqueTestData } from './TestData_Shared.js';

export function generateUniqueSignUpTestData() {
  const sharedData = generateUniqueTestData();
  return {
    username: sharedData.username,
    email: sharedData.email,
    phoneNumber: sharedData.phoneNumber,
    password: sharedData.password,
    confirmPassword: sharedData.confirmPassword
  };
}