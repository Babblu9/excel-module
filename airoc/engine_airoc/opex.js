/**
 * AIROC OPEX Engine
 * Calculates expenses based on Branch Count and base costs from the template.
 */

function calculateExpenses(branches, monthlyRevenueTotal) {
    const months = 72;
    let projections = [];

    // Base Monthly Costs (estimated from Year 1 summary divided by 9 months)
    const baseCosts = {
        staff: 5740000 / 9,
        consumables: 352035 / 9, // Non-pharmacy consumables
        pharmacy_cost_ratio: 0.85, // Pharmacy cost is usually a ratio of pharmacy revenue
        rent: 5546000 / 9,
        utilities: (1500000 + 900000) / 9,
        indirect_staff: 2500000 / 9,
        marketing: 463708 / 9
    };

    for (let m = 1; m <= months; m++) {
        const staffExp = baseCosts.staff * branches;
        const rentExp = baseCosts.rent * branches;
        const utilExp = baseCosts.utilities * branches;
        const indirectStaffExp = baseCosts.indirect_staff * branches;
        const marketingExp = baseCosts.marketing * branches;

        // Consumables and Pharmacy costs often scale with revenue
        // Assuming non-pharmacy consumables scale with branch count
        const consumablesExp = baseCosts.consumables * branches;

        const totalOpex = staffExp + rentExp + utilExp + indirectStaffExp + marketingExp + consumablesExp;

        projections.push({
            month: m,
            staff: staffExp,
            rent: rentExp,
            utilities: utilExp,
            indirectStaff: indirectStaffExp,
            marketing: marketingExp,
            consumables: consumablesExp,
            totalOpex: totalOpex
        });
    }

    return projections;
}

module.exports = { calculateExpenses };
