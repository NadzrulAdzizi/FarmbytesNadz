import * as XLSX from 'xlsx';
import path from 'path';

// === CONFIGURATION ===
const iosSource = path.resolve('AutoReg_FBG2.0_Happy_Flow_E2E_Mobile_iOS.xlsx');
const androidSource = path.resolve('AutoReg_FBG2.0_Happy_Flow_E2E_Mobile_Android.xlsx');
const webSource = path.resolve('AutoReg_FBG2.0_Happy_Flow_E2E_Web.xlsx');
const destPath = path.resolve('CombinedReport_AutoReg_FBG2.0_Happy_Flow_E2E_Web&Mobile.xlsx');

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

// === STYLE HELPERS ===
function addBordersAndAlign(sheet, range) {
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
      let cell = sheet[cell_address];
      if (!cell) continue;
      // Add thin borders
      cell.s = cell.s || {};
      cell.s.border = {
        top:    { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left:   { style: "thin", color: { rgb: "000000" } },
        right:  { style: "thin", color: { rgb: "000000" } }
      };
      // Center align header row
      if (R === range.s.r + metaMobile.length) {
        cell.s.alignment = { horizontal: "center", vertical: "center" };
        cell.s.font = { bold: true };
      }
    }
  }
}

// === MAIN SCRIPT ===
const destWb = XLSX.utils.book_new();

function appendSheetWithStyle(data, meta, sheetName) {
  const aoa = [...meta, ...headers, ...data];
  const sheet = XLSX.utils.aoa_to_sheet(aoa);

  // Calculate range
  const range = XLSX.utils.decode_range(sheet['!ref']);
  addBordersAndAlign(sheet, range);

  XLSX.utils.book_append_sheet(destWb, sheet, sheetName);
}

// Mobile-iOS sheet
const iosWb = XLSX.readFile(iosSource);
const iosSheet = iosWb.Sheets[iosWb.SheetNames[0]];
const iosRows = getTestRowsFromSheet(iosSheet);
appendSheetWithStyle(iosRows, metaMobile, 'Mobile-iOS');

// Mobile-Android sheet
const androidWb = XLSX.readFile(androidSource);
const androidSheet = androidWb.Sheets[androidWb.SheetNames[0]];
const androidRows = getTestRowsFromSheet(androidSheet);
appendSheetWithStyle(androidRows, metaMobile, 'Mobile-Android');

// Web sheet
const webWb = XLSX.readFile(webSource);
const webSheet = webWb.Sheets[webWb.SheetNames[0]];
const webRows = getTestRowsFromSheet(webSheet);
appendSheetWithStyle(webRows, metaWeb, 'Web');

// Write the combined workbook
XLSX.writeFile(destWb, destPath);
console.log('Combined Excel report created:', destPath);