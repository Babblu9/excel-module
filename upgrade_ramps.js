const fs = require('fs');
const path = require('path');

function upgradeEngineForRamps(project) {
    const enginePath = path.join(__dirname, project, 'engine', 'revenueEngine.js');
    let content = fs.readFileSync(enginePath, 'utf8');

    // Upgrade the function implementation
    const oldCode = `        const quantity = currentUnits;`;
    const newCode = `        // Support hardcoded sales number ramps (e.g., first 6 months)
        let quantity = currentUnits;
        if (service.manualRamp && m < service.manualRamp.length) {
            quantity = service.manualRamp[m];
            currentUnits = quantity; // anchor the future formulas to the last hardcoded ramp month
        }`;

    // Only replace if hasn't been replaced yet
    if (!content.includes('manualRamp')) {
        content = content.replace(oldCode, newCode);
        fs.writeFileSync(enginePath, content, 'utf8');
        console.log(`✅ Upgraded ${project} revenueEngine for hardcoded ramps.`);
    }
}

['cyncura', 'instalette', 'moorgen', 'sakiru'].forEach(upgradeEngineForRamps);
