const ExcelJS = require('exceljs');
const path = require('path');

async function fillExcel(config, outputPath) {
    const { onlineSalePremix, offlineSalePremix, onlineSaleSaver } = config;

    const templatePath = path.join(process.cwd(), 'instalette', 'Instalette - Business Plan.xlsx');
    const workbook = new ExcelJS.Workbook();

    console.log('Reading Instalette workbook...');
    await workbook.xlsx.readFile(templatePath);

    const sheetRev = workbook.getWorksheet('A.I Revenue Streams - P1');
    if (sheetRev) {
        if (onlineSalePremix) {
            sheetRev.getCell('E10').value = String(onlineSalePremix.name || 'Online sale');
            sheetRev.getCell('G10').value = parseFloat(onlineSalePremix.units) || 0;
            sheetRev.getCell('I10').value = parseFloat(onlineSalePremix.price) || 0;
        }

        if (offlineSalePremix) {
            sheetRev.getCell('E11').value = String(offlineSalePremix.name || 'Offline sale thru campaigns');
            sheetRev.getCell('G11').value = parseFloat(offlineSalePremix.units) || 0;
            sheetRev.getCell('I11').value = parseFloat(offlineSalePremix.price) || 0;
        }

        if (onlineSaleSaver) {
            sheetRev.getCell('E19').value = String(onlineSaleSaver.name || 'Online sale');
            sheetRev.getCell('G19').value = parseFloat(onlineSaleSaver.units) || 0;
            sheetRev.getCell('I19').value = parseFloat(onlineSaleSaver.price) || 0;
        }
    } else {
        console.warn('Revenue sheet not found');
    }

    console.log('Writing Instalette workbook...');
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
    console.log('Usage: node fill_excel_instalette.js <json_config>');
    process.exit(1);
}
