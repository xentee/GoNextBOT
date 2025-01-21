const { loadBalances, saveBalances } = require('../utils/balances');

module.exports = {
    name: 'addbal',
    description: 'Ajoute un montant à la balance d’un membre mentionné.',
    execute(message, args) {
        const balances = loadBalances();

        if (args.length < 2) {
            return message.reply('Utilisation : !addbal <@membre> <montant>');
        }

        const member = message.mentions.members.first();
        const amount = parseInt(args[1], 10);

        if (!member || isNaN(amount)) {
            return message.reply('Membre ou montant invalide.');
        }

        balances[member.id] = (balances[member.id] || 0) + amount;
        saveBalances(balances);

        message.reply(`Ajouté ${amount} silver à la balance de ${member.displayName}.`);
    },
};
