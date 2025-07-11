import ExcelJS from 'exceljs';
import path from 'path';

const destPath = path.resolve('CombinedReport_AutoReg_FBG2.0_Happy_Flow_E2E_Web&Mobile.xlsx');

const workbook = new ExcelJS.Workbook();

function addSheetWithMetaAndData(workbook, sheetName, meta, headers, data) {
  const sheet = workbook.addWorksheet(sheetName);

  // Add metadata
  meta.forEach(row => sheet.addRow(row));
  sheet.addRow([]); // empty row

  // Add headers
  const headerRow = sheet.addRow(headers);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

  // Add data rows
  data.forEach(row => sheet.addRow(row));

  // Add borders to all cells
  sheet.eachRow(row => {
    row.eachCell(cell => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
  });
}

// Example meta and headers
const metaMobile = [
  ['Platform:', 'FBG_2.0_Mobile'],
  ['Version:', '1.1.07(2)'],
  ['Env:', 'Staging'],
  ['URL:', 'N/A']
];
const metaWeb = [
  ['Platform:', 'Web Admin Portal'],
  ['Version:', 'N/A'],
  ['Env:', 'Staging'],
  ['URL:', 'https://commandcenter-stg.farmbyte.com/login']
];
const headers = ['Module', 'TC ID', 'Test Case Scenario', 'Timestamp', 'Result', 'Screenshot'];

// TODO: Replace with your actual data extraction logic
const iosRows = [];      // Fill with your iOS test rows
const androidRows = [];  // Fill with your Android test rows
const webRows = [];      // Fill with your Web test rows

addSheetWithMetaAndData(workbook, 'Mobile-iOS', metaMobile, headers, iosRows);
addSheetWithMetaAndData(workbook, 'Mobile-Android', metaMobile, headers, androidRows);
addSheetWithMetaAndData(workbook, 'Web', metaWeb, headers, webRows);

await workbook.xlsx.writeFile(destPath);
console.log('Excel file with borders and alignment created:', destPath);