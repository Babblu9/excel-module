const ExcelJS = require('exceljs');
const path = require('path');

async function fillExcelAiroc(config, outputPath) {
    const { branches, medical, diagnostics, surgery } = config;

    const templatePath = path.join(process.cwd(), 'AIROC ', 'AIROC Hospitals - Business Plan.xlsx');
    const workbook = new ExcelJS.Workbook();

    console.log('Reading AIROC workbook...');
    await workbook.xlsx.readFile(templatePath);

    const branchCount = parseInt(branches);

    // 1. Set Master Branch Count in Basics
    const sheetBasics = workbook.getWorksheet('1. Basics');
    if (sheetBasics) {
        sheetBasics.getCell('C24').value = 'Number of Branches';
        sheetBasics.getCell('D24').value = branchCount;
    }

    // 2. Set Multi-Category Revenue in Sales
    const sheetSales = workbook.getWorksheet('2.Sales');
    if (sheetSales) {
        // A. Medical (Row 10)
        if (medical) {
            sheetSales.getCell('D10').value = String(medical.product);
            const medUnits = parseFloat(medical.units) || 0;
            const medPrice = parseFloat(medical.price) || 0;
            sheetSales.getCell('F10').value = {
                formula: `'1. Basics'!$D$24 * ${medUnits}`,
                result: branchCount * medUnits
            };
            sheetSales.getCell('G10').value = medPrice;
            sheetSales.getCell('H10').value = { formula: 'F10*G10', result: branchCount * medUnits * medPrice };
        }

        // B. Diagnostics (Row 19)
        if (diagnostics) {
            sheetSales.getCell('D19').value = String(diagnostics.product);
            const diagUnits = parseFloat(diagnostics.units) || 0;
            const diagPrice = parseFloat(diagnostics.price) || 0;
            sheetSales.getCell('F19').value = {
                formula: `'1. Basics'!$D$24 * ${diagUnits}`,
                result: branchCount * diagUnits
            };
            sheetSales.getCell('G19').value = diagPrice;
            sheetSales.getCell('H19').value = { formula: 'F19*G19', result: branchCount * diagUnits * diagPrice };
        }

        // C. Surgery (Phase II - Row 62)
        if (surgery) {
            // UNMERGE placeholders in Phase II columns (F, J, N, R, V, Z, AD, AH, AL...)
            // The template has F61:H67 merged as a placeholder. We need to unmerge them to use the rows.
            const colStarts = [6, 10, 14, 18, 22, 26, 30, 34, 38, 42]; // Months 1-10 area
            colStarts.forEach(col => {
                const range = {
                    top: 61,
                    bottom: 67,
                    left: col,
                    right: col + 2
                };
                // exceljs uses sheet.unMergeCells(range)
                try {
                    sheetSales.unMergeCells(61, col, 67, col + 2);
                } catch (e) {
                    // Range might not be merged, ignore
                }
            });

            sheetSales.getCell('D62').value = String(surgery.product);
            const surgUnits = parseFloat(surgery.units) || 0;
            const surgPrice = parseFloat(surgery.price) || 0;
            sheetSales.getCell('F62').value = {
                formula: `'1. Basics'!$D$24 * ${surgUnits}`,
                result: branchCount * surgUnits
            };
            sheetSales.getCell('G62').value = surgPrice;
            sheetSales.getCell('H62').value = { formula: 'F62*G62', result: branchCount * surgUnits * surgPrice };
        }

        // Clear sub-rows within these sections to isolate the primary inputs
        const clearRows = (start, count) => {
            for (let i = 1; i < count; i++) {
                sheetSales.getCell(`D${start + i}`).value = '';
                sheetSales.getCell(`F${start + i}`).value = 0;
                sheetSales.getCell(`G${start + i}`).value = 0;
                sheetSales.getCell(`H${start + i}`).value = 0;
            }
        };

        clearRows(10, 5);
        clearRows(19, 5);
        clearRows(28, 4);
        clearRows(62, 5);
        clearRows(72, 4);
    }

    // 3. Scale OPEX
    const sheetOpex = workbook.getWorksheet('3. OPEX');
    if (sheetOpex) {
        const qtyCols = [];
        for (let col = 6; col <= 50; col += 4) qtyCols.push(col);

        for (let row = 10; row <= 75; row++) {
            qtyCols.forEach(col => {
                const cell = sheetOpex.getCell(row, col);
                if (cell.value === 1) {
                    cell.value = { formula: "'1. Basics'!$D$24" };
                }
            });
        }
        const rowRent = 42;
        sheetOpex.getCell('AL' + rowRent).value = { formula: "'1. Basics'!$D$24" };

        for (let i = 11; i <= 14; i++) { sheetOpex.getCell(`F${i}`).value = 0; }
        for (let i = 20; i <= 23; i++) { sheetOpex.getCell(`F${i}`).value = 0; }
    }

    console.log('Writing AIROC workbook...');
    await workbook.xlsx.writeFile(outputPath);
    console.log(`Successfully saved to ${outputPath}`);
}

const args = process.argv.slice(2);
if (args.length === 1) {
    try {
        const config = JSON.parse(args[0]);
        fillExcelAiroc(config, config.outputPath || 'output.xlsx')
            .catch(err => { console.error(err); process.exit(1); });
    } catch (e) {
        console.error('Invalid JSON arg');
        process.exit(1);
    }
} else {
    console.log('Usage: node fill_excel_airoc.js <json_config>');
    process.exit(1);
}
