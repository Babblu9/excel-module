const ExcelJS = require('exceljs');
const fs = require('fs');
const { calculateUnitEconomics } = require('./engine/index.js');

async function proveDynamic() {
    console.log("=== PROVING BACKEND GENERATION ===");
    console.log("Loading base test_data.json...");
    const testData = JSON.parse(fs.readFileSync('test_data.json', 'utf8'));

    // 1. Alter the input data drastically to prove it's dynamic
    console.log("\nAltering Input Data:");

    // Change Junior Accountant Salary
    const jrAcct = testData.roles.find(r => r.name === 'Junior Accountant');
    console.log(`Original Junior Accountant Salary: ₹${jrAcct.salary}`);
    jrAcct.salary = 500000; // 5 Lakhs!
    console.log(`NEW Junior Accountant Salary: ₹${jrAcct.salary}`);

    // Change Marketing Spend
    console.log(`Original Marketing Spend: ₹${testData.marketing.totalMonthlySpend}`);
    testData.marketing.totalMonthlySpend = 9999999;
    console.log(`NEW Marketing Spend: ₹${testData.marketing.totalMonthlySpend}`);

    // Change PVT-001 Margin
    const pvt001 = testData.products.find(p => p.id === 'PVT-001');
    console.log(`Original PVT-001 Margin: ${pvt001.marginPct * 100}%`);
    pvt001.marginPct = 0.99; // 99% margin
    console.log(`NEW PVT-001 Margin: ${pvt001.marginPct * 100}%`);

    console.log("\nCalculating using JS Engine backend...");
    const results = calculateUnitEconomics(testData);

    const newPvtOutput = results.products.find(p => p.id === 'PVT-001');
    console.log(`\nNew JS Engine Output for PVT-001:`);
    console.log(`- Labor Cost: ₹${newPvtOutput.laborCost.toFixed(2)} (Was ₹1494.89)`);
    console.log(`- COA: ₹${newPvtOutput.coa.toFixed(2)} (Was ₹4987.13)`);
    console.log(`- Sale Price: ₹${newPvtOutput.salePrice.toFixed(2)} (Was ₹14727.53)`);

    console.log("\nInjecting these new numbers into the Excel Template...");

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('./Unit_Economics_Final.xlsx');

    const economicsSheet = workbook.getWorksheet('Unit Economics');
    const roleMap = { 'jr_acct': 7 };
    economicsSheet.getRow(roleMap['jr_acct']).getCell(11).value = results.roleRates['jr_acct'];

    const summarySheet = workbook.getWorksheet('Product Summary');
    for (let i = 0; i < 20; i++) {
        const row = summarySheet.getRow(6 + i);
        const code = row.getCell(2).value;
        const resProd = results.products.find(p => p.id === code);
        if (resProd) {
            row.getCell(6).value = resProd.laborCost;
            row.getCell(10).value = resProd.salePrice;
        }
    }

    const outputFilePath = './Proof_Dynamic_Generation.xlsx';
    await workbook.xlsx.writeFile(outputFilePath);
    console.log(`\n✅ Saved new Excel file: ${outputFilePath}`);
    console.log("You can open this file and see that the numbers have completely changed because they were calculated by our NodeJS engine, not Excel formulas!");
}

proveDynamic().catch(console.error);
