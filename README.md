# Wiki TCG

Jeu de cartes à collectionner où chaque article de Wikipédia FR devient une carte :
la rareté vient du nombre de lecteurs, l'attaque de la longueur, la défense de la qualité.

Stack : AdonisJS 7 · Inertia + Vue 3 · PostgreSQL 16 · Lucid · Japa.

## Démarrage

```sh
cp .env.example .env          # puis renseigner APP_KEY (node ace generate:key) et WIKIPEDIA_USER_AGENT
docker compose up -d --wait   # Postgres (+ base wiki_tcg_test)
npm install
node ace migration:run
node ace db:seed              # compte local, identifiants dans database/seeders/dev_player_seeder.ts
npm run dev                   # http://localhost:3333
```

`WIKIPEDIA_USER_AGENT` doit identifier l'app et un contact
([politique Wikimedia](https://meta.wikimedia.org/wiki/User-Agent_policy)).

## Commandes utiles

| Commande | Rôle |
| --- | --- |
| `npm test` | Tests unitaires et fonctionnels (Wikipédia est simulé) |
| `npm run typecheck` / `npm run lint` | Vérifications TypeScript et ESLint |
| `node ace cards:calibrate --samples=500 --quality` | Répartition des raretés et stats sur un échantillon réel |
| `node ace cards:calibrate --boosters=2000` | Simule des ouvertures sur le catalogue, à comparer aux taux de drop |
| `node ace cards:harvest --top` / `--random=30` | Ajoute des cartes Rare et mieux au catalogue |
| `node ace scheduler:run` | Process planifié : récolte du top à 3 h UTC, récolte aléatoire chaque heure |

## Où régler le jeu

`config/game.ts` : paliers de rareté (vues/jour), taux de drop par emplacement et carte garantie,
échelles d'attaque et de défense, rythme des boosters.

Chaque emplacement du booster tire d'abord sa rareté, puis prend une carte de cette rareté dans
le tirage aléatoire en direct ou dans le catalogue (table `cards`), sinon descend d'une rareté.
Le catalogue des raretés hautes est alimenté par `cards:harvest`.

## Sources de données

- Wikimedia Pageviews API (`metrics/pageviews/top`) pour les 1 000 articles les plus vus
- MediaWiki Action API (`generator=random`, `pageviews` sur 60 jours, `info`, `pageimages`,
  `description`, catégories « Article de qualité » / « Bon article »)
- Lift Wing `articlequality` (score 0..1 indépendant de la langue) pour les articles sans label

Le contenu des cartes reste sous licence CC BY-SA 4.0 : chaque carte renvoie vers son article.
