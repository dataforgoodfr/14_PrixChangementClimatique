### Run the projet

Pour faire tourner le dbt de bout en bout, suivre les étapes suivantes :

(optionnel) Si vous aviez déjà fait tourner le projet, supprimer l'ancienne base de donnée :

`rm data/dbt_pipeline/dev.duckdb`

Télécharger tous les fichiers sources depuis le s3 :

`uv run python data/utils/download_pipeline_inputs.py`

Se placer dans le dossier du projet dbt pour le faire tourner :

`cd data/dbt_pipeline`

Lancer le seed :

`uv run dbt seed`

Lancer le dbt :

`uv run dbt run`

Observer le résultat :

`duckdb --ui dev.duckdb`


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
