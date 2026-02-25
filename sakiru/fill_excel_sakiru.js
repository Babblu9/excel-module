const ExcelJS = require('exceljs');
const path = require('path');

async function fillExcel(config, outputPath) {
    const { planA, planB, oneDayEvent } = config;

    const templatePath = path.join(process.cwd(), 'sakiru', 'Sakiru - Business Plan.xlsx');
    const workbook = new ExcelJS.Workbook();

    console.log('Reading Sakiru workbook...');
    await workbook.xlsx.readFile(templatePath);

    // Sakiru uses Col 7 (G) for quantity and Col 9 (I) for price. Col 5 (E) is name.
    const sheetRev = workbook.getWorksheet('A.I Revenue Streams - P1');
    if (sheetRev) {
        if (planA) {
            sheetRev.getCell('E10').value = String(planA.name || 'Plan A Subscription');
            sheetRev.getCell('G10').value = parseFloat(planA.units) || 0;
            sheetRev.getCell('I10').value = parseFloat(planA.price) || 0;
        }

        if (planB) {
            sheetRev.getCell('E11').value = String(planB.name || 'Plan B Subscription');
            sheetRev.getCell('G11').value = parseFloat(planB.units) || 0;
            sheetRev.getCell('I11').value = parseFloat(planB.price) || 0;
        }

        if (oneDayEvent) {
            sheetRev.getCell('E19').value = String(oneDayEvent.name || 'One day Event (A)');
            sheetRev.getCell('G19').value = parseFloat(oneDayEvent.units) || 0;
            sheetRev.getCell('I19').value = parseFloat(oneDayEvent.price) || 0;
        }

        // Clear unused rows
        for (let i = 10; i <= 200; i++) {
            if (i !== 10 && i !== 11 && i !== 19) {
                sheetRev.getCell(`E${i}`).value = '';
                sheetRev.getCell(`G${i}`).value = '';
                sheetRev.getCell(`I${i}`).value = '';
            }
        }
    } else {
        console.warn('Revenue sheet not found');
    }

    console.log('Writing Sakiru workbook...');
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
    console.log('Usage: node fill_excel_sakiru.js <json_config>');
    process.exit(1);
}
