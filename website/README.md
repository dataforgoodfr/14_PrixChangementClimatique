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
- `npm run init-dev-data`: Lance un script de récupération et de génération de donnnées pour le développement (voir [Script de récupération et de génération de données](#script-de-recuperation-et-de-generation-de donnees))
 
## Script de récupération et de génération de données

### Objectif

Ce script permet de faciliter la récupération d'un fichier GeoJSON des communes de France à partir du [portail public Huwise (ex-Opendatasoft)](https://public.opendatasoft.com/explore/assets/georef-france-commune/) et de générer une base de données de tuiles vectorielles au format PMTiles.

### Prérequis

- `curl`
- `tippecanoe` version v2.79.0 (voir les [instructions d'installation](https://github.com/felt/tippecanoe?tab=readme-ov-file#installation))

### Étapes à suivre avant de lancer la commande

- Rendre le fichier de script exécutable

```bash
chmod +x ./scripts/init-dev-data.sh
```
- Vérifier que `tippecanoe` est bien disponible sur votre système
```bash
tippecanoe --version
```
- Lancer la commande `npm`
```bash
npm run init-dev-data
```
