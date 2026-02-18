-- datactivist_commune.sql

SELECT 
    nom,
    SIREN AS siren,
    COG AS cog,
    type, 
    code_departement,
    code_departement_3digits,
    code_region,
    population,
    code_postal
FROM 
    'pipeline_inputs/identifiants-communes-2024.csv'
