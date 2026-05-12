const { SlashCommandBuilder } = require('discord.js');
const { requireAdmin } = require('../utils/permissions');
const { clearBalance } = require('../utils/store');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearbal')
        .setDescription("Reinitialise la balance d'un membre.")
        .addUserOption(option => option
            .setName('membre')
            .setDescription('Membre a reinitialiser')
            .setRequired(true)),
    async execute(interaction) {
        if (!await requireAdmin(interaction)) return;

        const user = interaction.options.getUser('membre', true);
        const member = interaction.options.getMember('membre');

        clearBalance({
            userId: user.id,
            actorId: interaction.user.id,
        });

        await interaction.reply(`La balance de ${member?.displayName || user.tag} a ete reinitialisee a 0 silver.`);
    },
};
