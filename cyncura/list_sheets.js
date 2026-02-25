const ExcelJS = require('exceljs');
const path = require('path');

async function listSheets() {
    const filename = process.argv[2];
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(path.join(__dirname, '..', filename));
    console.log(`\n=== Sheets in ${filename} ===`);
    console.log(workbook.worksheets.map(w => w.name).join("\n"));
}
listSheets().catch(console.error);
