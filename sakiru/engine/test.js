const { generateSakiruProjections } = require('./index');

console.log("=== Testing Sakiru Standalone Engine ===");

const config = {
    planA: { units: 100, price: 1000 },
    planB: { units: 50, price: 2500 },
    oneDayEvent: { units: 2, price: 20000 }
};

const projections = generateSakiruProjections(config);

console.log("\n[Year 1-6] Projected Revenue:");
console.log(projections.revenue.yearlyGrand);

console.log("\n[Year 1-6] Projected Net Profit:");
console.log(projections.pnl.netProfit);
console.log("\nSuccessfully decoupled Sakiru logic into pure JSON arrays.");
