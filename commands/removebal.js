const { loadBalances, saveBalances } = require('../utils/balances');

module.exports = {
    name: 'removebal',
    description: 'Retire un montant à la balance d’un membre mentionné.',
    execute(message, args) {
        // Charger les balances
        const balances = loadBalances();

        // Vérifier les arguments
        if (args.length < 2) {
            return message.reply('Utilisation : !removebal <@membre> <montant>');
        }

        const member = message.mentions.members.first();
        const amount = parseInt(args[1], 10);

        // Valider le membre et le montant
        if (!member) {
            return message.reply('Vous devez mentionner un membre valide.');
        }

        if (isNaN(amount) || amount <= 0) {
            return message.reply('Le montant doit être un nombre positif.');
        }

        // Vérifier la balance actuelle
        const currentBalance = balances[member.id] || 0;
        if (currentBalance < amount) {
            return message.reply(`${member.displayName} n’a pas assez de silvers. Solde actuel : ${currentBalance} silvers`);
        }

        // Mettre à jour la balance
        balances[member.id] -= amount;
        saveBalances(balances);

        // Répondre à l'utilisateur
        message.reply(`Retiré ${amount} silvers de la balance de ${member.displayName}. Nouveau solde : ${balances[member.id]} silvers.`);
    },
};
