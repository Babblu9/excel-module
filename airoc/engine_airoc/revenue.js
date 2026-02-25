/**
 * AIROC Revenue Engine
 * Calculates revenue based on Branch Count, Monthly Units per branch, and Sale Price.
 */

function calculateRevenue(branches, unitsPerBranch, pricePerUnit, growthFactors) {
    const months = 72;
    let projections = [];

    let currentUnits = unitsPerBranch * branches;
    let currentPrice = pricePerUnit;

    for (let m = 1; m <= months; m++) {
        // Growth factor for this month (default to 1 if not provided)
        const growthQty = growthFactors[m] ? growthFactors[m].qty : 1;
        const growthPrice = growthFactors[m] ? growthFactors[m].price : 1;

        if (m > 1) {
            currentUnits *= growthQty;
            currentPrice *= growthPrice;
        }

        const totalRevenue = currentUnits * currentPrice;

        projections.push({
            month: m,
            units: currentUnits,
            price: currentPrice,
            revenue: totalRevenue
        });
    }

    return projections;
}

module.exports = { calculateRevenue };
