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

## Données - Extraction BD TOPO

Pour extraire les bâtiments de la BD TOPO IGN (incluant les DROMs) et générer un fichier Parquet avec centroids et codes communes :

1.  Assurez-vous d'avoir `7zz` installé (ex: `brew install sevenzip`).
2.  Placez les archives `.7z` (ou `.7z.001`) dans `data/csv_large/BDTOPO/`.
3.  Lancez le script d'extraction :

```bash
# Pour un test sur Mayotte (PoC)
uv run scripts/extract_bdtopo_buildings.py --territory MYT

# Pour le traitement complet national
uv run scripts/extract_bdtopo_buildings.py
```

Le fichier final sera généré dans `data/csv_large/france_all_bats_clean.parquet`.

## Lancer les precommit-hook localement
...
