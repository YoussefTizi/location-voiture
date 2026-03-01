# Location Voiture

Application Next.js pour la gestion et la personnalisation d'un site de location de voitures.

## Stack

- Next.js (App Router)
- TypeScript
- Prisma
- PostgreSQL
- Tailwind CSS

## Démarrage local

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
npm run start
```

## Variables d'environnement

Copier `.env.example` vers `.env` puis renseigner les valeurs.

## Base de données

Prisma est configuré dans `prisma/schema.prisma`.

Commandes utiles :

```sh
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
```
