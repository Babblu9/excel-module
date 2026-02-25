/**
 * Moorgen OPEX Engine
 */

const MOORGEN_OPEX_INFLATION = {
    yearlyStepUps: {
        2: 0.15, // Higher inflation for franchise scaling cost
        3: 0.15,
        4: 0.15,
        5: 0.10,
    }
};

function getYearIndex(month) {
    if (month < 7) return 1;
    return Math.floor((month - 7) / 12) + 2;
}

function computeOpexMonthly(costItem, totalMonths = 72) {
    if (!costItem.active || costItem.baseUnits <= 0 || costItem.price <= 0) {
        return Array.from({ length: totalMonths }, () => 0);
    }

    const results = [];
    let currentCost = costItem.baseUnits * costItem.price;

    for (let m = 0; m < totalMonths; m++) {
        const yearIdx = getYearIndex(m);

        if (m > 0) {
            const prevYearIdx = getYearIndex(m - 1);
            if (yearIdx !== prevYearIdx) {
                const stepUp = MOORGEN_OPEX_INFLATION.yearlyStepUps[yearIdx] ?? 0;
                currentCost = currentCost * (1 + stepUp);
            }
        }

        results.push(Math.round(currentCost * 100) / 100);
    }

    return results;
}

function computeAllOpex(costItems, totalMonths = 72) {
    const monthlyGrand = new Array(totalMonths).fill(0);

    for (const item of costItems) {
        const monthly = computeOpexMonthly(item, totalMonths);
        for (let m = 0; m < totalMonths; m++) {
            monthlyGrand[m] += monthly[m];
        }
    }

    const yearlyGrand = aggregateYearly(monthlyGrand);
    return { monthlyGrand, yearlyGrand };
}

function aggregateYearly(monthly) {
    const years = [];
    years.push(monthly.slice(0, 7).reduce((a, b) => a + b, 0));
    for (let y = 1; y <= 5; y++) {
        const start = 7 + (y - 1) * 12;
        years.push(monthly.slice(start, start + 12).reduce((a, b) => a + b, 0));
    }
    return years.map(v => Math.round(v * 100) / 100);
}

module.exports = {
    computeAllOpex,
};
