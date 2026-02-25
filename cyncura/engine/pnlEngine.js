/**
 * Cyncura P&L Engine
 * Combines Revenue and OPEX to produce P&L
 */

function computePnL(yearlyRevenue, yearlyOpex) {
    const years = yearlyRevenue.length;
    const grossReceipts = yearlyRevenue;
    const totalExpenses = yearlyOpex;

    const ebitda = [];
    const netProfit = [];

    for (let y = 0; y < years; y++) {
        // EBITDA = Revenue - OPEX (excluding depreciation/amortization here for simplicity of standalone logic)
        const currentEbitda = grossReceipts[y] - totalExpenses[y];
        ebitda.push(currentEbitda);

        // Assume standard 25% tax rate if profitable
        const tax = currentEbitda > 0 ? currentEbitda * 0.25 : 0;
        netProfit.push(currentEbitda - tax);
    }

    return {
        grossReceipts,
        totalExpenses,
        ebitda,
        netProfit
    };
}

module.exports = {
    computePnL
};
