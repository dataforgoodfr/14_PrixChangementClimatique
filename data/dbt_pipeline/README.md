# Pipeline DBT du projet PCC

## Qu'est ce que c'est ?

[DBT](https://docs.getdbt.com/) est un orchestrateur SQL, c'est à dire qu'il permet d'éffectuer des requêtes SQL dans un order précis. Ces requêtes SQL peuvent dépendre des résultats des précédentes requêtes, ce qui permet in fine une longue transformation des données initiales, au fil des requêtes, pour obtenir des tables dans le format voulu et avec les croisement de données nécessaires.

## Comment la faire tourner ?

Pour faire tourner le dbt de bout en bout, suivre les étapes suivantes :

_(prérequis) Installer les dépendances du projet,_ en installant uv et en faisant `uv sync`

-> voir le README du projet pour plus de détails

_(optionnel) Si vous aviez déjà fait tourner le projet, supprimer l'ancienne base de donnée :_

`rm data/dbt_pipeline/dev.duckdb`

_Télécharger tous les fichiers sources depuis le s3 :_

`uv run python data/utils/download_pipeline_inputs.py`

_Se placer dans le dossier du projet dbt pour le faire tourner :_

`cd data/dbt_pipeline`

_Lancer le seed :_

`uv run dbt seed`

_Lancer le dbt :_

`uv run dbt run`

_Observer le résultat :_

`duckdb --ui dev.duckdb`

## Comment ajouter des données ?

DBT permet la transformation des données présentes dans une base de donnée. Avant de pouvoir les transformer, il faut donc les ajouter dans la base de donnée en question.

Dans ce projet nous utilisons au maximum les données dans leur format brut : les CSV et autres fichiers téléchargés sur le web, qui nous mettons à disposition de dbt pour qu'il lise de dans.

### Procédure simple d'import d'un fichier CSV

Dans cette procédure nous allons utiliser le s3 du projet, dans lequel un dossier "pipeline_inputs" a été créé, pour y stocker le CSV, et créer une table via dbt à partir de ce fichier.

- Etape 1 : uploader le fichier sur le s3.

Important : si vous n'avez pas encore les clés, demandez les sur un des canaux mattermost du projet.

Pour uploader le fichier il vous faudra le faire à la main, en utilisant l'outil de votre choix. Si vous n'avez jamais fait de telles opérations, nous conseillons l'outil cyberduck qui permet de la réaliser facilement, avec une interface. Il faudra créer une nouvelle connection en choisissant bien le format "(Amazon) s3".

Uploader le fichier dans le bucket `qppcc-upload`, dans le dossier /pipeline_inputs de ce bucket.

- Etape 2 : rendre ce fichier public.

C'est important sinon le téléchargement du fichier lors du run de la pipeline ne fonctionnera pas.

La manipulation à faire dépend de l'outil. Sur cyberduck : clic droit sur le fichier, "Share / partager", ok

- Etape 3 : ajouter un modèle dans la pipeline dbt.

Le mieux est de suivre un exemple qui réalise exactement cette opération : https://github.com/dataforgoodfr/14_PrixChangementClimatique/pull/7/changes.

Explication des opérations :
On créé un fichier dans le dossier /models du dbt, cela créera un modèle dbt et donc une table dans notre base de donnée après l'avoir fait tourner. Par convention nous le créant dans le dossier /bronze pour indiquer qu'il s'agit d'une donnée brut.
Ce modèle ne fait qu'un `select ... from 'pipeline_inputs/NOM_DE_VOTRE_CSV'`, il contiendra donc les données de votre CSV.
Enfin on ajoute dans le schema.yml du dossier, qui décrit tous les modèles de ce dossier, la description de notre table ainsi que de tous ses champs importants. Cela permettra aux autres de travailler avec ensuite.

- Etape 4 : enfin on fait tourner le dbt.

En suivant toutes les étapes énnoncées plus haut dans la section "Comment le faire tourner ?"

### Ma PR github est validé, qu'elle est la suite ?

- A ce moment là je merge.

- Puis je checkout main et je pull le nouveau main (localement).

- Je fais tourner la pipeline dbt en entier, voir la procédure plus haut.

- J'obtiens alors un nouveau fichier dev.duckdb dans le dossier data/dbt_pipeline

- J'upload ce fichier à la place du fichier du même nom dans le s3 du projet (voir la "Procédure simple d'import d'un fichier CSV" plus haut pour voir quel outil utiliser)

- Je m'assure que le fichier est publique (voir plus haut également)

- Je communique sur [le channel Mattermost Data Analyse](https://mattermost.services.dataforgood.fr/data-for-good/channels/14_pcc_dataanalyst) l'ajout de la nouvelle donnée

## Plus de doc svp ?

### Tests

- un run dbt test

### Open the doc

- uv run dbt docs generate
- uv run dbt docs serve

### Resources
- Learn more about dbt [in the docs](https://docs.getdbt.com/docs/introduction)
- Check out [Discourse](https://discourse.getdbt.com/) for commonly asked questions and answers
- Join the [chat](https://community.getdbt.com/) on Slack for live discussions and support
- Find [dbt events](https://events.getdbt.com) near you
- Check out [the blog](https://blog.getdbt.com/) for the latest news on dbt's development and best practices
