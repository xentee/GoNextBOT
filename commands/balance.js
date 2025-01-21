const { loadBalances } = require('../utils/balances');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'balance',
    description: 'Affiche la balance d’un membre mentionné.',
    execute(message, args) {
        // Charger les balances
        const balances = loadBalances();

        // Vérifier si un membre est mentionné
        if (args.length === 0) {
            return message.reply('Utilisation : !balance <@membre>');
        }

        const member = message.mentions.members.first();

        // Vérifier si le membre mentionné existe
        if (!member) {
            return message.reply('Vous devez mentionner un membre valide.');
        }

        // Récupérer la balance du membre
        const balance = balances[member.id] || 0;

        // Créer un embed pour afficher la balance
        const embed = new EmbedBuilder()
            .setColor(0x3498db)
            .setTitle('Consultation de balance')
            .addFields(
                { name: 'Membre', value: `${member.displayName}`, inline: true },
                { name: 'Balance', value: `${balance} silver`, inline: true }
            )
            .setFooter({ text: `Consulté par ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        // Envoyer l'embed
        message.channel.send({ embeds: [embed] });
    },
};
