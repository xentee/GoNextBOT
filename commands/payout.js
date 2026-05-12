const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { requireAdmin } = require('../utils/permissions');
const { payout } = require('../utils/store');

async function resolveRoleMembers(interaction) {
    const role = interaction.options.getRole('role', true);

    await interaction.guild.members.fetch();

    return role.members
        .filter(member => !member.user.bot)
        .map(member => member);
}

function buildPayoutEmbed({ interaction, recipients, totalAmount, repairCost, targetSummary, batchId }) {
    const afterRepairs = totalAmount - repairCost;
    const afterTax = Math.floor(afterRepairs * 0.9);
    const sharePerMember = Math.floor(afterTax / recipients.length);
    const remainder = afterTax - (sharePerMember * recipients.length);

    const repartition = recipients
        .map(member => `**${member.displayName || member.tag}** : +${sharePerMember} silver`)
        .join('\n')
        .slice(0, 1024);

    return new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle('PAYOUT')
        .addFields(
            { name: 'Cible', value: targetSummary, inline: false },
            { name: 'Joueurs payes', value: `${recipients.length}`, inline: true },
            { name: 'Montant total', value: `${totalAmount} silver`, inline: true },
            { name: 'Apres reparations', value: `${afterRepairs} silver`, inline: true },
            { name: 'Apres taxes', value: `${afterTax} silver`, inline: true },
            { name: 'Repartition', value: repartition || 'Aucun membre', inline: false },
            { name: 'Reste non distribue', value: `${remainder} silver`, inline: true },
            { name: 'Audit batch', value: batchId, inline: false }
        )
        .setFooter({ text: `Commande par ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('payout')
        .setDescription('Distribue un montant a tous les membres d un role.')
        .addIntegerOption(option => option
            .setName('montant_total')
            .setDescription('Montant total')
            .setMinValue(1)
            .setRequired(true))
        .addIntegerOption(option => option
            .setName('cout_reparation')
            .setDescription('Cout de reparation')
            .setMinValue(0)
            .setRequired(true))
        .addRoleOption(option => option
            .setName('role')
            .setDescription('Role a payer')
            .setRequired(true)),
    async execute(interaction) {
        if (!await requireAdmin(interaction)) return;

        const totalAmount = interaction.options.getInteger('montant_total', true);
        const repairCost = interaction.options.getInteger('cout_reparation', true);
        const role = interaction.options.getRole('role', true);

        if (repairCost > totalAmount) {
            return interaction.reply('Le montant total est insuffisant pour couvrir les couts de reparation.');
        }

        let recipients;
        const targetSummary = `@${role.name}`;
        await interaction.deferReply();

        try {
            recipients = await resolveRoleMembers(interaction);
        } catch (error) {
            console.error(error);
            return interaction.editReply("Impossible de recuperer les membres du role. Verifiez que le Server Members Intent est active dans le Discord Developer Portal.");
        }

        if (recipients.length === 0) {
            return interaction.editReply('Aucun joueur valide a payer dans ce role.');
        }

        const afterRepairs = totalAmount - repairCost;
        const afterTax = Math.floor(afterRepairs * 0.9);
        const sharePerMember = Math.floor(afterTax / recipients.length);
        const remainder = afterTax - (sharePerMember * recipients.length);
        const metadata = {
            totalAmount,
            repairCost,
            afterRepairs,
            afterTax,
            sharePerMember,
            remainder,
            target: targetSummary,
        };

        const batchId = payout({
            actorId: interaction.user.id,
            recipients,
            sharePerMember,
            metadata,
        });

        const embed = buildPayoutEmbed({
            interaction,
            recipients,
            totalAmount,
            repairCost,
            targetSummary,
            batchId,
        });

        await interaction.editReply({ embeds: [embed] });
    },
};
