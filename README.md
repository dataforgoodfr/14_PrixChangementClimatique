# Prix du Changement Climatique

Bienvenue dans ce projet qui fait partie de la saison 14 de Data For Good.

Rejoignez-nous sur notre channel Mattermost `~14_PrixChangementClimatique_Onboarding` pour rejoindre le projet ou poser vos questions !

## Structure du projet

Ce projet est divisé en plusieurs parties :

- **`/data`** : Exploration de données et pipeline dbt - voir [data/README.md](data/README.md)
- **`/website`** : Site web Next.js - voir [website/README.md](website/README.md)

# Contributing

## Installation

- [Installation de Python](#installation-de-python)

Ce projet utilise [uv](https://docs.astral.sh/uv/) pour la gestion des dépendances Python. Il est préréquis pour l'installation de ce projet.

Une fois installé, il suffit de lancer la commande suivante pour installer la version de Python adéquate, créer un environnement virtuel et installer les dépendances du projet.

```bash
uv sync
```

A l'usage, utilisez la commande `uv run ...` (au lieu de `python ...`) pour lancer un script Python. Par exemple:

```bash
uv run data/example_script.py
```

## Lancer les precommit-hook localement

[Installer les precommit](https://pre-commit.com/)

    pre-commit run --all-files

## Utiliser Tox pour tester votre code

    tox -vv

## Déploiement Docker

Le site web peut être construit et lancé via Docker.

Prérequis — préparer les fichiers injectés dans l'image :

```bash
# 1. Télécharger la base DuckDB depuis S3
uv run python data/utils/download.py

# 2. Générer les tuiles vectorielles PMTiles
uv run python data/utils/build_pmtiles.py
```

Build (depuis la racine du projet) :

```bash
docker build -t pcc-website .
```

Lancer le container :

```bash
docker run --rm -p 3000:3000 pcc-website
```

Puis ouvrir http://localhost:3000.
