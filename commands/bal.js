const { loadBalances } = require('../utils/balances');

module.exports = {
    name: 'bal',
    description: 'Affiche votre propre balance.',
    execute(message) {
        const balances = loadBalances();

        const balance = balances[message.author.id] || 0;
        message.reply(`Vous avez une balance de ${balance} silvers.`);
    },
};
