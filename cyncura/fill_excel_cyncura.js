const ExcelJS = require('exceljs');
const path = require('path');

async function fillExcelCyncura(config, outputPath) {
    const {
        platformAccess,
        advertisementRevenue,
        appDevelopment,
        rent,
        techOpsSalaries
    } = config;

    const templatePath = path.join(process.cwd(), 'cyncura', 'Cyncura - Business Plan.xlsx');
    const workbook = new ExcelJS.Workbook();

    console.log('Reading Cyncura workbook...');
    await workbook.xlsx.readFile(templatePath);

    // 1. Revenue Showcases (Sheet: A.I Revenue Streams - P1)
    const sheetRev = workbook.getWorksheet('A.I Revenue Streams - P1');
    if (sheetRev) {
        if (platformAccess) {
            sheetRev.getCell('E10').value = String(platformAccess.name || 'Platform Access Fees');
            sheetRev.getCell('G10').value = parseFloat(platformAccess.units) || 0;
            sheetRev.getCell('I10').value = parseFloat(platformAccess.price) || 0;
        }

        if (advertisementRevenue) {
            sheetRev.getCell('E19').value = String(advertisementRevenue.name || 'Advertisement');
            sheetRev.getCell('G19').value = parseFloat(advertisementRevenue.units) || 0;
            sheetRev.getCell('I19').value = parseFloat(advertisementRevenue.price) || 0;
        }

        // Clear unused rows
        for (let i = 10; i <= 200; i++) {
            if (i !== 10 && i !== 19) {
                sheetRev.getCell(`E${i}`).value = '';
                sheetRev.getCell(`G${i}`).value = '';
                sheetRev.getCell(`I${i}`).value = '';
            }
        }
    } else {
        console.warn('Revenue sheet not found');
    }

    // 2. OPEX Defaults (Sheet: A.IIOPEX)
    const sheetOpex = workbook.getWorksheet('A.IIOPEX');
    if (sheetOpex) {
        if (appDevelopment) {
            sheetOpex.getCell('E10').value = String(appDevelopment.name || 'App Development');
            sheetOpex.getCell('G10').value = parseFloat(appDevelopment.units) || 0;
            sheetOpex.getCell('I10').value = parseFloat(appDevelopment.price) || 0;
        }

        if (rent) {
            sheetOpex.getCell('E33').value = String(rent.name || 'Rent');
            sheetOpex.getCell('G33').value = parseFloat(rent.units) || 0;
            sheetOpex.getCell('I33').value = parseFloat(rent.price) || 0;
        }

        if (techOpsSalaries) {
            sheetOpex.getCell('E45').value = String(techOpsSalaries.name || 'Salaries – Tech & Ops');
            sheetOpex.getCell('G45').value = parseFloat(techOpsSalaries.units) || 0;
            sheetOpex.getCell('I45').value = parseFloat(techOpsSalaries.price) || 0;
        }
    } else {
        console.warn('OPEX sheet not found');
    }

    console.log('Writing Cyncura workbook...');
    await workbook.xlsx.writeFile(outputPath);
    console.log(`Successfully saved to ${outputPath}`);
}

const args = process.argv.slice(2);
if (args.length === 1) {
    try {
        const config = JSON.parse(args[0]);
        fillExcelCyncura(config, config.outputPath || 'output.xlsx')
            .catch(err => { console.error(err); process.exit(1); });
    } catch (e) {
        console.error('Invalid JSON arg');
        process.exit(1);
    }
} else {
    console.log('Usage: node fill_excel_cyncura.js <json_config>');
    process.exit(1);
}
