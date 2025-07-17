import * as XLSX from 'xlsx';
import path from 'path';

// === CONFIGURATION ===
const iosSource = path.resolve(__dirname,'../3.Mobile_iOS/AutoReg_FBG2.0_Happy_Flow_E2E_Mobile_iOS.xlsx');
const androidSource = path.resolve(__dirname,'../1.Mobile_Android/AutoReg_FBG2.0_Happy_Flow_E2E_Mobile_Android.xlsx');
const webSource = path.resolve(__dirname,'../2.Web_Android/AutoReg_FBG2.0_Happy_Flow_E2E_Web.xlsx');
const destPath = path.resolve('Combined_AutoReg_Report.xlsx');

// Metadata for each sheet
const metaMobile = [
  ['Platform:', 'FBG_2.0_Mobile'],
  ['Version:', '1.1.07(2)'],
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

// Mobile-iOS sheet
const iosWb = XLSX.readFile(iosSource);
const iosSheet = iosWb.Sheets[iosWb.SheetNames[0]];
const iosRows = getTestRowsFromSheet(iosSheet);
const iosOutSheet = XLSX.utils.aoa_to_sheet([
  ...metaMobile,
  ...headers,
  ...iosRows
]);
XLSX.utils.book_append_sheet(destWb, iosOutSheet, 'Mobile-iOS');

// Mobile-Android sheet
const androidWb = XLSX.readFile(androidSource);
const androidSheet = androidWb.Sheets[androidWb.SheetNames[0]];
const androidRows = getTestRowsFromSheet(androidSheet);
const androidOutSheet = XLSX.utils.aoa_to_sheet([
  ...metaMobile,
  ...headers,
  ...androidRows
]);
XLSX.utils.book_append_sheet(destWb, androidOutSheet, 'Mobile-Android');

// Web sheet
const webWb = XLSX.readFile(webSource);
const webSheet = webWb.Sheets[webWb.SheetNames[0]];
const webRows = getTestRowsFromSheet(webSheet);
const webOutSheet = XLSX.utils.aoa_to_sheet([
  ...metaWeb,
  ...headers,
  ...webRows
]);
XLSX.utils.book_append_sheet(destWb, webOutSheet, 'Web');

// Write the combined workbook
XLSX.writeFile(destWb, destPath);
console.log('Combined Excel report created:', destPath);