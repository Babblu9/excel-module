/**
 * Sakiru P&L Engine
 */

function computePnL(yearlyRevenue, yearlyOpex) {
    const years = yearlyRevenue.length;
    const grossReceipts = yearlyRevenue;
    const totalExpenses = yearlyOpex;

    const ebitda = [];
    const netProfit = [];

    for (let y = 0; y < years; y++) {
        const currentEbitda = grossReceipts[y] - totalExpenses[y];
        ebitda.push(currentEbitda);

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
