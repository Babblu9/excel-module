const ExcelJS = require('exceljs');
const path = require('path');

async function fillExcel(config, outputPath) {
    const { franchisee } = config;

    const templatePath = path.join(process.cwd(), 'moorgen', 'Moorgen - Business Plan.xlsx');
    const workbook = new ExcelJS.Workbook();

    console.log('Reading Moorgen workbook...');
    await workbook.xlsx.readFile(templatePath);

    // Moorgen uses Col 8 (H) for quantity and Col 10 (J) for price. Col 6 (F) is sub-stream name.
    const sheetRev = workbook.getWorksheet('A.I Revenue Streams - P1');
    if (sheetRev) {
        if (franchisee) {
            sheetRev.getCell('F10').value = String(franchisee.name || 'Franchisee');
            sheetRev.getCell('H10').value = parseFloat(franchisee.units) || 0;
            sheetRev.getCell('J10').value = parseFloat(franchisee.price) || 0;
        }

        // Clear unused rows
        for (let i = 10; i <= 200; i++) {
            if (i !== 10) {
                sheetRev.getCell(`F${i}`).value = '';
                sheetRev.getCell(`H${i}`).value = '';
                sheetRev.getCell(`J${i}`).value = '';
            }
        }
    } else {
        console.warn('Revenue sheet not found');
    }

    console.log('Writing Moorgen workbook...');
    await workbook.xlsx.writeFile(outputPath);
    console.log(`Successfully saved to ${outputPath}`);
}

const args = process.argv.slice(2);
if (args.length === 1) {
    try {
        const config = JSON.parse(args[0]);
        fillExcel(config, config.outputPath || 'output.xlsx')
            .catch(err => { console.error(err); process.exit(1); });
    } catch (e) {
        console.error('Invalid JSON arg');
        process.exit(1);
    }
} else {
    console.log('Usage: node fill_excel_moorgen.js <json_config>');
    process.exit(1);
}
