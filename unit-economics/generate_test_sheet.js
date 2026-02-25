const ExcelJS = require('exceljs');
const fs = require('fs');
const { calculateUnitEconomics } = require('./engine/index.js');

async function generateTestSheet() {
    // 1. Read the extracted test data built earlier to feed into the engine
    if (!fs.existsSync('test_data.json')) {
        console.error("test_data.json not found. Did you run test_all_products.js first?");
        return;
    }
    const testData = JSON.parse(fs.readFileSync('test_data.json', 'utf8'));

    // 2. Run the engine
    const results = calculateUnitEconomics(testData);

    // 3. Create a clean Workbook
    const workbook = new ExcelJS.Workbook();

    // ============================================
    // SHEET 1: ENGINE OUTPUTS (Test Results)
    // ============================================
    const sheet = workbook.addWorksheet('JS Engine Output');

    // Headers
    sheet.columns = [
        { header: 'Product Code', key: 'id', width: 15 },
        { header: 'Product Name', key: 'name', width: 35 },
        { header: 'Labor Cost', key: 'laborCost', width: 15 },
        { header: 'Govt Cost', key: 'govtCost', width: 15 },
        { header: 'COA', key: 'coa', width: 15 },
        { header: 'Total Direct Cost', key: 'totalDirectCost', width: 20 },
        { header: 'Margin Amount', key: 'marginAmount', width: 15 },
        { header: 'Sale Price', key: 'salePrice', width: 15 },
        { header: '5-Year LTV', key: 'ltv', width: 15 },
        { header: 'LTV:CAC Ratio', key: 'ltvCacRatio', width: 15 }
    ];

    // Format headers
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } };

    // Fill rows
    for (const product of results.products) {
        sheet.addRow({
            id: product.id,
            name: product.name,
            laborCost: product.laborCost,
            govtCost: product.govtCost,
            coa: product.coa,
            totalDirectCost: product.totalDirectCost,
            marginAmount: product.marginAmount,
            salePrice: product.salePrice,
            ltv: product.ltv,
            ltvCacRatio: product.ltvCacRatio
        });
    }

    // Number formatting for columns C through J
    const numCols = ['C', 'D', 'E', 'F', 'G', 'H', 'I'];
    numCols.forEach(col => {
        sheet.getColumn(col).numFmt = '"₹"#,##0.00';
    });
    sheet.getColumn('J').numFmt = '0.00';

    // ============================================
    // SHEET 2: ROLE RATES (Driver Output)
    // ============================================
    const roleSheet = workbook.addWorksheet('Role Rates (Drivers)');
    roleSheet.columns = [
        { header: 'Role ID', key: 'id', width: 25 },
        { header: 'Calculated Cost/Hr (₹)', key: 'rate', width: 25 }
    ];
    roleSheet.getRow(1).font = { bold: true };

    for (const [roleId, rate] of Object.entries(results.roleRates)) {
        roleSheet.addRow({ id: roleId, rate });
    }
    roleSheet.getColumn('B').numFmt = '"₹"#,##0.00';


    // ============================================
    // SHEET 3: MARKETING (Driver Output)
    // ============================================
    const marketingSheet = workbook.addWorksheet('Marketing (Drivers)');
    marketingSheet.columns = [
        { header: 'Metric', key: 'metric', width: 25 },
        { header: 'Value', key: 'value', width: 20 }
    ];
    marketingSheet.getRow(1).font = { bold: true };

    marketingSheet.addRow({ metric: 'Total Monthly Spend', value: testData.marketing.totalMonthlySpend });
    marketingSheet.addRow({ metric: 'Total Raw Leads', value: testData.marketing.totalLeads });
    marketingSheet.addRow({ metric: 'Total Customers / Month', value: results.marketing.totalCustomers });
    marketingSheet.addRow({ metric: 'Cost of Acquisition (COA)', value: results.marketing.coa });

    // Format based on row
    marketingSheet.getCell('B1').numFmt = '"₹"#,##0.00';
    marketingSheet.getCell('B4').numFmt = '"₹"#,##0.00';


    // Save file
    const outputFilename = 'Unit_Economics_JS_Engine_Test.xlsx';
    await workbook.xlsx.writeFile(outputFilename);
    console.log(`✅ Test sheet successfully generated: ${outputFilename}`);
}

generateTestSheet().catch(console.error);
