const { SlashCommandBuilder } = require('discord.js');
const { getBalance } = require('../utils/store');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bal')
        .setDescription('Affiche votre balance.'),
    async execute(interaction) {
        const balance = getBalance(interaction.user.id);
        await interaction.reply(`Vous avez une balance de ${balance} silvers.`);
    },
};

