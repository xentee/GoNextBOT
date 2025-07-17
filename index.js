const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');

// Créer une instance du client
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// Définir le préfixe
const prefix = '!';

// Charger les commandes dynamiquement
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// Quand le bot est prêt
client.once('ready', () => {
    console.log(`Bot connecté en tant que ${client.user.tag}`);
});

// Réagir aux messages
client.on('messageCreate', (message) => {
    // Ignorer les messages qui ne sont pas des commandes ou sont envoyés par un bot
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    // Extraire la commande et les arguments
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Trouver la commande correspondante
    const command = client.commands.get(commandName);
    if (!command) return; 

    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('Une erreur est survenue lors de l’exécution de la commande.');
    }
});

// Connecter le bot
const token = '';
client.login(token);
