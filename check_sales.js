const ExcelJS = require('exceljs');
const path = require('path');

async function checkSalesSheet(filePath, sheetName) {
    console.log(`\n=== Checking B.I Sales Sheet for ${filePath} ===`);
    const workbook = new ExcelJS.Workbook();
    try {
        await workbook.xlsx.readFile(filePath);
        const sheet = workbook.getWorksheet(sheetName);
        if (!sheet) {
            console.log(`Sheet ${sheetName} not found.`);
            return;
        }

        let hardcodedFound = 0;
        let formulasFound = 0;

        // Loop through row 10 to 30 to check columns like F, G, H, I, J, K (Months 1-6)
        for (let r = 10; r <= 30; r++) {
            const row = sheet.getRow(r);
            let rowVals = [];
            row.eachCell((cell, colNumber) => {
                if (colNumber > 5 && colNumber < 20) { // first ~14 months
                    const val = cell.value;
                    const formula = cell.formula;
                    if (val !== null && val !== undefined) {
                        if (typeof val === 'number') {
                            hardcodedFound++;
                            rowVals.push(`Col${colNumber}: hardcoded=${val}`);
                        } else if (formula) {
                            formulasFound++;
                            rowVals.push(`Col${colNumber}: formula`);
                        }
                    }
                }
            });
            if (rowVals.length > 0) {
                console.log(`Row ${r}: ` + rowVals.join(' | '));
            }
        }
        console.log(`Summary: ${hardcodedFound} hardcoded numbers, ${formulasFound} formulas found.`);
    } catch (e) {
        console.error(`Error reading ${filePath}: ${e.message}`);
    }
}

async function run() {
    await checkSalesSheet(path.join(__dirname, 'cyncura', 'Cyncura - Business Plan.xlsx'), 'B.I Sales - P1');
    await checkSalesSheet(path.join(__dirname, 'instalette', 'Instalette - Business Plan.xlsx'), 'B.I Sales - P1');
    await checkSalesSheet(path.join(__dirname, 'moorgen', 'Moorgen - Business Plan.xlsx'), 'B.I Sales - P1');
    await checkSalesSheet(path.join(__dirname, 'sakiru', 'Sakiru - Business Plan.xlsx'), 'B.I Sales - P1');
}

run();
