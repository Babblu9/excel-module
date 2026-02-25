const ExcelJS = require('exceljs');
const path = require('path');

async function checkRevenueSheet(filePath, sheetName, startRow, endRow) {
    console.log(`\n=== Checking Revenue Sheet for ${filePath} ===`);
    const workbook = new ExcelJS.Workbook();
    try {
        await workbook.xlsx.readFile(filePath);
        const sheet = workbook.getWorksheet(sheetName);
        if (!sheet) {
            console.log(`Sheet ${sheetName} not found.`);
            return;
        }

        // Loop through row 6 to 20 to find sales input columns
        for (let r = startRow; r <= endRow; r++) {
            const row = sheet.getRow(r);
            let rowVals = [];
            row.eachCell((cell, colNumber) => {
                if (colNumber > 5 && colNumber < 25) { // typical data columns
                    const val = cell.value;
                    const result = cell.result;
                    const formula = cell.formula;
                    if (val !== null && val !== undefined) {
                        rowVals.push(`Col${colNumber}: val=${JSON.stringify(val)} form=${formula}`);
                    }
                }
            });
            if (rowVals.length > 0) {
                console.log(`Row ${r}: ` + rowVals.join(' | '));
            }
        }
    } catch (e) {
        console.error(`Error reading ${filePath}: ${e.message}`);
    }
}

async function run() {
    await checkRevenueSheet(path.join(__dirname, 'cyncura', 'Cyncura - Business Plan.xlsx'), 'A.I Revenue Streams - P1', 6, 20);
    await checkRevenueSheet(path.join(__dirname, 'instalette', 'Instalette - Business Plan.xlsx'), 'A.I Revenue Streams - P1', 6, 20);
    await checkRevenueSheet(path.join(__dirname, 'moorgen', 'Moorgen - Business Plan.xlsx'), 'A.I Revenue Streams - P1', 6, 20);
    await checkRevenueSheet(path.join(__dirname, 'sakiru', 'Sakiru - Business Plan.xlsx'), 'A.I Revenue Streams - P1', 6, 20);
}

run();
