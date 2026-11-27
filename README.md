# Atelier du Bois

Boutique en ligne de meubles artisanaux en bois, payable en Pi (Pi Network).

## Structure

- `web/` : frontend React + TypeScript + Tailwind (Vite)
- `server/` : API Node + Express + TypeScript, Prisma + PostgreSQL

## Démarrage local

1. Installer Node 22 ou plus récent.
2. `npm install` à la racine.
3. Copier `.env.example` vers `server/.env` et `web/.env`, puis remplir les valeurs.
4. `npm run db:migrate -w server` pour créer les tables.
5. Deux terminaux : `npm run dev:server` et `npm run dev:web`.

Le SDK Pi ne fonctionne que dans Pi Browser. Dans Chrome, le catalogue s'affiche mais la connexion Pi est impossible.

## Règles Pi respectées

- `Pi.init` appelé avant tout autre appel du SDK, avec `sandbox` réglé par `VITE_PI_SANDBOX`.
- Le navigateur n'envoie que l'`accessToken`. Le serveur le vérifie auprès de l'API Pi.
- La clé `PI_API_KEY` reste uniquement côté serveur.
- Les montants sont toujours calculés côté serveur.

## Avancement

Étapes 1 et 3 faites (architecture, schéma de base). Prochaines : API catalogue/panier, pages, admin, paiements.
