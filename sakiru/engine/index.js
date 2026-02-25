/**
 * Sakiru Business Plan Computational Engine API
 */

const { computeAllRevenue } = require('./revenueEngine');
const { computeAllOpex } = require('./opexEngine');
const { computePnL } = require('./pnlEngine');

function generateSakiruProjections(config) {
    const services = [
        {
            name: 'Subscription A',
            streamName: 'Plan A',
            baseUnits: config.planA?.units || 0,
            price: config.planA?.price || 0,
            active: true
        },
        {
            name: 'Subscription B',
            streamName: 'Plan B',
            baseUnits: config.planB?.units || 0,
            price: config.planB?.price || 0,
            active: true
        },
        {
            name: 'Events',
            streamName: 'One Day Event',
            baseUnits: config.oneDayEvent?.units || 0,
            price: config.oneDayEvent?.price || 0,
            active: true
        }
    ];

    const revenueOutputs = computeAllRevenue(services);

    const opexItems = [
        { name: 'Servers', baseUnits: 1, price: 100000, active: true },
        { name: 'Salaries', baseUnits: 5, price: 80000, active: true },
        { name: 'Event Hosting', baseUnits: config.oneDayEvent?.units || 0, price: 5000, active: true }
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
    generateSakiruProjections
};
