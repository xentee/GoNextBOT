const { SlashCommandBuilder } = require('discord.js');
const { requireAdmin } = require('../utils/permissions');
const { getBalance, removeBalance } = require('../utils/store');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removebal')
        .setDescription("Retire un montant a la balance d'un membre.")
        .addUserOption(option => option
            .setName('membre')
            .setDescription('Membre a debiter')
            .setRequired(true))
        .addIntegerOption(option => option
            .setName('montant')
            .setDescription('Montant a retirer')
            .setMinValue(1)
            .setRequired(true)),
    async execute(interaction) {
        if (!await requireAdmin(interaction)) return;

        const user = interaction.options.getUser('membre', true);
        const member = interaction.options.getMember('membre');
        const amount = interaction.options.getInteger('montant', true);
        const currentBalance = getBalance(user.id);

        if (currentBalance < amount) {
            return interaction.reply(`${member?.displayName || user.tag} n'a pas assez de silvers. Solde actuel : ${currentBalance} silvers.`);
        }

        const nextBalance = removeBalance({
            userId: user.id,
            amount,
            actorId: interaction.user.id,
        });

        await interaction.reply(`Retire ${amount} silvers de la balance de ${member?.displayName || user.tag}. Nouveau solde : ${nextBalance} silvers.`);
    },
};

