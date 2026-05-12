# GoNextBOT

Bot Discord de gestion de balances en silvers.

## Installation

```bash
npm install
```

Copiez `.env.example` vers `.env`, puis renseignez :

```env
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_GUILD_ID=
ADMIN_ROLE_IDS=
ADMIN_ROLE_NAMES=Admin
```

`DISCORD_GUILD_ID` est optionnel, mais recommande pendant le developpement : les slash commands apparaissent instantanement sur ce serveur. Sans lui, elles sont enregistrees globalement et peuvent mettre du temps a apparaitre.

Dans le Discord Developer Portal, activez :

- Server Members Intent, pour payer tous les membres d'un role avec `/payout`.

`Message Content Intent` n'est plus necessaire, car le bot utilise des slash commands.

Pour inviter le bot, l'URL OAuth2 doit inclure ces scopes :

- `bot`
- `applications.commands`

## Demarrage

```bash
npm start
```

Au demarrage, le bot enregistre automatiquement les slash commands.

## Commandes

### General

#### `/guide`
Affiche le guide des commandes.

#### `/ping`
Verifie que le bot repond. Necessite les permissions admin du bot.

### Balances

#### `/bal`
Affiche votre balance.

#### `/balance membre:@membre`
Affiche la balance du membre selectionne.

#### `/topbal`
Affiche les 10 plus grosses balances.

### Administration

Ces commandes demandent un role configure dans `ADMIN_ROLE_IDS`, `ADMIN_ROLE_NAMES`, ou la permission Discord `Administrator`.

#### `/addbal membre:@membre montant:100`
Ajoute un montant a la balance du membre.

#### `/removebal membre:@membre montant:50`
Retire un montant de la balance du membre si son solde le permet.

#### `/clearbal membre:@membre`
Reinitialise la balance du membre a 0.

#### `/payout montant_total:1000 cout_reparation:200 role:@Joueurs`
Distribue le montant a tous les membres non-bots du role.

### Audit

Ces commandes demandent aussi les permissions admin du bot.

#### `/history membre:@membre`
Affiche l'historique pagine d'un membre avec boutons precedent/suivant. Chaque ligne indique aussi qui a realise la transaction.

#### `/lastpayout`
Affiche le dernier payout enregistre.

## Stockage

Les balances et transactions sont stockees dans `data.sqlite`. Au premier demarrage, si la base est vide, le bot importe automatiquement les soldes presents dans `balances.json`.
