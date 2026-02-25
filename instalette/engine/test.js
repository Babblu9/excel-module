const { generateInstaletteProjections } = require('./index');

console.log("=== Testing Instalette Standalone Engine ===");

const config = {
    onlineSalePremix: { units: 1000, price: 50 },
    offlineSalePremix: { units: 500, price: 40 },
    onlineSaleSaver: { units: 200, price: 100 }
};

const projections = generateInstaletteProjections(config);

console.log("\n[Year 1-6] Projected Revenue:");
console.log(projections.revenue.yearlyGrand);

console.log("\n[Year 1-6] Projected Net Profit:");
console.log(projections.pnl.netProfit);
console.log("\nSuccessfully decoupled Instalette logic into pure JSON arrays.");
