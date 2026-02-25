const { generateMoorgenProjections } = require('./index');

console.log("=== Testing Moorgen Standalone Engine ===");

const config = {
    franchisee: { units: 10, price: 500000 }
};

const projections = generateMoorgenProjections(config);

console.log("\n[Year 1-6] Projected Revenue:");
console.log(projections.revenue.yearlyGrand);

console.log("\n[Year 1-6] Projected Net Profit:");
console.log(projections.pnl.netProfit);
console.log("\nSuccessfully decoupled Moorgen logic into pure JSON arrays.");
