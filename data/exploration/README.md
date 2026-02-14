# Data analyse / exploration des données

## Prérequis

Avant tout il est important d'installer `uv` et de `uv sync` pour avoir les packages python.
Se référer au [README.md global](../../README.md) pour cela.

## Téléchargement des données à jour

Tout d'abord 2 types de données sont à disposition :

- les données du projet, créées par l'équipe de Data Engineering (depuis leur dossier /data/dbt_pipeline). Elles auront le format d'une base de donnée : dev.duckdb

- les données odis, des données socio-demo provenant d'un projet DataForGood de la saison précédente. Disponibles pour exploration / utilisation, dans la base de donnée odis.duckdb

Pour télécharger ces deux bases de données, lancer le script suivant depuis la racine du projet :

```bash
uv run python data/utils/download.py
```

Les bases de données seront automatiquement téléchargées dans `data/exploration/`.

Enfin, il ne faut pas hésiter à chercher, télécharger et utiliser d'autres données sur le web.

Pareil ne pas hésiter à demander conseil sur le Mattermost pour trouver de telles données, ou à l'équipe Data Engineer du projet pour qu'elle ajoute des données dans la base dev.

## (optionnel) Visualisation des données

Avant de se lancer dans la manipulation, il peut être utile d'explorer les données disponibles dans les deux bases de donnée.

L'ui de duckdb est pratique pour cela. Deux options :

**Option 1 : Si vous avez le CLI DuckDB installé** (`brew install duckdb` sur macOS)

```bash
duckdb data/exploration/dev.duckdb -cmd "ATTACH 'data/exploration/odis.duckdb' AS odis; CALL start_ui();"
```

**Option 2 : Via le script Python** (depuis la racine du projet)

```bash
uv run python data/utils/launch_ui.py
```

Le script va démarrer le serveur DuckDB UI et ouvrir automatiquement votre navigateur. Appuyez sur `Ctrl+C` pour arrêter le serveur.

## Manipulation des données

On peut utiliser n'importe quel outil déjà connu.

3 notebooks d'exemple sont à disposition pour se plonger directement dans les données.

L'ui de duckdb (voir la section précédente de visualisation) propose également des notebooks (attention à bien vérifier comment ils se sauvegardent avant d'aller trop loin).

### Manipulation des données géographiques

Installer l'extension duckdb pour les données géographiques:

`uv run python -c "import duckdb; duckdb.connect().execute('INSTALL spatial')"`