const ExcelJS = require('exceljs');

async function analyzeExcel(filePath) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    workbook.eachSheet((worksheet, sheetId) => {
        console.log(`\nSheet: ${worksheet.name}`);
        let rowCount = 0;
        worksheet.eachRow((row, rowNumber) => {
            rowCount++;
            row.eachCell((cell, colNumber) => {
                if (cell.type === ExcelJS.ValueType.Formula) {
                    console.log(`  Row ${rowNumber}, Col ${colNumber} [${cell.address}]: FORMULA=${cell.formula}, RESULT=${cell.result}`);
                } else if (cell.value !== null && cell.value !== '') {
                    console.log(`  Row ${rowNumber}, Col ${colNumber} [${cell.address}]: VALUE=${cell.value}`);
                }
            });
        });
        console.log(`Total rows with data: ${rowCount}`);
    });
}

analyzeExcel('unit-economics/Unit_Economics_Final.xlsx').catch(console.error);
