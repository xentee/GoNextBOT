module.exports = {
    name: 'guide',
    description: 'Affiche le guide des commandes disponibles',
    execute(message) {
        const guide = `
**Guide d'utilisation du Bot**
\`!payout <montant_total> <coût_réparation> <@membres...>\`
Distribue le montant total spécifié entre les membres mentionnés après déduction des coûts de réparation et des taxes. (Maître de Guilde, Bras droit, Officier, Banquier uniquement)

\`!balance <@membre>\`
Affiche la balance du membre mentionné.

\`!bal\`
Affiche votre propre balance.

\`!addbal <@membre> <montant>\`
Ajoute le montant spécifié à la balance du membre mentionné. (Maître de Guilde, Bras droit, Officier, Banquier uniquement)

\`!removebal <@membre> <montant>\`
Retire le montant spécifié de la balance du membre mentionné, s'il a assez de solde. (Maître de Guilde, Bras droit, Officier, Banquier uniquement)

\`!clearbal <@membre>\`
Réinitialise la balance du membre mentionné. (Maître de Guilde, Bras droit, Officier, Banquier uniquement)

\`!topbal\`
Affiche le classement des 10 plus grosses balances.


        `;
        message.channel.send(guide);
    },
};
