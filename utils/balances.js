const fs = require('fs');
const balancesFile = './balances.json';

// Charger les balances
function loadBalances() {
    if (!fs.existsSync(balancesFile)) {
        fs.writeFileSync(balancesFile, JSON.stringify({}));
    }
    const rawData = fs.readFileSync(balancesFile);
    return JSON.parse(rawData);
}

// Sauvegarder les balances
function saveBalances(balances) {
    fs.writeFileSync(balancesFile, JSON.stringify(balances, null, 4));
}

module.exports = { loadBalances, saveBalances };
