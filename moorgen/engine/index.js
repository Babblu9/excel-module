/**
 * Moorgen Business Plan Computational Engine API
 */

const { computeAllRevenue } = require('./revenueEngine');
const { computeAllOpex } = require('./opexEngine');
const { computePnL } = require('./pnlEngine');

function generateMoorgenProjections(config) {
    const services = [
        {
            name: 'Franchisee',
            streamName: 'Franchisee Setup',
            baseUnits: config.franchisee?.units || 0,
            price: config.franchisee?.price || 0,
            active: true
        }
    ];

    const revenueOutputs = computeAllRevenue(services);

    const opexItems = [
        { name: 'Admin', baseUnits: 5, price: 50000, active: true },
        { name: 'Franchise Support', baseUnits: config.franchisee?.units || 0, price: 10000, active: true }
    ];

    const opexOutputs = computeAllOpex(opexItems);
    const pnl = computePnL(revenueOutputs.yearlyGrand, opexOutputs.yearlyGrand);

    return {
        revenue: revenueOutputs,
        opex: opexOutputs,
        pnl: pnl
    };
}

module.exports = {
    generateMoorgenProjections
};
