const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guide')
        .setDescription('Affiche le guide des commandes disponibles.'),
    async execute(interaction) {
        const guide = `
**Guide d'utilisation du bot**

\`/bal\`
Affiche votre balance.

\`/balance membre:@membre\`
Affiche la balance du membre selectionne.

\`/topbal\`
Affiche le classement des 10 plus grosses balances.

\`/addbal membre:@membre montant:100\`
Ajoute un montant a la balance du membre.

\`/removebal membre:@membre montant:50\`
Retire un montant de la balance du membre.

\`/clearbal membre:@membre\`
Reinitialise la balance du membre.

\`/payout montant_total:1000 cout_reparation:200 role:@Joueurs\`
Distribue le montant a tous les membres du role.

\`/history membre:@membre\`
Affiche l'historique pagine des transactions du membre avec l'auteur de chaque ligne. Admin uniquement.

\`/lastpayout\`
Affiche le dernier payout. Admin uniquement.
`;

        await interaction.reply({ content: guide, ephemeral: true });
    },
};
