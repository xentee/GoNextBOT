const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { getBalance } = require('../utils/store');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription("Affiche la balance d'un membre.")
        .addUserOption(option => option
            .setName('membre')
            .setDescription('Membre a consulter')
            .setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('membre', true);
        const member = interaction.options.getMember('membre');
        const balance = getBalance(user.id);

        const embed = new EmbedBuilder()
            .setColor(0x3498db)
            .setTitle('Consultation de balance')
            .addFields(
                { name: 'Membre', value: member?.displayName || user.tag, inline: true },
                { name: 'Balance', value: `${balance} silver`, inline: true }
            )
            .setFooter({ text: `Consulte par ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

        await interaction.reply({ embeds: [embed] });
    },
};

