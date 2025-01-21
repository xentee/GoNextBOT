const { loadBalances, saveBalances } = require('../utils/balances');

module.exports = {
    name: 'clearbal',
    description: 'Réinitialise la balance d’un membre mentionné.',
    execute(message, args) {
        // Charger les balances
        const balances = loadBalances();

        // Vérifier les arguments
        if (args.length < 1) {
            return message.reply('Utilisation : !clearbal <@membre>');
        }

        const member = message.mentions.members.first();

        // Valider le membre
        if (!member) {
            return message.reply('Vous devez mentionner un membre valide.');
        }

        // Réinitialiser la balance
        balances[member.id] = 0;
        saveBalances(balances);

        // Répondre à l'utilisateur
        message.reply(`La balance de ${member.displayName} a été réinitialisée à 0 silver.`);
    },
};
