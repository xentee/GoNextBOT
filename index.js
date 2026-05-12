const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { token, guildId } = require('./utils/config');
const { initDatabase } = require('./utils/store');

initDatabase();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
    ],
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    client.commands.set(command.data.name, command);
}

async function registerCommands() {
    const commandData = client.commands.map(command => command.data.toJSON());

    if (guildId) {
        const guild = await client.guilds.fetch(guildId);
        await guild.commands.set(commandData);
        await client.application.commands.set([]);
        console.log(`Slash commands enregistrees pour le serveur ${guildId}: ${client.commands.map(command => command.data.name).join(', ')}`);
        console.log('Slash commands globales nettoyees pour eviter les doublons.');
        return;
    }

    await client.application.commands.set(commandData);
    console.log(`Slash commands globales enregistrees: ${client.commands.map(command => command.data.name).join(', ')}`);
    console.log('Conseil dev: definis DISCORD_GUILD_ID dans .env pour enregistrer les commandes instantanement sur ton serveur.');
}

client.once('ready', async () => {
    console.log(`Bot connecte en tant que ${client.user.tag}`);

    try {
        await registerCommands();
    } catch (error) {
        console.error('Impossible d enregistrer les slash commands:', error);
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    console.log(`Commande recue: /${interaction.commandName} par ${interaction.user.tag}`);

    const command = client.commands.get(interaction.commandName);
    if (!command) {
        await interaction.reply({
            content: 'Commande inconnue par le bot. Redemarre le bot pour resynchroniser les commandes.',
            ephemeral: true,
        });
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);

        const response = {
            content: "Une erreur est survenue lors de l'execution de la commande.",
            ephemeral: true,
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(response);
        } else {
            await interaction.reply(response);
        }
    }
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

client.login(token);
