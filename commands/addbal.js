const { SlashCommandBuilder } = require('discord.js');
const { requireAdmin } = require('../utils/permissions');
const { addBalance } = require('../utils/store');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addbal')
        .setDescription("Ajoute un montant a la balance d'un membre.")
        .addUserOption(option => option
            .setName('membre')
            .setDescription('Membre a crediter')
            .setRequired(true))
        .addIntegerOption(option => option
            .setName('montant')
            .setDescription('Montant a ajouter')
            .setMinValue(1)
            .setRequired(true)),
    async execute(interaction) {
        if (!await requireAdmin(interaction)) return;

        const user = interaction.options.getUser('membre', true);
        const member = interaction.options.getMember('membre');
        const amount = interaction.options.getInteger('montant', true);
        const nextBalance = addBalance({
            userId: user.id,
            amount,
            actorId: interaction.user.id,
            type: 'addbal',
        });

        await interaction.reply(`Ajoute ${amount} silvers a la balance de ${member?.displayName || user.tag}. Nouveau solde : ${nextBalance} silvers.`);
    },
};

