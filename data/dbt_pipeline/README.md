# Pipeline DBT du projet PCC

## Qu'est ce que c'est ?

[DBT](https://docs.getdbt.com/) est un orchestrateur SQL, c'est à dire qu'il permet d'éffectuer des requêtes SQL dans un order précis. Ces requêtes SQL peuvent dépendre des résultats des précédentes requêtes, ce qui permet in fine une longue transformation des données initiales, au fil des requêtes, pour obtenir des tables dans le format voulu et avec les croisement de données nécessaires.

## Comment la faire tourner ?

Pour faire tourner le dbt de bout en bout, suivre les étapes suivantes :

_(prérequis) Installer les dépendances du projet,_ en installant uv et en faisant 
```bash
uv sync
```

Installer l'extension duckdb pour les données géographiques:
`uv run python -c "import duckdb; duckdb.connect().execute('INSTALL spatial')"`

-> voir le README du projet pour plus de détails

_(optionnel) Si vous aviez déjà fait tourner le projet, supprimer l'ancienne base de donnée :_
```bash
rm data/dbt_pipeline/dev.duckdb
```

_Télécharger tous les fichiers sources depuis le s3 :_
```bash
uv run python data/utils/download_pipeline_inputs.py
```

_Se placer dans le dossier du projet dbt pour le faire tourner :_
```bash
cd data/dbt_pipeline
```

_Lancer le seed :_
```bash
uv run dbt seed
```

_Lancer le dbt (run sans tests) :_
```bash
uv run dbt run
```

_Lancer le dbt complet avec tests :_
```bash
uv run dbt build
```

_Lancer uniquement mon model :_
```bash
uv run dbt run --select model mon_model.sql
```
_Lancer mon model et ses dépendances :_

**Upstream (models parents)**
```bash
uv run dbt run --select model +mon_model.sql
```
**Downstream (models enfants)**
```bash
uv run dbt run --select model mon_model.sql+
```
**Upstream & Downstream (checkez le lineage)**
```bash
uv run dbt run --select model +mon_model.sql+
```

_Observer le résultat :_

```bash
duckdb --ui dev.duckdb`
```

## Comment ajouter des données ?

DBT permet la transformation des données présentes dans une base de donnée. Avant de pouvoir les transformer, il faut donc les ajouter dans la base de donnée en question.

Dans ce projet nous utilisons au maximum les données dans leur format brut : les CSV et autres fichiers téléchargés sur le web, qui nous mettons à disposition de dbt pour qu'il lise de dans.

### Procédure simple d'import d'un fichier CSV

Dans cette procédure nous allons utiliser le s3 du projet, dans lequel un dossier "pipeline_inputs" a été créé, pour y stocker le CSV, et créer une table via dbt à partir de ce fichier.

- Etape 1 : uploader le fichier sur le s3.

Important : si vous n'avez pas encore les clés, demandez les sur un des canaux mattermost du projet.

Pour uploader le fichier vous pouvez : 

1/ Le faire à la main, en utilisant l'outil de votre choix. Si vous n'avez jamais fait de telles opérations, nous conseillons l'outil cyberduck qui permet de la réaliser facilement, avec une interface. Il faudra créer une nouvelle connection en choisissant bien le format "(Amazon) s3".
Uploader le fichier dans le bucket `qppcc-upload`, dans le dossier /pipeline_inputs de ce bucket.

ou 

2/ utiliser le script python `data/utils/csv_uploader.py` qui upload le fichier donné en argument dans le dossier `data/dbt_pipeline/pipeline_inputs` vers le s3, dans le dossier /pipeline_inputs du bucket.
Attention : il remplace le fichier sur le s3 même s'il existe déjà.

```bash
uv run python data/utils/csv_uploader.py mon_fichier.csv
```


Vous aurez besoin de créer les clés d'accès au s3 et de les ajouter dans un fichier .env à la racine du projet, avec les variables d'environnement suivantes :
```
S3_ACCESS_KEY_ID = la clé projet récupérée
3_SECRET_ACCESS_KEY = la clé secrète projet récupérée 
S3_ENDPOINT_URL = "https://s3.fr-par.scw.cloud"
S3_REGION = "fr-par"
S3_PCC_BUCKET = "qppcc-upload"
```

- Etape 2 : rendre ce fichier public si vous avez chargé le fichier à la main.

C'est important sinon le téléchargement du fichier lors du run de la pipeline ne fonctionnera pas.

La manipulation à faire dépend de l'outil. Sur cyberduck : clic droit sur le fichier, "Share / partager", ok

- Etape 3 : ajouter un modèle dans la pipeline dbt.

Le mieux est de suivre un exemple qui réalise exactement cette opération : https://github.com/dataforgoodfr/14_PrixChangementClimatique/pull/7/changes.

Explication des opérations :
On créé un fichier dans le dossier /models du dbt, cela créera un modèle dbt et donc une table dans notre base de donnée après l'avoir fait tourner. Par convention nous le créant dans le dossier /bronze pour indiquer qu'il s'agit d'une donnée brut.
Ce modèle ne fait qu'un
```sql 
select ... from 'pipeline_inputs/NOM_DE_VOTRE_CSV'
```
il contiendra donc les données de votre CSV.
Enfin on ajoute dans le schema.yml du dossier, qui décrit tous les modèles de ce dossier, la description de notre table ainsi que de tous ses champs importants. Cela permettra aux autres de travailler avec ensuite.

- Etape 4 : enfin on fait tourner le dbt.

En suivant toutes les étapes énnoncées plus haut dans la section "Comment le faire tourner ?"

### Ma PR github est validée, quelle est la suite ?

- A ce moment là je merge.

- vérifier que le worflow github actions "update-dev-duckdb" est bien passé, ce qui signifie que le fichier dev.duckdb a été mis à jour dans le s3 du projet en fonction des modifications apportées sur la PR et des nouveaux fichiers csv chargés. En cas de problème, je peux le faire manuellement : 

  - Je checkout main et je pull le nouveau main (localement).

  - Je fais tourner la pipeline dbt en entier, voir la procédure plus haut.

  - J'obtiens alors un nouveau fichier dev.duckdb dans le dossier data/dbt_pipeline

  - J'upload ce fichier à la place du fichier du même nom dans le s3 du projet (voir la "Procédure simple d'import d'un fichier CSV" plus haut pour voir quel outil utiliser)

  - Je m'assure que le fichier est public (voir plus haut également)


- Je communique sur [le channel Mattermost Data Analyse](https://mattermost.services.dataforgood.fr/data-for-good/channels/14_pcc_dataanalyst) l'ajout de la nouvelle donnée

## Plus de doc svp ?

### Documentation des models dans DBT

- Renseigner à la main les schemas.yml (connaisseur)
ou
- Utiliser le Documentation Editor de l'extension DBT Power User (pour ceux qui ne sont pas familiers avec le schema.yml)
    L'idée est que chacun qui construit un model fasse sa documentation de table et colonnes générées directement.
    Utilisation après installation du plugin (pas besoin de la connexion AItimate proposée par Power User) :
    - Tu runnes ton model DBT une 1ère fois, pour créer la table dans dev.duckdb
    - Tu ouvres ton model DBT.sql concerné
    - Tu cliques sur "sync with database" (attention aux conflits de connexion PID)
    - Tu remplis ta documentation pour la table et les colonnes dans l'UI de l'onglet Documentation Editor

    - (Tu peux aussi ajouter des tests directement ici)
    - Les datatypes sont détectés automatiquement
    - Tu cliques sur Save>Existing file, l'UI va écrire tout ça dans le schema.yml au bon endroit.

(il vaut mieux avoir les noms de tables et colonnes en snake_case avant de commencer la doc)

### Persistance de la documentation et écriture dans les tables de duckdb

dbt persist-docs va écrire la documentation DBT en Database (ce qui est renseigné en schema.yml)
Commandes pour vérifier cette documentation (n'apparait pas l'UI) :
```sql
SELECT comment FROM duckdb_columns() WHERE table_name = 'nom_de_ma_table'
SELECT comment FROM duckdb_tables() WHERE table_name = 'nom_de_ma_table'
```
**Attention**
Un changement de nom de table ou de colonne dans mon model doit être modifié/synchronisé dans le schema.yml associé, sinon persist-docs va vous bloquer le run de votre model
[Si vous avez l'erreur suivante](https://github.com/dbt-labs/dbt-core/issues/4151) :
```
Database Error in model my_model (path/to/my_model.sql)
  column "<col_name>" of relation "my_model" does not exist
  compiled SQL at target/run/path/to/my_model.sql
```
cela signifie qu'un nom défini dans le schema.yml ne correspond pas dans la table générée par votre modèle.

### Macros dans DBT et langage Jinja

Je veux utiliser des macros dans mes models, pour des selects variables de colonne, des transformations en boucle, effectuer des tests de mon model... :
- J'installe les dépendances du projet DBT, avec le package dbt-utils qui contient déjà une multitude de fonctions en macros
```bash
cd data/dbt_pipeline
uv run dbt deps
```

- Pour utiliser du langage Jinja dans mes models, mon VSCode doit détecter ces macros:
    - créer ou aller dans le fichier de config .vscode/settings.json
    - insérer le code suivant :
```json
{
    "files.associations": {
    "*.yml": "jinja-yaml",
    "*.sql": "jinja-sql"
    },
}
```

- Utiliser une macro dans mon model, j'appelle la macro en double accolade :
```jinja-sql
{{ nom_de_macro(param1, param2,....) }}
```

- Exemple pour appeler toutes les colonnes en schéma variable dans un csv avec la macro 'star' (équivalent de select *, adapté à un appel de source par DBT)
```jinja-sql
select 
    {{ dbt_utils.star(from=source('bronze', 'ma_source')) }}
from {{ source('bronze', 'ma_source') }}
```

- Faire une boucle Jinja dans un model DBT
```jinja-sql
{% for '' in [''] %}
    {% if '' %}
        {% set '' %}
    {% endif %}
{% endfor %}
```

### Tests

```bash
uv run dbt test
uv run dbt test --select model mon_model.sql
```

### Open the doc

```bash
- uv run dbt docs generate
- uv run dbt docs serve
```

### Resources
- Learn more about dbt [in the docs](https://docs.getdbt.com/docs/introduction)
- Check out [Discourse](https://discourse.getdbt.com/) for commonly asked questions and answers
- Join the [chat](https://community.getdbt.com/) on Slack for live discussions and support
- Find [dbt events](https://events.getdbt.com) near you
- Check out [the blog](https://blog.getdbt.com/) for the latest news on dbt's development and best practices
