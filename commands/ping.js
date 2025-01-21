module.exports = {
    name: 'ping', // Nom de la commande
    description: 'Répond avec Pong!', // Description
    execute(message, args) {
        message.reply('Pong ! 🏓');
    },
};
