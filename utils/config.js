const fs = require('fs');
const path = require('path');

function loadDotEnv(filePath = path.join(__dirname, '..', '.env')) {
    if (!fs.existsSync(filePath)) return;

    const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
        if (!match) continue;

        const [, key, rawValue] = match;
        if (process.env[key] !== undefined) continue;

        process.env[key] = rawValue.trim().replace(/^['"]|['"]$/g, '');
    }
}

function splitCsv(value) {
    return (value || '')
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
}

loadDotEnv();

const token = process.env.DISCORD_TOKEN;

if (!token) {
    throw new Error('DISCORD_TOKEN is missing. Create a .env file from .env.example and set your bot token.');
}

module.exports = {
    token,
    guildId: process.env.DISCORD_GUILD_ID || '',
    adminRoleIds: splitCsv(process.env.ADMIN_ROLE_IDS),
    adminRoleNames: splitCsv(process.env.ADMIN_ROLE_NAMES || 'Admin'),
};
