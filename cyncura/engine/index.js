/**
 * Cyncura Business Plan Computational Engine API
 */

const { computeAllRevenue } = require('./revenueEngine');
const { computeAllOpex } = require('./opexEngine');
const { computePnL } = require('./pnlEngine');

function generateCyncuraProjections(config) {
    // 1. Parse Revenue Config
    const services = [
        {
            name: 'Platform Access',
            streamName: 'Doctor Consultations',
            baseUnits: config.platformAccess?.units || 0,
            price: config.platformAccess?.price || 0,
            active: true
        },
        {
            name: 'Advertisement',
            streamName: 'Advertisement',
            baseUnits: config.advertisementRevenue?.units || 0,
            price: config.advertisementRevenue?.price || 0,
            active: true
        }
    ];

    const revenueOutputs = computeAllRevenue(services);

    // 2. Parse OPEX Config
    const opexItems = [
        {
            name: 'App Development',
            baseUnits: config.appDevelopment?.units || 0,
            price: config.appDevelopment?.price || 0,
            active: true
        },
        {
            name: 'Rent',
            baseUnits: config.rent?.units || 0,
            price: config.rent?.price || 0,
            active: true
        },
        {
            name: 'Tech Salaries',
            baseUnits: config.techOpsSalaries?.units || 0,
            price: config.techOpsSalaries?.price || 0,
            active: true
        }
    ];

    const opexOutputs = computeAllOpex(opexItems);

    // 3. Compute Final P&L
    const pnl = computePnL(revenueOutputs.yearlyGrand, opexOutputs.yearlyGrand);

    return {
        revenue: revenueOutputs,
        opex: opexOutputs,
        pnl: pnl
    };
}

module.exports = {
    generateCyncuraProjections
};
