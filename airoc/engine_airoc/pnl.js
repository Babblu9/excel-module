/**
 * AIROC P&L Engine
 * Aggregates revenue and expenses into a monthly P&L statement.
 */

const { calculateRevenue } = require('./revenue');
const { calculateExpenses } = require('./opex');

function generatePnL(config) {
    const { branches, product, units, price } = config;

    // Growth factors (simplified for now)
    const growthFactors = {}; // All 1s

    const revenueProjections = calculateRevenue(branches, units, price, growthFactors);
    const expenseProjections = calculateExpenses(branches, 0); // Consumables handled inside mostly for now

    let pnl = [];

    for (let m = 0; m < 72; m++) {
        const rev = revenueProjections[m];
        const exp = expenseProjections[m];

        const ebitda = rev.revenue - exp.totalOpex;
        const ebitdaMargin = rev.revenue > 0 ? (ebitda / rev.revenue) * 100 : 0;

        pnl.push({
            month: m + 1,
            product: product,
            revenue: rev.revenue,
            staff: exp.staff,
            rent: exp.rent,
            marketing: exp.marketing,
            consumables: exp.consumables,
            totalExpenses: exp.totalOpex,
            ebitda: ebitda,
            ebitdaMargin: ebitdaMargin
        });
    }

    return pnl;
}

module.exports = { generatePnL };
