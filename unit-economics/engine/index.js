/**
 * Unit Economics Engine
 * Extracts calculation logic for roles, marketing conversions, and final product PnL
 */

function calculateUnitEconomics(data) {
    // 1. Calculate Role Rates (Cost Per Hour)
    const roleRates = {};
    for (const role of data.roles) {
        // Actual Hours = Standard Hours * Output Capacity
        const actualHours = role.standardHours * role.outputPercentage;
        // Cost per Hour = Average Salary / Actual Hours
        roleRates[role.id] = actualHours > 0 ? role.salary / actualHours : 0;
    }

    // 2. Calculate Marketing Cost of Acquisition (COA)
    let totalCustomers = data.marketing.totalLeads;
    for (const step of data.marketing.conversionFunnel) {
        totalCustomers *= step.conversionPct;
    }
    const coa = totalCustomers > 0 ? data.marketing.totalMonthlySpend / totalCustomers : 0;

    // 3. Process each product to compute pricing and LTV
    const productResults = [];
    for (const product of data.products) {
        // A. Labor Cost
        let laborCost = 0;
        for (const [roleId, hours] of Object.entries(product.laborHours)) {
            laborCost += hours * (roleRates[roleId] || 0);
        }

        // B. Government / Third-party Costs
        let govtCost = 0;
        if (product.govtCosts) {
            for (const cost of product.govtCosts) {
                govtCost += cost.amount;
            }
        }

        // C. Customer Acquisition Cost
        // (already computed as top-level 'coa' variable)

        // D. Total Direct Cost
        const totalDirectCost = laborCost + govtCost + coa;

        // F. Total Product Cost
        // In this iteration we simply assume indirect costs = 0, so D == F
        const totalProductCost = totalDirectCost;

        // G. Pricing
        const marginAmount = totalProductCost * product.marginPct;
        const salePrice = totalProductCost + marginAmount;

        // 5-Year LTV (Sale Price in Y1 + standard retention over 4 recurring years)
        const ltv = salePrice + (product.arr * product.retentionRate * 4);

        // LTV to CAC Ratio (using Total Direct Cost for the ratio denominator based on Excel)
        const ltvCacRatio = totalDirectCost > 0 ? ltv / totalDirectCost : 0;

        productResults.push({
            id: product.id,
            name: product.name,
            laborCost,
            govtCost,
            coa,
            totalDirectCost: totalProductCost,
            marginAmount,
            salePrice,
            ltv,
            ltvCacRatio
        });
    }

    return {
        roleRates,
        marketing: {
            coa,
            totalCustomers
        },
        products: productResults
    };
}

module.exports = { calculateUnitEconomics };
