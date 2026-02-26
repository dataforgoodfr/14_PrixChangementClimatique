-- datactivist_commune.sql

SELECT
    nom,
    siren,
    cog,
    type,
    code_departement,
    code_departement_3digits,
    code_region,
    population,
    code_postal
FROM
    'pipeline_inputs/identifiants-communes-2024.csv'
