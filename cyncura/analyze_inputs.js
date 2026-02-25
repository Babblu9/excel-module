const ExcelJS = require('exceljs');
const path = require('path');

async function analyze() {
    const filename = process.argv[2];
    if (!filename) {
        console.log("Provide filename");
        return;
    }
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(path.join(__dirname, '..', filename));

    console.log(`\n=== Analyzing ${filename} ===`);
    console.log("=== A.I Revenue Streams - P1 ===");
    const rev1 = workbook.getWorksheet('A.I Revenue Streams - P1');
    if (rev1) {
        rev1.eachRow((row, rowNumber) => {
            let rowData = [];
            row.eachCell((cell, colNumber) => {
                if (cell.value && typeof cell.value === 'string' && !cell.value.startsWith('=')) {
                    rowData.push(`Col ${colNumber}: ${cell.text.trim()}`);
                }
            });
            if (rowData.length > 0 && rowNumber < 25) console.log(`Row ${rowNumber}: ${rowData.join(' | ')}`);
        });
    } else {
        console.log("Sheet A.I Revenue Streams - P1 not found");
        console.log("Worksheets:", workbook.worksheets.map(w => w.name).join(", "));
    }
}
analyze().catch(console.error);
