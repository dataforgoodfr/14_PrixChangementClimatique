Ceci est un projet [Next.js](https://nextjs.org) créé avec [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Prérequis

- Node.js 20 ou supérieur
- npm (inclus avec Node.js)

## Installation

Installez les dépendances du projet :

```bash
npm install
```

## Lancer le site en développement

Démarrez le serveur de développement :

```bash
npm run dev
```

Le site sera accessible à l'adresse [http://localhost:3000](http://localhost:3000).

## Autres commandes

- `npm run build` : Génère une version optimisée pour la production
- `npm run start` : Lance le serveur de production (nécessite d'avoir exécuté `npm run build` au préalable)
- `npm run lint` : Vérifie la qualité du code avec ESLint

## Générer les données PMTiles

Les tuiles vectorielles sont générées à partir de la table `resultats_website_par_commune` dans la base DuckDB du projet.

### Prérequis

- `uv` (voir les [instructions d'installation](https://docs.astral.sh/uv/getting-started/installation/))
- `tippecanoe` (voir les [instructions d'installation](https://github.com/felt/tippecanoe?tab=readme-ov-file#installation)) **ou** Docker
- Le fichier `data/exploration/dev.duckdb` présent localement (voir `data/utils/download.py`)

### Lancer la génération

Depuis la racine du projet, exécutez la commande suivante :

```bash
uv run data/utils/build_pmtiles.py
```

Le fichier `website/public/pmtiles/communes.pmtiles` est généré à partir des données de DuckDB et peut être utilisé pour alimenter la carte interactive du site.
