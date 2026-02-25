const { calculateUnitEconomics } = require('./engine/index.js');

const testData = {
    roles: [
        { id: 'data_entry', name: 'Data Entry', salary: 15000, standardHours: 208, outputPercentage: 0.8 },
        { id: 'jr_acct', name: 'Junior Accountant', salary: 20000, standardHours: 208, outputPercentage: 0.8 },
        { id: 'reviewer', name: 'Reviewer/Semi Qualified', salary: 40000, standardHours: 208, outputPercentage: 0.8 },
        { id: 'sales_jr', name: 'Sales Men - Jr', salary: 20000, standardHours: 208, outputPercentage: 0.8 },
        { id: 'telecaller_jr', name: 'Telecaller - Jr', salary: 15000, standardHours: 208, outputPercentage: 0.8 },
        { id: 'cs_exec', name: 'Customer Success Executive', salary: 27500, standardHours: 208, outputPercentage: 0.8 }
    ],
    marketing: {
        totalMonthlySpend: 155000,
        totalLeads: 740,
        conversionFunnel: [
            { name: 'MQL', conversionPct: 0.4 },
            { name: 'SQL', conversionPct: 0.5 },
            { name: 'Proposals', conversionPct: 0.7 },
            { name: 'Closed Won', conversionPct: 0.3 }
        ]
    },
    products: [
        {
            id: 'PVT-001',
            name: 'Pvt Ltd Company',
            laborHours: {
                'jr_acct': 8,
                'reviewer': 1,
                'sales_jr': 1,
                'telecaller_jr': 1,
                'cs_exec': 0.5
            },
            govtCosts: [
                { name: 'Stamp Duty', amount: 1200 },
                { name: 'DSC 1', amount: 1300 },
                { name: 'DSC 2', amount: 1300 },
                { name: 'Name Approval', amount: 1000 },
                { name: 'SPICe+', amount: 500 }
            ],
            marginPct: 0.25,
            arr: 20000,
            retentionRate: 0.8
        }
    ]
};

const results = calculateUnitEconomics(testData);

console.log("=== Role Rates ===");
console.log(`Junior Accountant: ${results.roleRates['jr_acct'].toFixed(2)}`);

console.log("\n=== Marketing ===");
console.log(`Total Customers: ${results.marketing.totalCustomers.toFixed(2)}`);
console.log(`COA: ${results.marketing.coa.toFixed(2)}`);

console.log("\n=== PVT-001 Product Results ===");
const pvt = results.products[0];
console.log(`Labor Cost: ${pvt.laborCost.toFixed(2)}`);
console.log(`Govt Cost: ${pvt.govtCost.toFixed(2)}`);
console.log(`COA: ${pvt.coa.toFixed(2)}`);
console.log(`Total Direct Cost: ${pvt.totalDirectCost.toFixed(2)}`);
console.log(`Sale Price: ${pvt.salePrice.toFixed(2)}`);
console.log(`5-Year LTV: ${pvt.ltv.toFixed(2)}`);
console.log(`LTV/CAC Ratio: ${pvt.ltvCacRatio.toFixed(2)}`);
