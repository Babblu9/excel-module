const ExcelJS = require('exceljs');
const fs = require('fs');
const { calculateUnitEconomics } = require('./engine/index.js');

async function generateFinalFormat() {
    if (!fs.existsSync('test_data.json')) {
        console.error("test_data.json not found. Did you run test_all_products.js first?");
        return;
    }
    const testData = JSON.parse(fs.readFileSync('test_data.json', 'utf8'));

    // Calculate values with engine
    const results = calculateUnitEconomics(testData);

    // Read the original master template so we keep formatting (colors, fonts, layout)
    // We will clear out the formulas and overwrite with pure JS calculated values
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('./Unit_Economics_Final.xlsx');

    // Make sure we have the specific sheets we need to fill
    const matrixSheet = workbook.getWorksheet('Master Product Matrix');
    const summarySheet = workbook.getWorksheet('Product Summary');
    const economicsSheet = workbook.getWorksheet('Unit Economics');
    const marketingSheet = workbook.getWorksheet('Marketing Costs');
    const rateSheet = workbook.getWorksheet('Rate Card');

    if (!matrixSheet || !summarySheet) {
        console.error("Template is missing required sheets.");
        return;
    }

    // ==========================================
    // 1. UPDATE UNIT ECONOMICS (Roles)
    //    We overwrite the "Formula (auto-calc)" column J, K, etc. with exact values.
    // ==========================================
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
        // The Average Cost per hour was in column K previously as a formula
        const row = economicsSheet.getRow(rowNum);
        const rate = results.roleRates[id] || 0;

        // Overwrite the formula with a hard value
        row.getCell(11).value = rate;
    }

    // Update Rate Card Sheet to remove links
    for (let r = 5; r <= 50; r++) {
        const row = rateSheet.getRow(r);
        const roleNameCell = row.getCell(1);
        const avgRateCell = row.getCell(4);

        // Simple resolution based on our role mapping
        const roleId = roleRows.find(x => {
            // Resolve formula value
            let name = roleNameCell.result || roleNameCell.value;
            if (name && name.result) name = name.result; // Handle rich formulas

            // Fuzzy match with the original name column
            const origRow = economicsSheet.getRow(x[1]);
            return origRow.getCell(2).value === name;
        })?.[0];

        if (roleId && results.roleRates[roleId] !== undefined) {
            avgRateCell.value = results.roleRates[roleId];
        }
    }


    // ==========================================
    // 2. UPDATE MARKETING COSTS
    // ==========================================
    const mktRowSpan = marketingSheet.getRow(33);
    // Erase formula, set explicit JS engine COA
    mktRowSpan.getCell(3).value = results.marketing.coa;


    // ==========================================
    // 3. UPDATE MASTER PRODUCT MATRIX
    // ==========================================
    // Matrix cols start at D (4) to W (23) -> 20 products
    for (let col = 4; col <= 23; col++) {
        const prodId = matrixSheet.getRow(6).getCell(col).value;
        const resProd = results.products.find(p => p.id === prodId);

        if (resProd) {
            // Overwrite calculated rows with JS engine outputs

            // Total Labor Cost (Row 32)
            matrixSheet.getRow(32).getCell(col).value = resProd.laborCost;

            // Total Govt Cost (Row 49)
            matrixSheet.getRow(49).getCell(col).value = resProd.govtCost;

            // CAC (Row 53)
            matrixSheet.getRow(53).getCell(col).value = resProd.coa;

            // Total Direct Cost (Row 54)
            matrixSheet.getRow(54).getCell(col).value = resProd.totalDirectCost;

            // Margin Amount (Row 57)
            matrixSheet.getRow(57).getCell(col).value = resProd.marginAmount;

            // Sale Price (Row 58)
            matrixSheet.getRow(58).getCell(col).value = resProd.salePrice;

            // Gross Profit (Row 59)
            matrixSheet.getRow(59).getCell(col).value = resProd.marginAmount; // Gross profit is margin diff here

            // 5Y LTV (Row 68)
            matrixSheet.getRow(68).getCell(col).value = resProd.ltv;

            // LTV:CAC Ratio (Row 69)
            matrixSheet.getRow(69).getCell(col).value = resProd.ltvCacRatio;
        }
    }


    // ==========================================
    // 4. UPDATE PRODUCT SUMMARY SHEET
    // ==========================================
    for (let i = 0; i < 20; i++) {
        const row = summarySheet.getRow(6 + i);
        const code = row.getCell(2).value;
        const resProd = results.products.find(p => p.id === code);

        if (resProd) {
            row.getCell(6).value = resProd.laborCost;
            row.getCell(7).value = resProd.govtCost;
            row.getCell(8).value = resProd.totalDirectCost;
            row.getCell(10).value = resProd.salePrice;
            row.getCell(11).value = resProd.marginAmount;
            row.getCell(12).value = resProd.ltv;
            row.getCell(13).value = resProd.ltvCacRatio;
        }
    }

    // ==========================================
    // 5. REMOVE 'Product Costing' Sheet (Dynamic per instance)
    //    Or we could leave it. For now, since it relies heavily on cross-sheet lookups,
    //    we can just save the workbook.
    // ==========================================

    const outputFilePath = './JS_Calculated_Unit_Economics.xlsx';
    await workbook.xlsx.writeFile(outputFilePath);
    console.log(`✅ Formatted final output written to: ${outputFilePath}`);
}

generateFinalFormat().catch(console.error);
