const { loadBalances } = require('../utils/balances');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'topbal',
    description: '**Classement des 10 plus grosses balances**',
    execute(message) {
        // Charger les balances
        const balances = loadBalances();

        // Convertir les balances en un tableau trié
        const sortedBalances = Object.entries(balances)
            .sort(([, a], [, b]) => b - a) // Trier par valeur décroissante
            .slice(0, 10); // Prendre les 10 premières

        // Vérifier si des données existent
        if (sortedBalances.length === 0) {
            return message.reply("Aucune balance enregistrée pour le moment.");
        }

        // Construire les champs pour l'embed
        const fields = sortedBalances.map(([userId, balance], index) => {
            const user = message.guild.members.cache.get(userId);
            const username = user ? user.displayName : `Utilisateur inconnu (${userId})`;
            return {
                name: `#${index + 1} - ${username}`,
                value: `${balance} silvers`,
                inline: false,
            };
        });

        // Créer un embed pour afficher les top balances
        const embed = new EmbedBuilder()
            .setColor(0xffd700)
            .setTitle('TOP 10 BALANCES')
            .addFields(fields)
            .setFooter({ text: `Demandé par ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        // Envoyer l'embed
        message.channel.send({ embeds: [embed] });
    },
};
