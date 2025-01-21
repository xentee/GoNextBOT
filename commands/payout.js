const { loadBalances, saveBalances } = require('../utils/balances');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'payout',
    description: 'Distribue un montant entre les membres mentionnés après soustraction des coûts et taxes.',
    execute(message, args) {
        // Charger les balances
        const balances = loadBalances();

        // Vérification des arguments
        if (args.length < 3) {
            return message.reply('Utilisation : !payout <montant_total> <coût_réparation> <@membres...>');
        }

        const totalAmount = parseInt(args[0], 10);
        const repairCost = parseInt(args[1], 10);
        const members = message.mentions.members;

        // Valider les montants et les membres
        if (isNaN(totalAmount) || totalAmount <= 0) {
            return message.reply('Le montant total doit être un nombre positif.');
        }
        if (isNaN(repairCost) || repairCost < 0) {
            return message.reply('Le coût de réparation doit être un nombre positif ou nul.');
        }
        if (!members.size) {
            return message.reply('Vous devez mentionner au moins un membre.');
        }

        // Calcul des valeurs
        const afterRepairs = totalAmount - repairCost;
        if (afterRepairs < 0) {
            return message.reply('Le montant total est insuffisant pour couvrir les coûts de réparation.');
        }

        const afterTax = afterRepairs * 0.9; // 10% de taxe
        const sharePerMember = Math.floor(afterTax / members.size);

        // Mettre à jour les balances des membres
        members.forEach(member => {
            balances[member.id] = (balances[member.id] || 0) + sharePerMember;
        });

        // Sauvegarder les balances mises à jour
        saveBalances(balances);

        // Créer un embed sans description
        const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('**PAYOUT**')
            .addFields(
                { name: 'Montant total', value: `${totalAmount} silver`, inline: true },
                { name: 'Après réparations', value: `${afterRepairs} silver`, inline: true },
                { name: 'Après taxes', value: `${Math.floor(afterTax)} silver`, inline: true },
                {
                    name: 'Répartition',
                    value: members
                        .map(member => `**${member.displayName}** : +${sharePerMember} silver`)
                        .join('\n'),
                }
            )
            .setFooter({ text: `Commandé par ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        // Envoyer l'embed
        message.channel.send({ embeds: [embed] });
    },
};
