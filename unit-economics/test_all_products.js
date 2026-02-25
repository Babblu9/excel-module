const ExcelJS = require('exceljs');
const fs = require('fs');
const { calculateUnitEconomics } = require('./engine/index.js');

async function extractAndTest() {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('./Unit_Economics_Final.xlsx');

    const economicsSheet = workbook.getWorksheet('Unit Economics');
    const marketingSheet = workbook.getWorksheet('Marketing Costs');
    const matrixSheet = workbook.getWorksheet('Master Product Matrix');
    const summarySheet = workbook.getWorksheet('Product Summary');

    // 1. Extract Roles
    const roles = [];
    const roleMap = {}; // name to id

    // We will parse the Unit Economics sheet starting row 6
    // Col B=Name, C=Salary Avg(E), Std Hours(F), Output(G)
    // Actually the Average Salary is in E
    const roleRows = [
        ['data_entry', 6], ['jr_acct', 7], ['sr_acct', 8], ['reviewer', 9], ['jr_ca', 10], ['sr_ca', 11],
        ['gst_jr', 12], ['gst_sr', 13], ['roc_exec', 14], ['it_exec', 15], ['tds_exec', 16], ['payroll_exec', 17],
        ['audit_asst', 18], ['cfo_assoc', 19],
        ['telecaller_jr', 24], ['telecaller_sr', 25], ['caller_mgr', 26],
        ['sales_jr', 30], ['sales_sr', 31], ['sales_mgr', 32],
        ['delivery_jr', 36], ['delivery_sr', 37], ['delivery_mgr', 38],
        ['reception', 42], ['helpers', 43], ['cleaning', 44],
        ['fsd_jr', 47], ['fsd_sr', 48], ['ui_ux', 49], ['qa_exec', 50], ['it_support', 51], ['tech_lead', 52],
        ['cs_exec', 55], ['cs_mgr', 56], ['onboarding_spec', 57], ['rm', 58],
        ['ops_exec', 61], ['ops_mgr', 62], ['qa', 63], ['mis_exec', 64], ['process_trainer', 65],
        ['hr_exec', 68], ['hr_mgr', 69], ['ta', 70],
        ['acct_exec', 73], ['fin_mgr', 74]
    ];

    for (const [id, rowNum] of roleRows) {
        const row = economicsSheet.getRow(rowNum);
        roles.push({
            id,
            name: row.getCell(2).value,
            salary: row.getCell(5).value, // Average
            standardHours: row.getCell(6).value,
            outputPercentage: row.getCell(7).value
        });
        roleMap[row.getCell(2).value] = id;
    }

    // 2. Marketing
    const totalMonthlySpend = marketingSheet.getRow(14).getCell(4).result || marketingSheet.getRow(14).getCell(4).value;
    const totalLeads = marketingSheet.getRow(14).getCell(5).result || marketingSheet.getRow(14).getCell(5).value;

    const marketing = {
        totalMonthlySpend,
        totalLeads,
        conversionFunnel: [
            { name: 'MQL', conversionPct: marketingSheet.getRow(20).getCell(4).value },
            { name: 'SQL', conversionPct: marketingSheet.getRow(21).getCell(4).value },
            { name: 'Proposals', conversionPct: marketingSheet.getRow(22).getCell(4).value },
            { name: 'Closed Won', conversionPct: marketingSheet.getRow(23).getCell(4).value }
        ]
    };

    // 3. Products from Master Matrix
    const products = [];

    // Matrix starts product cols at D (4) to W (23) -> 20 products
    for (let col = 4; col <= 23; col++) {
        const product = {
            id: matrixSheet.getRow(6).getCell(col).value,
            name: matrixSheet.getRow(5).getCell(col).value,
            laborHours: {},
            govtCosts: [],
            marginPct: matrixSheet.getRow(56).getCell(col).value,
            arr: matrixSheet.getRow(64).getCell(col).value || 0,
            retentionRate: matrixSheet.getRow(65).getCell(col).value || 0
        };

        // Extract labor hours
        for (let row = 12; row <= 31; row++) {
            const roleName = matrixSheet.getRow(row).getCell(2).value;
            const hours = matrixSheet.getRow(row).getCell(col).value || 0;
            if (hours > 0) {
                const roleId = roleRows.find(r => r[1] === (economicsSheet.getColumn(2).values.indexOf(roleName)))?.[0] || roleMap[roleName];
                if (roleId) {
                    product.laborHours[roleId] = hours;
                } else if (roleName !== 'TOTAL LABOR COST') {
                    // Try to loosely match
                    const fuzzyRow = roleRows.find(r => economicsSheet.getRow(r[1]).getCell(2).value === roleName);
                    if (fuzzyRow) {
                        product.laborHours[fuzzyRow[0]] = hours;
                    }
                }
            }
        }

        // Extract Govt Costs (36 to 48)
        for (let row = 36; row <= 48; row++) {
            const costName = matrixSheet.getRow(row).getCell(2).value;
            const amount = matrixSheet.getRow(row).getCell(col).value || 0;
            if (amount > 0) {
                product.govtCosts.push({ name: costName, amount });
            }
        }

        products.push(product);
    }

    const testData = { roles, marketing, products };

    // Save to file for inspection
    fs.writeFileSync('test_data.json', JSON.stringify(testData, null, 2));

    // Run the engine
    const results = calculateUnitEconomics(testData);

    // Verify against Summary Sheet
    let passed = 0;
    let failed = 0;
    const errors = [];

    // Summary sheet products are rows 6 to 25
    for (let i = 0; i < 20; i++) {
        const row = summarySheet.getRow(6 + i);
        const code = row.getCell(2).value;
        const result = results.products.find(p => p.id === code);

        if (!result) {
            console.log(`❌ Could not find result for ${code}`);
            failed++;
            continue;
        }

        const expectedLabor = row.getCell(6).result;
        const expectedGovt = row.getCell(7).result;
        const expectedTotalCost = row.getCell(8).result;
        const expectedMargin = row.getCell(11).result;
        const expectedSalePrice = row.getCell(10).result;
        const expectedLtv = row.getCell(12).result;
        const expectedRatio = row.getCell(13).result;

        // Tolerance for floating point differences
        const isClose = (a, b) => Math.abs(a - b) < 0.1;

        const checks = [
            { name: 'Labor Cost', act: result.laborCost, exp: expectedLabor },
            { name: 'Govt Cost', act: result.govtCost, exp: expectedGovt },
            { name: 'Total Cost', act: result.totalDirectCost, exp: expectedTotalCost },
            { name: 'Margin', act: result.marginAmount, exp: expectedMargin },
            { name: 'Sale Price', act: result.salePrice, exp: expectedSalePrice },
            { name: 'LTV', act: result.ltv, exp: expectedLtv },
            { name: 'LTV:CAC', act: result.ltvCacRatio, exp: expectedRatio }
        ];

        let productPassed = true;
        for (const check of checks) {
            if (!isClose(check.act, check.exp)) {
                errors.push(`${code} -> ${check.name} failed: expected ${check.exp.toFixed(2)}, got ${check.act.toFixed(2)}`);
                productPassed = false;
            }
        }

        if (productPassed) {
            passed++;
            console.log(`✅ ${code} passed all checks.`);
        } else {
            failed++;
            console.log(`❌ ${code} had failures.`);
        }
    }

    console.log(`\nResults: ${passed} passed, ${failed} failed.`);
    if (errors.length > 0) {
        console.log("\nErrors:");
        errors.forEach(e => console.log(e));
    }
}

extractAndTest().catch(console.error);
