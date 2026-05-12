const { SlashCommandBuilder } = require('discord.js');
const { requireAdmin } = require('../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Verifie que le bot repond.'),
    async execute(interaction) {
        if (!await requireAdmin(interaction)) return;

        await interaction.reply('Pong !');
    },
};
