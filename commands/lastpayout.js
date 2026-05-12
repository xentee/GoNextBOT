const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { requireAdmin } = require('../utils/permissions');
const { getLastPayout } = require('../utils/store');

function parseMetadata(row) {
    try {
        return JSON.parse(row.metadata || '{}');
    } catch {
        return {};
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lastpayout')
        .setDescription('Affiche le dernier payout enregistre.'),
    async execute(interaction) {
        if (!await requireAdmin(interaction)) return;

        const rows = getLastPayout();

        if (rows.length === 0) {
            return interaction.reply('Aucun payout enregistre pour le moment.');
        }

        const metadata = parseMetadata(rows[0]);
        const recipients = await Promise.all(rows.map(async row => {
            try {
                const member = await interaction.guild.members.fetch(row.target_id);
                return `**${member.displayName}** : +${row.amount} silver`;
            } catch {
                return `<@${row.target_id}> : +${row.amount} silver`;
            }
        }));

        const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('Dernier payout')
            .addFields(
                { name: 'Batch', value: rows[0].batch_id, inline: false },
                { name: 'Cible', value: metadata.target || 'Inconnue', inline: true },
                { name: 'Montant total', value: `${metadata.totalAmount ?? '?'} silver`, inline: true },
                { name: 'Apres taxes', value: `${metadata.afterTax ?? '?'} silver`, inline: true },
                { name: 'Joueurs payes', value: `${rows.length}`, inline: true },
                { name: 'Reste non distribue', value: `${metadata.remainder ?? 0} silver`, inline: true },
                { name: 'Repartition', value: recipients.join('\n').slice(0, 1024), inline: false }
            )
            .setFooter({ text: `Demande par ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

        await interaction.reply({ embeds: [embed] });
    },
};
