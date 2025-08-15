import * as XLSX from 'xlsx';
import path from 'path';

// === CONFIGURATION ===
const iosSource = path.resolve(__dirname,'../3.Mobile_iOS/AutoReg_FBG2.0_Happy_Flow_E2E_Mobile_iOS.xlsx');
const androidSource = path.resolve(__dirname,'../1.Mobile_Android/AutoReg_FBG2.0_Happy_Flow_E2E_Mobile_Android.xlsx');
const webSource = path.resolve(__dirname,'../2.Web/AutoReg_FBG2.0_Happy_Flow_E2E_Web.xlsx');
const destPath = path.resolve('Combined_AutoReg_Report.xlsx');

// Metadata for each sheet
const metaMobile = [
  ['Platform:', 'FBG_2.0_Mobile'],
  ['Version:', '1.1.10(1)'],
  ['Env:', 'Staging'],
  ['URL:', 'N/A'],
  [],
];
const metaWeb = [
  ['Platform:', 'Web Admin Portal'],
  ['Version:', 'N/A'],
  ['Env:', 'Staging'],
  ['URL:', 'https://commandcenter-stg.farmbyte.com/login'],
  [],
];

// Column headers
const headers = [
  ['Module', 'TC ID', 'Test Case Scenario', 'Timestamp', 'Result', 'Screenshot']
];

// === HELPER FUNCTION ===
function getTestRowsFromSheet(sheet) {
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  // Find the header row (assume it contains 'Module')
  const headerIdx = data.findIndex(row =>
    row[0] && row[0].toString().toLowerCase().includes('module')
  );
  if (headerIdx === -1) return [];
  return data.slice(headerIdx + 1).filter(row => row.length > 1 && row[1]); // skip empty rows
}

// === MAIN SCRIPT ===
const destWb = XLSX.utils.book_new();

// Mobile-iOS sheets (UPDATED - Handle multiple sheets with 31-char limit)
const iosWb = XLSX.readFile(iosSource);
console.log(`📱 iOS workbook has ${iosWb.SheetNames.length} sheets:`, iosWb.SheetNames);

// Helper function to create valid sheet names (existing iOS function)
function createValidSheetName(baseName, sheetName, index) {
  const maxLength = 31;
  
  if (baseName.length <= maxLength) {
    return baseName;
  }
  
  // If single sheet, just use "Mobile-iOS"
  if (index === 0 && iosWb.SheetNames.length === 1) {
    return "Mobile-iOS";
  }
  
  // For multiple sheets, create shortened names
  const prefix = "iOS";
  const shortSheetName = sheetName.length > 20 ? sheetName.substring(0, 20) : sheetName;
  const candidate = `${prefix}-${shortSheetName}`;
  
  // If still too long, use index
  if (candidate.length > maxLength) {
    return `iOS-Sheet${index + 1}`;
  }
  
  return candidate;
}

// Helper function to create valid Android sheet names
function createValidAndroidSheetName(baseName, sheetName, index, totalSheets) {
  const maxLength = 31;
  
  if (baseName.length <= maxLength) {
    return baseName;
  }
  
  // If single sheet, just use "Mobile-Android"
  if (index === 0 && totalSheets === 1) {
    return "Mobile-Android";
  }
  
  // For multiple sheets, create shortened names
  const prefix = "Android";
  const shortSheetName = sheetName.length > 16 ? sheetName.substring(0, 16) : sheetName;
  const candidate = `${prefix}-${shortSheetName}`;
  
  // If still too long, use index
  if (candidate.length > maxLength) {
    return `Android-Sheet${index + 1}`;
  }
  
  return candidate;
}

// Process each iOS sheet (existing code)
iosWb.SheetNames.forEach((sheetName, index) => {
  console.log(`🔄 Processing iOS sheet: ${sheetName}`);
  
  const iosSheet = iosWb.Sheets[sheetName];
  const iosRows = getTestRowsFromSheet(iosSheet);
  
  if (iosRows.length > 0) {
    const iosOutSheet = XLSX.utils.aoa_to_sheet([
      ...metaMobile,
      ...headers,
      ...iosRows
    ]);
    
    // Create valid sheet name (31 char limit)
    const originalName = iosWb.SheetNames.length === 1 
      ? 'Mobile-iOS' 
      : `Mobile-iOS-${sheetName}`;
    
    const outputSheetName = createValidSheetName(originalName, sheetName, index);
    
    XLSX.utils.book_append_sheet(destWb, iosOutSheet, outputSheetName);
    console.log(`✅ Added sheet: ${outputSheetName} (${iosRows.length} rows)`);
  } else {
    console.log(`⚠️ Skipped empty sheet: ${sheetName}`);
  }
});

// Mobile-Android sheets (UPDATED - Handle multiple sheets like iOS)
const androidWb = XLSX.readFile(androidSource);
console.log(`🤖 Android workbook has ${androidWb.SheetNames.length} sheets:`, androidWb.SheetNames);

// Process each Android sheet
androidWb.SheetNames.forEach((sheetName, index) => {
  console.log(`🔄 Processing Android sheet: ${sheetName}`);
  
  const androidSheet = androidWb.Sheets[sheetName];
  const androidRows = getTestRowsFromSheet(androidSheet);
  
  if (androidRows.length > 0) {
    const androidOutSheet = XLSX.utils.aoa_to_sheet([
      ...metaMobile,
      ...headers,
      ...androidRows
    ]);
    
    // Create valid sheet name (31 char limit) - similar to iOS logic
    const originalName = androidWb.SheetNames.length === 1 
      ? 'Mobile-Android' 
      : `Mobile-Android-${sheetName}`;
    
    const outputSheetName = createValidAndroidSheetName(originalName, sheetName, index, androidWb.SheetNames.length);
    
    XLSX.utils.book_append_sheet(destWb, androidOutSheet, outputSheetName);
    console.log(`✅ Added sheet: ${outputSheetName} (${androidRows.length} rows)`);
  } else {
    console.log(`⚠️ Skipped empty sheet: ${sheetName}`);
  }
});

// Web sheet (FIXED - corrected the logic)
const webWb = XLSX.readFile(webSource);
const webSheet = webWb.Sheets[webWb.SheetNames[0]]; // Fixed: was using && which returns undefined
const webRows = getTestRowsFromSheet(webSheet);
const webOutSheet = XLSX.utils.aoa_to_sheet([
  ...metaWeb,
  ...headers,
  ...webRows
]);
XLSX.utils.book_append_sheet(destWb, webOutSheet, 'Web');

// Write the combined workbook
XLSX.writeFile(destWb, destPath);
console.log('✅ Combined Excel report created:', destPath);
console.log(`📊 Total sheets created: ${destWb.SheetNames.length}`);
console.log(`📋 Sheet names: ${destWb.SheetNames.join(', ')}`);