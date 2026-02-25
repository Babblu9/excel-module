const ExcelJS = require('exceljs');
const path = require('path');

async function checkSheet(projectName, filePath, sheetName, cellRefs) {
    console.log(`\n=== Checking ${projectName} ===`);
    const workbook = new ExcelJS.Workbook();
    try {
        await workbook.xlsx.readFile(filePath);
        const sheet = workbook.getWorksheet(sheetName);
        if (!sheet) {
            console.log(`Sheet ${sheetName} not found.`);
            return;
        }
        for (const ref of cellRefs) {
            const cell = sheet.getCell(ref);
            console.log(`Cell ${ref}: value=${JSON.stringify(cell.value)}, formula=${cell.formula}, result=${cell.result}`);
        }
    } catch (e) {
        console.error(`Error reading ${filePath}: ${e.message}`);
    }
}

async function run() {
    // Cyncura P&L gross receipts typically on C9 to H9 or similar. Let's look at row 9 or 12.
    // Let's just read B.I Sales - P1 total revenues for the 6 years or months.

    const cyncuraPath = path.join(__dirname, 'cyncura', 'test_base.xlsx');
    await checkSheet('Cyncura P&L', cyncuraPath, '4. P&L', ['C9', 'D9', 'E9', 'F9', 'G9', 'H9', 'C12', 'D12', 'E12', 'F12']);

    // Check B.I Sales - P1
    await checkSheet('Cyncura Sales', cyncuraPath, 'B.I Sales - P1', ['IN13', 'IN14', 'IN15', 'IN16', 'IN17', 'IN18']);

    const instalettePath = path.join(__dirname, 'instalette', 'test_base.xlsx');
    await checkSheet('Instalette P&L', instalettePath, '1. P&L', ['C9', 'D9', 'E9', 'F9', 'C12', 'D12', 'E12']);

    const moorgenPath = path.join(__dirname, 'moorgen', 'test_base.xlsx');
    await checkSheet('Moorgen P&L', moorgenPath, '1. P&L', ['C12', 'D12', 'E12', 'F12']);

    const sakiruPath = path.join(__dirname, 'sakiru', 'test_base.xlsx');
    await checkSheet('Sakiru P&L', sakiruPath, '4. P&L', ['C12', 'D12', 'E12', 'F12']);
}

run();
