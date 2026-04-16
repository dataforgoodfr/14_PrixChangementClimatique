-- indice_par_commune.sql
-- Gold layer: Table des scores et indices par commune avec valeurs randoms temporaires
-- Source: Bronze layer opendatasoft_communes + random

SELECT
    code_geo,
    -- KPI temporaires: génère des valeurs aléatoires entre 0 et 1
    CAST(RANDOM() AS FLOAT) AS score_economique,
    CAST(RANDOM() AS FLOAT) AS score_georisque,
    CAST(RANDOM() AS FLOAT) AS score_assurance,
    CAST(RANDOM() AS FLOAT) AS indice_vulnerabilite,
    -- KPI temporaires: génère des valeurs aléatoires entières entre 1 et 5
    CAST(FLOOR(1 + (RANDOM() * 5)) AS INT) AS indice_vulnerabilite_niveau
FROM {{ ref('opendatasoft_communes') }}
