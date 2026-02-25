const { generatePnL } = require('./index');

const testConfig = {
    branches: 1,
    product: 'Radiotherapy Test',
    units: 100,
    price: 2500
};

const results = generatePnL(testConfig);

console.log('--- AIROC Engine Test (1 Branch, 100 units, 2500 price) ---');
console.log(`Month 1 Revenue: ${results[0].revenue}`);
console.log(`Month 1 Total Expenses: ${results[0].totalExpenses}`);
console.log(`Month 1 EBITDA: ${results[0].ebitda}`);
console.log(`EBITDA Margin: ${results[0].ebitdaMargin.toFixed(2)}%`);

// Verify scale
const testConfig10 = { ...testConfig, branches: 10 };
const results10 = generatePnL(testConfig10);
console.log('\n--- AIROC Engine Test (10 Branches) ---');
console.log(`Month 1 Revenue: ${results10[0].revenue}`);
console.log(`Month 1 Total Expenses: ${results10[0].totalExpenses}`);
console.log(`Month 1 EBITDA: ${results10[0].ebitda}`);
