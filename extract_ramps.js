const ExcelJS = require('exceljs');
const path = require('path');

async function extractLaunchRamp(filePath, sheetName) {
    console.log(`\n=== Extracting Ramps for ${path.basename(filePath)} ===`);
    const workbook = new ExcelJS.Workbook();
    try {
        await workbook.xlsx.readFile(filePath);
        const sheet = workbook.getWorksheet(sheetName);
        if (!sheet) return;

        for (let r = 10; r <= 30; r++) {
            const row = sheet.getRow(r);
            const vals = [];
            // Months 1 to 6 typically reside in Columns 6, 7, 8, 10, 11, 12 
            // We'll just grab the generic columns F through L
            const colsToCheck = [6, 7, 8, 10, 11, 12];
            let name = "";
            let hasHardcodes = false;

            // Just scan to see if it's a valid row
            for (let c of colsToCheck) {
                const cell = row.getCell(c);
                if (typeof cell.value === 'number') {
                    hasHardcodes = true;
                    vals.push(cell.value);
                } else if (cell.formula || (cell.value && cell.value.result !== undefined)) {
                    vals.push(cell.result || cell.value.result || 0);
                } else {
                    vals.push(0);
                }
            }

            if (hasHardcodes) {
                console.log(`Row ${r} Ramp: [${vals.join(', ')}]`);
            }
        }
    } catch (e) {
        console.error(e.message);
    }
}

async function run() {
    await extractLaunchRamp(path.join(__dirname, 'cyncura', 'Cyncura - Business Plan.xlsx'), 'B.I Sales - P1');
    await extractLaunchRamp(path.join(__dirname, 'instalette', 'Instalette - Business Plan.xlsx'), 'B.I Sales - P1');
    await extractLaunchRamp(path.join(__dirname, 'moorgen', 'Moorgen - Business Plan.xlsx'), 'B.I Sales - P1');
    await extractLaunchRamp(path.join(__dirname, 'sakiru', 'Sakiru - Business Plan.xlsx'), 'B.I Sales - P1');
}
run();
