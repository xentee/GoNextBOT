const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { getTopBalances } = require('../utils/store');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('topbal')
        .setDescription('Affiche les 10 plus grosses balances.'),
    async execute(interaction) {
        const topBalances = getTopBalances(10);

        if (topBalances.length === 0) {
            return interaction.reply('Aucune balance enregistree pour le moment.');
        }

        const fields = await Promise.all(topBalances.map(async (row, index) => {
            let username = `Utilisateur inconnu (${row.user_id})`;

            try {
                const member = await interaction.guild.members.fetch(row.user_id);
                username = member.displayName;
            } catch {
                try {
                    const user = await interaction.client.users.fetch(row.user_id);
                    username = user.tag;
                } catch {
                    // Keep fallback.
                }
            }

            return {
                name: `#${index + 1} - ${username}`,
                value: `${row.balance} silvers`,
                inline: false,
            };
        }));

        const embed = new EmbedBuilder()
            .setColor(0xffd700)
            .setTitle('TOP 10 BALANCES')
            .addFields(fields)
            .setFooter({ text: `Demande par ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

        await interaction.reply({ embeds: [embed] });
    },
};
