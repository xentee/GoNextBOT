const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    SlashCommandBuilder,
} = require('discord.js');
const { requireAdmin } = require('../utils/permissions');
const { countHistory, getHistory } = require('../utils/store');

const PAGE_SIZE = 10;

function formatTransaction(row) {
    const amount = row.amount > 0 ? `+${row.amount}` : `${row.amount}`;
    return `#${row.id} | ${row.type} | ${amount} | solde ${row.balance_after} | par <@${row.actor_id}> | ${row.created_at}`;
}

function buildComponents(page, totalPages, disabled = false) {
    return [
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('history_prev')
                .setLabel('Precedent')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled || page <= 0),
            new ButtonBuilder()
                .setCustomId('history_next')
                .setLabel('Suivant')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled || page >= totalPages - 1)
        ),
    ];
}

function buildEmbed({ rows, page, totalPages, targetName, requester }) {
    return new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`Historique - ${targetName}`)
        .setDescription(rows.map(formatTransaction).join('\n').slice(0, 4096))
        .setFooter({ text: `Page ${page + 1}/${totalPages} - Demande par ${requester.tag}`, iconURL: requester.displayAvatarURL() });
}

function buildPage({ userId, page, totalPages, targetName, requester }) {
    const rows = getHistory(userId, PAGE_SIZE, page * PAGE_SIZE);
    const embed = buildEmbed({ rows, page, totalPages, targetName, requester });

    return {
        embeds: [embed],
        components: buildComponents(page, totalPages),
    };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('history')
        .setDescription("Affiche l'historique des transactions d'un membre.")
        .addUserOption(option => option
            .setName('membre')
            .setDescription('Membre a auditer')
            .setRequired(true)),
    async execute(interaction) {
        if (!await requireAdmin(interaction)) return;

        const user = interaction.options.getUser('membre', true);
        const member = interaction.options.getMember('membre');
        const totalRows = countHistory(user.id);

        if (totalRows === 0) {
            return interaction.reply(`Aucune transaction trouvee pour ${member?.displayName || user.tag}.`);
        }

        let page = 0;
        const totalPages = Math.ceil(totalRows / PAGE_SIZE);
        const targetName = member?.displayName || user.tag;
        const message = await interaction.reply({
            ...buildPage({ userId: user.id, page, totalPages, targetName, requester: interaction.user }),
            fetchReply: true,
        });

        const collector = message.createMessageComponentCollector({
            filter: buttonInteraction => buttonInteraction.user.id === interaction.user.id,
            time: 120000,
        });

        collector.on('collect', async buttonInteraction => {
            if (buttonInteraction.customId === 'history_prev') {
                page = Math.max(0, page - 1);
            }

            if (buttonInteraction.customId === 'history_next') {
                page = Math.min(totalPages - 1, page + 1);
            }

            await buttonInteraction.update(buildPage({
                userId: user.id,
                page,
                totalPages,
                targetName,
                requester: interaction.user,
            }));
        });

        collector.on('end', async () => {
            try {
                await interaction.editReply({
                    components: buildComponents(page, totalPages, true),
                });
            } catch {
                // The message may have been deleted.
            }
        });
    },
};
