/**
 * Sakiru Revenue Engine
 */

const SAKIRU_REVENUE_GROWTH = {
    // Subscription Growth model
    yearlyStepUps: {
        2: 0.25, // Subscription userbase scales by 25% YoY
        3: 0.25,
        4: 0.20,
        5: 0.15,
    },
};

function getYearIndex(month) {
    if (month < 7) return 1;
    return Math.floor((month - 7) / 12) + 2;
}

function computeServiceMonthly(service, totalMonths = 72) {
    if (!service.active || service.baseUnits <= 0 || service.price <= 0) {
        return Array.from({ length: totalMonths }, (_, m) => ({
            month: m, quantity: 0, price: 0, revenue: 0,
        }));
    }

    const results = [];
    let currentUnits = service.baseUnits;
    const currentPrice = service.price;

    for (let m = 0; m < totalMonths; m++) {
        const yearIdx = getYearIndex(m);

        if (m > 0) {
            const prevYearIdx = getYearIndex(m - 1);
            if (yearIdx !== prevYearIdx) {
                const stepUp = SAKIRU_REVENUE_GROWTH.yearlyStepUps[yearIdx] ?? 0;
                currentUnits = currentUnits * (1 + stepUp);
            }
        }

        const quantity = currentUnits;
        const revenue = quantity * currentPrice;

        results.push({
            month: m,
            quantity: Math.round(quantity * 100) / 100,
            price: currentPrice,
            revenue: Math.round(revenue * 100) / 100,
        });
    }

    return results;
}

function computeAllRevenue(services, totalMonths = 72) {
    const streams = {};
    const monthlyGrand = new Array(totalMonths).fill(0);

    for (const service of services) {
        const monthly = computeServiceMonthly(service, totalMonths);

        if (!streams[service.streamName]) {
            streams[service.streamName] = {
                name: service.streamName,
                monthlyTotal: new Array(totalMonths).fill(0),
            };
        }

        for (let m = 0; m < totalMonths; m++) {
            streams[service.streamName].monthlyTotal[m] += monthly[m].revenue;
            monthlyGrand[m] += monthly[m].revenue;
        }
    }

    const yearlyGrand = aggregateYearly(monthlyGrand);
    return { streams, monthlyGrand, yearlyGrand };
}

function aggregateYearly(monthly) {
    const years = [];
    years.push(monthly.slice(0, 7).reduce((a, b) => a + b, 0));
    for (let y = 1; y <= 5; y++) {
        const start = 7 + (y - 1) * 12;
        const end = start + 12;
        years.push(monthly.slice(start, end).reduce((a, b) => a + b, 0));
    }
    return years.map(v => Math.round(v * 100) / 100);
}

module.exports = {
    computeAllRevenue,
};
