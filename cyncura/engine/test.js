const { generateCyncuraProjections } = require('./index');

console.log("=== Testing Cyncura Standalone Engine ===");

const config = {
    platformAccess: { units: 5000, price: 100 },
    advertisementRevenue: { units: 1000, price: 50 },
    appDevelopment: { units: 1, price: 200000 },
    rent: { units: 1, price: 50000 },
    techOpsSalaries: { units: 5, price: 60000 }
};

const projections = generateCyncuraProjections(config);

console.log("\n[Year 1-6] Projected Net Profit:");
console.log(projections.pnl.netProfit);
console.log("\nSuccessfully decoupled logic into pure JSON arrays.");
