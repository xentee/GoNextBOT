# GoNextBOT

## Commandes disponibles

### 🎯 Général
#### `!guide`
- **Description** : Affiche le guide d'utilisation de toutes les commandes du bot.
- **Usage** : `!guide`
- **Permissions** : Aucune.

---

### 💰 Gestion des Balances
#### `!bal`
- **Description** : Consulte votre propre balance.
- **Usage** : `!bal`
- **Permissions** : Aucune.

#### `!balance <@membre>`
- **Description** : Consulte la balance d'un membre mentionné.
- **Usage** : `!balance <@membre>`
- **Exemple** : `!balance @MembreExemple`
- **Permissions** : Aucune.

#### `!topbal`
- **Description** : Affiche les 10 membres ayant les plus grosses balances.
- **Usage** : `!topbal`
- **Permissions** : Aucune.

---

### 📋 Commandes Administratives
Ces commandes nécessitent un rôle spécifique pour être utilisées.

#### `!addbal <@membre> <montant>`
- **Description** : Ajoute un montant à la balance d'un membre mentionné.
- **Usage** : `!addbal <@membre> <montant>`
- **Exemple** : `!addbal @MembreExemple 100`
- **Permissions** : Rôle `Admin` ou identifiant de rôle configuré.

#### `!removebal <@membre> <montant>`
- **Description** : Retire un montant à la balance d'un membre mentionné.
- **Usage** : `!removebal <@membre> <montant>`
- **Exemple** : `!removebal @MembreExemple 50`
- **Permissions** : Rôle `Admin` ou identifiant de rôle configuré.

#### `!clearbal <@membre>`
- **Description** : Réinitialise la balance d'un membre mentionné à 0.
- **Usage** : `!clearbal <@membre>`
- **Exemple** : `!clearbal @MembreExemple`
- **Permissions** : Rôle `Admin` ou identifiant de rôle configuré.

#### `!payout <montant_total> <coût_réparation> <@membres...>`
- **Description** : Distribue un montant total entre plusieurs membres après soustraction des coûts de réparation et d'une taxe de 10 %.
- **Usage** : `!payout <montant_total> <coût_réparation> <@membres...>`
- **Exemple** : `!payout 1000 200 @Membre1 @Membre2`
- **Détails** :
  - Le montant restant est divisé également entre tous les membres mentionnés.
- **Permissions** : Rôle `Admin` ou identifiant de rôle configuré.

---

## Permissions et restrictions

Certaines commandes sont réservées aux membres ayant des rôles spécifiques. Voici les rôles nécessaires pour chaque commande administrative :

- **Commandes nécessitant un rôle spécifique** :
  - `!addbal`, `!removebal`, `!clearbal`, et `!payout` : Rôle **Admin** (ou équivalent configuré par l'identifiant de rôle dans le code).

---

## Notes techniques
- Les balances sont sauvegardées de manière persistante dans un fichier ou une base de données.
- Les calculs pour les taxes et répartitions sont réalisés automatiquement.
- Les membres doivent être mentionnés correctement pour certaines commandes (ex. : `@MembreExemple`).
