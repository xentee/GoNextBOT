const { PermissionFlagsBits } = require('discord.js');
const { adminRoleIds, adminRoleNames } = require('./config');

function hasConfiguredAdminRole(member) {
    if (!member?.roles?.cache) return false;

    if (adminRoleIds.length > 0 && member.roles.cache.some(role => adminRoleIds.includes(role.id))) {
        return true;
    }

    return adminRoleNames.length > 0
        && member.roles.cache.some(role => adminRoleNames.includes(role.name));
}

function canRunAdminCommand(interaction) {
    return hasConfiguredAdminRole(interaction.member)
        || interaction.memberPermissions?.has(PermissionFlagsBits.Administrator);
}

async function requireAdmin(interaction) {
    if (canRunAdminCommand(interaction)) return true;

    await interaction.reply({
        content: "Vous n'avez pas la permission d'utiliser cette commande.",
        ephemeral: true,
    });

    return false;
}

module.exports = { requireAdmin };
