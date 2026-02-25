/**
 * Instalette Business Plan Computational Engine API
 */

const { computeAllRevenue } = require('./revenueEngine');
const { computeAllOpex } = require('./opexEngine');
const { computePnL } = require('./pnlEngine');

function generateInstaletteProjections(config) {
    const services = [
        {
            name: 'Online sale',
            streamName: 'Instalette Instant snack premix',
            baseUnits: config.onlineSalePremix?.units || 0,
            price: config.onlineSalePremix?.price || 0,
            active: true
        },
        {
            name: 'Offline sale',
            streamName: 'Instalette Instant snack premix',
            baseUnits: config.offlineSalePremix?.units || 0,
            price: config.offlineSalePremix?.price || 0,
            active: true
        },
        {
            name: 'Online sale',
            streamName: 'Instalette -Price saver pack',
            baseUnits: config.onlineSaleSaver?.units || 0,
            price: config.onlineSaleSaver?.price || 0,
            active: true
        }
    ];

    const revenueOutputs = computeAllRevenue(services);

    // Hypothetical generic OPEX for Instalette tests
    const opexItems = [
        { name: 'Rent', baseUnits: 1, price: 30000, active: true },
        { name: 'Marketing', baseUnits: 1, price: 20000, active: true },
        { name: 'Logistics', baseUnits: config.onlineSalePremix?.units || 0, price: 10, active: true }
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
    generateInstaletteProjections
};
